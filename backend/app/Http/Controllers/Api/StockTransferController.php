<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Inventory;
use App\Services\DocumentNumberService;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use App\Exceptions\BusinessRuleException;

class StockTransferController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $transfers = StockTransfer::with(['sourceLocation', 'destinationLocation', 'initiator', 'receiver', 'items.product'])
            ->latest()
            ->paginate(15);

        return response()->json($transfers);
    }

    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'source_location_id' => 'required|exists:locations,id|different:destination_location_id',
            'destination_location_id' => 'required|exists:locations,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $transfer = DB::transaction(function () use ($validated, $request) {
            $transferNumber = DocumentNumberService::generateTransferNumber();

            // Validate source stock
            foreach ($validated['items'] as $item) {
                $inv = Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $validated['source_location_id'])
                    ->first();

                if (!$inv || $inv->available < $item['quantity']) {
                    throw new BusinessRuleException("Insufficient stock at sending location for product ID: {$item['product_id']}");
                }
            }

            $transfer = StockTransfer::create([
                'transfer_number' => $transferNumber,
                'source_location_id' => $validated['source_location_id'],
                'destination_location_id' => $validated['destination_location_id'],
                'status' => 'pending',
                'initiated_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                StockTransferItem::create([
                    'transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'quantity_dispatched' => $item['quantity'],
                ]);
            }

            return $transfer;
        });

        return response()->json([
            'message' => 'Stock transfer request created.',
            'transfer' => $transfer->load('items.product'),
        ], 201);
    }

    public function dispatch(Request $request, $id)
    {
        DB::transaction(function () use ($id, $request) {
            // Lock the transfer row so two clicks cannot dispatch it twice
            $transfer = StockTransfer::with('items')->lockForUpdate()->findOrFail($id);

            if ($transfer->status !== 'pending') {
                throw new BusinessRuleException('Only pending transfers can be marked as dispatched.');
            }

            foreach ($transfer->items as $item) {
                $this->inventoryService->transferOut(
                    $item->product_id,
                    $transfer->source_location_id,
                    $item->quantity_dispatched,
                    $transfer->transfer_number,
                    $request->user()->id
                );
            }

            $transfer->update([
                'status' => 'dispatched',
                'dispatched_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Transfer marked as dispatched and items in transit.']);
    }

    public function receive(Request $request, $id)
    {
        $transfer = $this->inventoryService->completeTransfer((int) $id, $request->user()->id);

        return response()->json([
            'message' => 'Transfer confirmed as received and stock updated at destination branch.',
            'transfer' => $transfer->load('items.product'),
        ]);
    }
}
