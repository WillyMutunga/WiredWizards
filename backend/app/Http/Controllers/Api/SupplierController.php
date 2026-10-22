<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount('purchaseRecords')->orderBy('name');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('name', 'ILIKE', "%{$s}%")
                ->orWhere('contact_person', 'ILIKE', "%{$s}%")
                ->orWhere('phone', 'ILIKE', "%{$s}%"));
        }

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        return response()->json($query->paginate(20));
    }

    public function show($id)
    {
        $supplier = Supplier::with(['purchaseRecords' => fn ($q) => $q->latest()->limit(20)])->findOrFail($id);
        return response()->json($supplier);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        return response()->json(['message' => 'Supplier added.', 'supplier' => Supplier::create($validated)], 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate($this->rules(true));
        $supplier->update($validated);

        return response()->json(['message' => 'Supplier updated.', 'supplier' => $supplier]);
    }

    /**
     * Suppliers are deactivated, never deleted, so purchase history stays intact.
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update(['is_active' => false]);

        return response()->json(['message' => 'Supplier deactivated.']);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => "$req|string|max:200",
            'phone' => "$req|string|max:50",
            'contact_person' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'payment_terms' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
