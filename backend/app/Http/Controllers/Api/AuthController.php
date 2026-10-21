<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:30|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'company_name' => 'nullable|string|max:255',
            'kra_pin' => 'nullable|string|max:50',
            'customer_type' => 'nullable|string|in:individual,business,installer,institution',
            'county' => 'nullable|string|max:100',
            'town' => 'nullable|string|max:100',
            'physical_details' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => 'customer',
            'password' => Hash::make($validated['password']),
        ]);

        CustomerProfile::create([
            'user_id' => $user->id,
            'company_name' => $validated['company_name'] ?? null,
            'kra_pin' => $validated['kra_pin'] ?? null,
            'customer_type' => $validated['customer_type'] ?? 'individual',
        ]);

        if (!empty($validated['county']) && !empty($validated['town'])) {
            CustomerAddress::create([
                'user_id' => $user->id,
                'county' => $validated['county'],
                'town' => $validated['town'],
                'physical_details' => $validated['physical_details'] ?? '',
                'is_default' => true,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // accepts email or phone
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->login)
            ->orWhere('phone', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials provided.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'This account has been deactivated. Contact administration.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['customerProfile', 'addresses']);
        return response()->json([
            'user' => $user,
        ]);
    }
}
