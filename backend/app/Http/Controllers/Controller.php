<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Customers may only access their own documents; staff may access all.
     * Aborts with 403 otherwise.
     */
    protected function ensureCanView(\Illuminate\Http\Request $request, ?int $ownerCustomerId): void
    {
        $user = $request->user();

        if ($user && $user->role === 'customer' && $user->id !== $ownerCustomerId) {
            abort(response()->json(['message' => 'You are not allowed to access this document.'], 403));
        }
    }
}
