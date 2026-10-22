<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\PurchaseRecord;
use App\Models\PurchaseRecordItem;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use App\Exceptions\BusinessRuleException;

class InventoryService
{
    /**
     * Deduct stock from the source branch when a transfer is dispatched.
     * Recorded as transfer_out (not a sale) and does not touch customer reservations.
     */
    public function transferOut(int $productId, int $locationId, int $quantity, string $transferNumber, int $userId): void
    {
        DB::transaction(function () use ($productId, $locationId, $quantity, $transferNumber, $userId) {
            $inv = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->firstOrFail();

            $available = $inv->quantity_on_hand - $inv->quantity_reserved;
            if ($available < $quantity) {
                throw new BusinessRuleException("Insufficient available stock to dispatch product ID {$productId}. Available: {$available}.");
            }

            $before = $inv->quantity_on_hand;
            $after = $before - $quantity;
            $inv->update(['quantity_on_hand' => $after]);

            StockMovement::create([
                'product_id' => $productId,
                'location_id' => $locationId,
                'user_id' => $userId,
                'movement_type' => 'transfer_out',
                'quantity' => -$quantity,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reference_number' => $transferNumber,
                'reason' => "Dispatched on transfer {$transferNumber}",
            ]);
        }, 5);
    }

    /**
     * Destination branch confirms receipt of a dispatched transfer.
     */
    public function completeTransfer(int $transferId, int $receivedByUserId): StockTransfer
    {
        return DB::transaction(function () use ($transferId, $receivedByUserId) {
            $transfer = StockTransfer::with(['items', 'sourceLocation'])->lockForUpdate()->findOrFail($transferId);

            if ($transfer->status !== 'dispatched') {
                throw new BusinessRuleException('Only dispatched transfers can be marked as received.');
            }

            foreach ($transfer->items as $item) {
                Inventory::firstOrCreate(
                    ['product_id' => $item->product_id, 'location_id' => $transfer->destination_location_id],
                    ['quantity_on_hand' => 0, 'quantity_reserved' => 0]
                );

                $inv = Inventory::where('product_id', $item->product_id)
                    ->where('location_id', $transfer->destination_location_id)
                    ->lockForUpdate()
                    ->first();

                $before = $inv->quantity_on_hand;
                $after = $before + $item->quantity_dispatched;
                $inv->update(['quantity_on_hand' => $after]);

                $item->update(['quantity_received' => $item->quantity_dispatched]);

                StockMovement::create([
                    'product_id' => $item->product_id,
                    'location_id' => $transfer->destination_location_id,
                    'user_id' => $receivedByUserId,
                    'movement_type' => 'transfer_in',
                    'quantity' => $item->quantity_dispatched,
                    'quantity_before' => $before,
                    'quantity_after' => $after,
                    'reference_number' => $transfer->transfer_number,
                    'reason' => "Received from {$transfer->sourceLocation->name}",
                ]);
            }

            $transfer->update([
                'status' => 'received',
                'received_by' => $receivedByUserId,
                'received_at' => now(),
            ]);

            return $transfer;
        }, 5);
    }

    /**
     * Reserve stock atomically upon order placement
     */
    public function reserveStock(int $productId, int $locationId, int $quantity): void
    {
        DB::transaction(function () use ($productId, $locationId, $quantity) {
            $inventory = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->firstOrFail();

            $available = $inventory->quantity_on_hand - $inventory->quantity_reserved;
            if ($available < $quantity) {
                throw new BusinessRuleException("Insufficient stock. Only {$available} unit(s) available at this branch.");
            }

            $inventory->increment('quantity_reserved', $quantity);
        }, 5);
    }

    /**
     * Release reserved stock on order cancellation
     */
    public function releaseReservedStock(int $productId, int $locationId, int $quantity): void
    {
        DB::transaction(function () use ($productId, $locationId, $quantity) {
            $inventory = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->first();

            if ($inventory) {
                $newReserved = max(0, $inventory->quantity_reserved - $quantity);
                $inventory->update(['quantity_reserved' => $newReserved]);
            }
        }, 5);
    }

    /**
     * Deduct stock permanently on sale confirmation / dispatch
     */
    public function deductStockForSale(int $productId, int $locationId, int $quantity, string $orderNumber, ?int $userId = null): void
    {
        DB::transaction(function () use ($productId, $locationId, $quantity, $orderNumber, $userId) {
            $inventory = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($inventory->quantity_on_hand < $quantity) {
                throw new BusinessRuleException("Physical stock deficit detected for product ID: {$productId}");
            }

            $before = $inventory->quantity_on_hand;
            $after = $before - $quantity;
            $newReserved = max(0, $inventory->quantity_reserved - $quantity);

            $inventory->update([
                'quantity_on_hand' => $after,
                'quantity_reserved' => $newReserved,
            ]);

            StockMovement::create([
                'product_id' => $productId,
                'location_id' => $locationId,
                'user_id' => $userId,
                'movement_type' => 'sale',
                'quantity' => -$quantity,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reference_number' => $orderNumber,
                'reason' => 'Customer Sale Order ' . $orderNumber,
            ]);
        }, 5);
    }

