<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductMediaController extends Controller
{
    /**
     * Upload one or more product images (jpg/png/webp, max 4 MB each).
     */
    public function storeImages(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $created = DB::transaction(function () use ($request, $product) {
            $hasPrimary = $product->images()->where('is_primary', true)->exists();
            $order = (int) $product->images()->max('display_order');
            $created = [];

            foreach ($request->file('images') as $file) {
                $path = $file->store("products/{$product->id}", 'public');
                $created[] = ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => 'storage/' . $path,
                    'is_primary' => !$hasPrimary && empty($created),
                    'display_order' => ++$order,
                ]);
            }

            return $created;
        });

        return response()->json([
            'message' => count($created) . ' image(s) uploaded.',
            'images' => collect($created)->map(fn ($img) => [
                'id' => $img->id,
                'url' => asset($img->image_path),
                'is_primary' => $img->is_primary,
            ]),
        ], 201);
    }

    /**
     * Make an image the primary (cover) image.
     */
    public function setPrimary($productId, $imageId)
    {
        $image = ProductImage::where('product_id', $productId)->findOrFail($imageId);

        DB::transaction(function () use ($image) {
            ProductImage::where('product_id', $image->product_id)->update(['is_primary' => false]);
            $image->update(['is_primary' => true]);
        });

        return response()->json(['message' => 'Primary image updated.']);
    }

    public function destroyImage($productId, $imageId)
    {
        $image = ProductImage::where('product_id', $productId)->findOrFail($imageId);

        Storage::disk('public')->delete(str_replace('storage/', '', $image->image_path));
        $wasPrimary = $image->is_primary;
        $image->delete();

        // Promote the next image so the product always has a cover
        if ($wasPrimary) {
            ProductImage::where('product_id', $productId)->orderBy('display_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image removed.']);
    }

    /**
     * Upload a technical datasheet PDF (max 10 MB).
     */
    public function storeDatasheet(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'datasheet' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($product->datasheet_url && str_starts_with($product->datasheet_url, 'storage/')) {
            Storage::disk('public')->delete(str_replace('storage/', '', $product->datasheet_url));
        }

        $path = $request->file('datasheet')->store("datasheets/{$product->id}", 'public');
        $product->update(['datasheet_url' => 'storage/' . $path]);

        return response()->json([
            'message' => 'Datasheet uploaded.',
            'datasheet_url' => asset($product->datasheet_url),
        ], 201);
    }
}
