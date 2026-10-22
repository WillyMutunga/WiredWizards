<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:brands,name',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
        ]);

        $data = ['name' => $validated['name'], 'slug' => Str::slug($validated['name'])];
        if ($request->hasFile('logo')) {
            $data['logo_path'] = 'storage/' . $request->file('logo')->store('brands', 'public');
        }

        return response()->json(['message' => 'Brand created.', 'brand' => Brand::create($data)], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:150|unique:brands,name,' . $brand->id,
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
        ]);

        $data = [];
        if (isset($validated['name'])) {
            $data['name'] = $validated['name'];
            $data['slug'] = Str::slug($validated['name']);
        }
        if ($request->hasFile('logo')) {
            $data['logo_path'] = 'storage/' . $request->file('logo')->store('brands', 'public');
        }

        $brand->update($data);

        return response()->json(['message' => 'Brand updated.', 'brand' => $brand]);
    }

    public function destroy($id)
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        if ($brand->products_count > 0) {
            return response()->json(['message' => 'This brand still has products. Reassign them first.'], 422);
        }

        $brand->delete();
        return response()->json(['message' => 'Brand deleted.']);
    }
}
