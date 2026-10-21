<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Http\Resources\ProductResource;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlists = Wishlist::with(['product.category', 'product.brand', 'product.images', 'product.inventory'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'wishlist' => $wishlists->map(fn($w) => [
                'id' => $w->id,
                'product' => new ProductResource($w->product),
                'added_at' => $w->created_at->toISOString(),
            ])
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Product removed from wishlist.', 'in_wishlist' => false]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json(['message' => 'Product added to wishlist.', 'in_wishlist' => true], 201);
    }
}
