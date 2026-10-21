<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
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
}
