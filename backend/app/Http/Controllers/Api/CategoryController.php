<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Public: active categories and all brands with product counts.
     */
    public function index()
    {
        $categories = Category::withCount('products')
            ->where('is_active', true)
            ->get();

        $brands = Brand::withCount('products')->get();

        return response()->json([
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:categories,name',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $data = [
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'parent_id' => $validated['parent_id'] ?? null,
            'description' => $validated['description'] ?? null,
        ];

        if ($request->hasFile('image')) {
            $data['image_path'] = 'storage/' . $request->file('image')->store('categories', 'public');
        }

        return response()->json(['message' => 'Category created.', 'category' => Category::create($data)], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:150|unique:categories,name,' . $category->id,
            'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id,
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if ($request->hasFile('image')) {
            $validated['image_path'] = 'storage/' . $request->file('image')->store('categories', 'public');
        }
        unset($validated['image']);

        $category->update($validated);

        return response()->json(['message' => 'Category updated.', 'category' => $category]);
    }

    /**
     * Categories with products are deactivated, not deleted, to protect order history.
     */
    public function destroy($id)
    {
        $category = Category::withCount('products')->findOrFail($id);

        if ($category->products_count > 0) {
            $category->update(['is_active' => false]);
            return response()->json(['message' => 'Category has products, so it was deactivated instead of deleted.']);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted.']);
    }
}
