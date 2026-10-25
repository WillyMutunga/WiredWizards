<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isSuperAdmin = $user && $user->role === 'super_admin';

        $totalOnHand = (int) $this->inventory->sum('quantity_on_hand');
        $totalReserved = (int) $this->inventory->sum('quantity_reserved');
        $availableStock = max(0, $totalOnHand - $totalReserved);

        $stockStatus = 'In Stock';
        if ($availableStock <= 0) {
            $stockStatus = 'Out of Stock';
        } elseif ($availableStock <= $this->min_stock_alert) {
            $stockStatus = 'Low Stock';
        }

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'brand' => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
            ] : null,
            'selling_price' => (float) $this->selling_price,
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'is_vatable' => (bool) $this->is_vatable,
            'vat_rate' => $this->is_vatable ? (float) $this->vat_rate : 0.0,
            'vat_status' => $this->is_vatable
                ? 'VATable (' . rtrim(rtrim(number_format((float) $this->vat_rate, 2), '0'), '.') . '%)'
                : 'VAT Exempt (Non-VAT)',
            // STRICT PRIVACY: buying_price is only visible to super_admin
            'buying_price' => $this->when($isSuperAdmin, (float) $this->buying_price),
            'warranty_period' => $this->warranty_period,
            'datasheet_url' => $this->datasheet_url,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'technical_specs' => $this->technical_specs ?? [],
            'images' => $this->images->map(fn($img) => [
                'id' => $img->id,
                'url' => asset($img->image_path),
                'is_primary' => $img->is_primary,
            ]),
            'inventory_summary' => [
                'total_on_hand' => $totalOnHand,
                'total_available' => $availableStock,
                'status' => $stockStatus,
            ],
            // Location breakdown is visible to internal staff only
            'locations_stock' => $this->when($user && in_array($user->role, ['super_admin', 'inventory_manager', 'sales_agent']), function () {
                return $this->inventory->map(fn($inv) => [
                    'location_id' => $inv->location_id,
                    'location_name' => $inv->location->name ?? 'Unknown',
                    'quantity_on_hand' => $inv->quantity_on_hand,
                    'quantity_available' => $inv->available,
                ]);
            }),
            'reviews' => $this->whenLoaded('reviews', fn () => [
                'average_rating' => round((float) $this->reviews->avg('rating'), 1),
                'count' => $this->reviews->count(),
                'items' => $this->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'customer_name' => $r->customer->name ?? 'Customer',
                    'created_at' => $r->created_at->toISOString(),
                ]),
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