    /**
     * Record stock-in from supplier
     */
    public function recordStockIn(int $supplierId, int $locationId, array $items, string $supplierInvoiceRef, int $userId): PurchaseRecord
    {
        return DB::transaction(function () use ($supplierId, $locationId, $items, $supplierInvoiceRef, $userId) {
            $purRef = DocumentNumberService::generatePurchaseReference();
            $totalCost = 0.0;

            foreach ($items as $item) {
                $totalCost += ($item['quantity'] * $item['unit_cost']);
            }

            $purchase = PurchaseRecord::create([
                'purchase_reference' => $purRef,
                'supplier_id' => $supplierId,
                'location_id' => $locationId,
                'total_cost' => $totalCost,
                'supplier_invoice_ref' => $supplierInvoiceRef,
                'received_by' => $userId,
            ]);

            foreach ($items as $item) {
                PurchaseRecordItem::create([
                    'purchase_record_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity_received' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $item['quantity'] * $item['unit_cost'],
                ]);

                $inv = Inventory::firstOrCreate(
                    ['product_id' => $item['product_id'], 'location_id' => $locationId],
                    ['quantity_on_hand' => 0, 'quantity_reserved' => 0]
                );

                $inv = Inventory::where('id', $inv->id)->lockForUpdate()->first();
                $before = $inv->quantity_on_hand;
                $after = $before + $item['quantity'];

                $inv->update(['quantity_on_hand' => $after]);

                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'location_id' => $locationId,
                    'user_id' => $userId,
                    'movement_type' => 'stock_in',
                    'quantity' => $item['quantity'],
                    'quantity_before' => $before,
                    'quantity_after' => $after,
                    'reference_number' => $purRef,
                    'reason' => "Stock in from supplier (Ref: {$supplierInvoiceRef})",
                ]);
            }

            return $purchase;
        }, 5);
    }

    /**
     * Stock adjustment (physical stock count vs system count)
     */
    public function adjustStock(int $productId, int $locationId, int $newPhysicalCount, string $reason, int $userId): void
    {
        DB::transaction(function () use ($productId, $locationId, $newPhysicalCount, $reason, $userId) {
            $inv = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->firstOrFail();

            $before = $inv->quantity_on_hand;
            $diff = $newPhysicalCount - $before;

            $inv->update(['quantity_on_hand' => $newPhysicalCount]);

            $ref = 'ADJ-' . date('YmdHis');
            StockMovement::create([
                'product_id' => $productId,
                'location_id' => $locationId,
                'user_id' => $userId,
                'movement_type' => 'adjustment',
                'quantity' => $diff,
                'quantity_before' => $before,
                'quantity_after' => $newPhysicalCount,
                'reference_number' => $ref,
                'reason' => $reason,
            ]);

            AuditLog::create([
                'user_id' => $userId,
                'action' => 'STOCK_ADJUSTMENT',
                'entity_type' => 'Inventory',
                'entity_id' => $inv->id,
                'old_values' => ['quantity_on_hand' => $before],
                'new_values' => ['quantity_on_hand' => $newPhysicalCount, 'reason' => $reason],
            ]);
        }, 5);
    }

    /**
     * Record damaged, lost or returned stock
     */
    public function recordLossOrDamage(int $productId, int $locationId, int $quantity, string $type, string $reason, int $userId): void
    {
        DB::transaction(function () use ($productId, $locationId, $quantity, $type, $reason, $userId) {
            $inv = Inventory::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($inv->quantity_on_hand < $quantity) {
                throw new BusinessRuleException("Cannot record damage/loss greater than existing stock.");
            }

            $before = $inv->quantity_on_hand;
            $after = $before - $quantity;

            $inv->update(['quantity_on_hand' => $after]);

            StockMovement::create([
                'product_id' => $productId,
                'location_id' => $locationId,
                'user_id' => $userId,
                'movement_type' => in_array($type, ['damage', 'loss']) ? $type : 'damage',
                'quantity' => -$quantity,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reference_number' => strtoupper($type) . '-' . date('YmdHis'),
                'reason' => $reason,
            ]);
        }, 5);
    }
}
