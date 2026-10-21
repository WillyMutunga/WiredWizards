<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json([
            'message' => 'System settings updated successfully.',
            'settings' => SystemSetting::pluck('value', 'key'),
        ]);
    }
}
