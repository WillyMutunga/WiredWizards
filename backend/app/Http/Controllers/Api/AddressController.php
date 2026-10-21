<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomerAddress;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = CustomerAddress::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:50', // e.g. Home, Office, Farm Site
            'county' => 'required|string|max:100',
            'town' => 'required|string|max:100',
            'physical_details' => 'required|string',
            'is_default' => 'boolean',
        ]);

        $userId = $request->user()->id;

        if (!empty($validated['is_default'])) {
            CustomerAddress::where('user_id', $userId)->update(['is_default' => false]);
        }

        $address = CustomerAddress::create(array_merge($validated, ['user_id' => $userId]));

        return response()->json([
            'message' => 'Delivery address saved successfully.',
            'address' => $address,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $address = CustomerAddress::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:50',
            'county' => 'sometimes|string|max:100',
            'town' => 'sometimes|string|max:100',
            'physical_details' => 'sometimes|string',
            'is_default' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            CustomerAddress::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'message' => 'Delivery address updated.',
            'address' => $address,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $address = CustomerAddress::where('user_id', $request->user()->id)->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Address removed.']);
    }
}
