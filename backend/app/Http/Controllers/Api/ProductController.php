<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Category;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images', 'inventory.location'])
            ->where('is_active', true);

        $likeOp = \Illuminate\Support\Facades\DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        // Search by keyword in name, SKU, or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, "%{$search}%")
                  ->orWhere('sku', $likeOp, "%{$search}%")
                  ->orWhere('short_description', $likeOp, "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category)->orWhere('id', $request->category);
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->brand)->orWhere('id', $request->brand);
            });
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('selling_price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('selling_price', '<=', (float) $request->max_price);
        }

        // JSON/JSONB filter for wattage / power
        if ($request->filled('wattage')) {
            $wattage = $request->wattage;
            if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
                $query->whereRaw("technical_specs->>'rated_power' ILIKE ?", ["%{$wattage}%"]);
            } else {
                $query->where('technical_specs', 'LIKE', "%{$wattage}%");
            }
        }

        // Featured products
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // VAT status filter (?is_vatable=1 or ?is_vatable=0)
        if ($request->has('is_vatable')) {
            $query->where('is_vatable', $request->boolean('is_vatable'));
        }

        $perPage = $request->input('per_page', 12);
        $products = $query->latest()->paginate($perPage);

        return ProductResource::collection($products);
    }

    public function show($identifier)
    {
        $product = Product::with([
                'category', 'brand', 'images', 'inventory.location',
                'reviews' => fn ($q) => $q->where('status', 'approved')->with('customer:id,name')->latest(),
            ])
            ->where('slug', $identifier)
            ->orWhere('id', is_numeric($identifier) ? $identifier : 0)
            ->firstOrFail();

        return new ProductResource($product);
    }

    /**
     * Technical Product Comparison (Up to 4 products)
     */
    public function compare(Request $request)
    {
        $request->validate([
            'ids' => 'required|string', // comma separated IDs e.g. "1,2,3"
        ]);

        $ids = explode(',', $request->ids);
        if (count($ids) > 4) {
            return response()->json(['message' => 'You can compare a maximum of 4 products simultaneously.'], 422);
        }

        $products = Product::with(['category', 'brand', 'images', 'inventory'])
            ->whereIn('id', $ids)
            ->get();

        return ProductResource::collection($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'sku' => 'required|string|unique:products,sku',
            'barcode' => 'nullable|string|unique:products,barcode',
            'buying_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'is_vatable' => 'required|boolean',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'short_description' => 'nullable|string',
            'description' => 'required|string',
            'warranty_period' => 'nullable|string',
            'min_stock_alert' => 'nullable|integer|min:1',
            'technical_specs' => 'nullable|array',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        $defaultVat = (float) \App\Models\SystemSetting::get('vat_rate', 16);
        $validated['vat_rate'] = $validated['is_vatable']
            ? (float) ($validated['vat_rate'] ?? $defaultVat)
            : 0.00;

        $product = Product::create($validated);

        return new ProductResource($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'buying_price' => 'sometimes|numeric|min:0',
            'selling_price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'is_vatable' => 'sometimes|boolean',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'short_description' => 'nullable|string',
            'description' => 'sometimes|string',
            'warranty_period' => 'nullable|string',
            'min_stock_alert' => 'nullable|integer|min:1',
            'technical_specs' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (array_key_exists('is_vatable', $validated)) {
            $defaultVat = (float) \App\Models\SystemSetting::get('vat_rate', 16);
            $validated['vat_rate'] = $validated['is_vatable']
                ? (float) ($validated['vat_rate'] ?? ($product->vat_rate > 0 ? $product->vat_rate : $defaultVat))
                : 0.00;
        }

        $product->update($validated);

        return new ProductResource($product);
    }
}
