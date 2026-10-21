<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Location;
use App\Models\StockMovement;
use App\Services\InventoryService;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Real-time Multi-Location Inventory Matrix
     */
    public function matrix(Request $request)
    {
        $locations = Location::where('is_active', true)->get();
        $products = Product::with(['inventory.location', 'category'])
            ->where('is_active', true)
            ->get();

        $matrix = $products->map(function ($product) use ($locations) {
            $locStocks = [];
            $totalOnHand = 0;
            $totalReserved = 0;

            foreach ($locations as $loc) {
                $inv = $product->inventory->firstWhere('location_id', $loc->id);
                $hand = $inv ? $inv->quantity_on_hand : 0;
                $res = $inv ? $inv->quantity_reserved : 0;
                $locStocks[$loc->code] = [
                    'location_id' => $loc->id,
                    'name' => $loc->name,
                    'on_hand' => $hand,
                    'reserved' => $res,
                    'available' => max(0, $hand - $res),
                ];
                $totalOnHand += $hand;
                $totalReserved += $res;
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category->name ?? 'Uncategorized',
                'selling_price' => (float) $product->selling_price,
                'min_stock_alert' => $product->min_stock_alert,
                'total_on_hand' => $totalOnHand,
                'total_available' => max(0, $totalOnHand - $totalReserved),
                'status' => ($totalOnHand - $totalReserved <= 0) ? 'Out of Stock' : (($totalOnHand - $totalReserved <= $product->min_stock_alert) ? 'Low Stock' : 'In Stock'),
                'branches' => $locStocks,
            ];
        });

        return response()->json([
            'locations' => $locations,
            'inventory' => $matrix,
        ]);
    }

    /**
     * Stock In from Supplier
     */
    public function stockIn(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'location_id' => 'required|exists:locations,id',
            'supplier_invoice_ref' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $purchase = $this->inventoryService->recordStockIn(
            $validated['supplier_id'],
            $validated['location_id'],
            $validated['items'],
            $validated['supplier_invoice_ref'],
            $request->user()->id
        );

        return response()->json([
            'message' => 'Stock-in recorded successfully and inventory balances updated.',
            'purchase' => $purchase->load('items.product'),
        ], 201);
    }

    /**
     * Stocktaking Adjustment
     */
    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'location_id' => 'required|exists:locations,id',
            'new_physical_count' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',
        ]);

        $this->inventoryService->adjustStock(
            $validated['product_id'],
            $validated['location_id'],
            $validated['new_physical_count'],
            $validated['reason'],
            $request->user()->id
        );

        return response()->json(['message' => 'Stock adjustment recorded successfully.']);
    }

    /**
     * Record Damaged or Lost Stock
     */
    public function recordLossOrDamage(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'location_id' => 'required|exists:locations,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:damage,loss',
            'reason' => 'required|string',
        ]);

        $this->inventoryService->recordLossOrDamage(
            $validated['product_id'],
            $validated['location_id'],
            $validated['quantity'],
            $validated['type'],
            $validated['reason'],
            $request->user()->id
        );

        return response()->json(['message' => 'Record saved and stock deduction completed.']);
    }

    /**
     * Full Stock Movement History
     */
    public function movements(Request $request)
    {
        $query = StockMovement::with(['product', 'location', 'user'])
            ->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('movement_type')) {
            $query->where('movement_type', $request->movement_type);
        }

        return response()->json($query->paginate(25));
    }
}
