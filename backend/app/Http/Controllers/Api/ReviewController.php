<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductReview;
use App\Models\Product;

class ReviewController extends Controller
{
    /**
     * Submit review by verified customer
     */
    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $product = Product::findOrFail($productId);

        $review = ProductReview::create([
            'product_id' => $product->id,
            'customer_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'pending', // Moderation required
        ]);

        return response()->json([
            'message' => 'Your review has been submitted and is pending verification.',
            'review' => $review,
        ], 201);
    }

    /**
     * Staff Review Moderation List
     */
    public function adminIndex(Request $request)
    {
        $query = ProductReview::with(['product:id,name,sku', 'customer:id,name,email'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Approve or reject review
     */
    public function moderate(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending',
        ]);

        $review = ProductReview::findOrFail($id);
        $review->update(['status' => $validated['status']]);

        return response()->json([
            'message' => "Review marked as {$validated['status']}.",
            'review' => $review,
        ]);
    }
}
