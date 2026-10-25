<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboardOverview(Request $request)
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $todaySales = (float) Order::where('created_at', '>=', $today)
            ->where('payment_status', '!=', 'failed')
            ->sum('total_amount');

        $monthSales = (float) Order::where('created_at', '>=', $thisMonth)
            ->where('payment_status', '!=', 'failed')
            ->sum('total_amount');

        $pendingOrders = Order::where('order_status', 'pending')->count();
        $completedOrders = Order::where('order_status', 'completed')->count();

        $totalCustomers = User::where('role', 'customer')->count();

        // PostgreSQL-safe low stock count
        $lowStockCount = DB::table('products')
            ->leftJoin('inventory', 'products.id', '=', 'inventory.product_id')
            ->select('products.id', 'products.min_stock_alert')
            ->groupBy('products.id', 'products.min_stock_alert')
            ->havingRaw('COALESCE(SUM(inventory.quantity_on_hand - inventory.quantity_reserved), 0) <= products.min_stock_alert')
            ->get()
            ->count();

        return response()->json([
            'today_sales' => $todaySales,
            'month_sales' => $monthSales,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders,
            'total_customers' => $totalCustomers,
            'low_stock_alerts' => $lowStockCount,
        ]);
    }

    /**
     * Stock Valuation (Super Admin Only)
     */
    public function inventoryValuation(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized to view financial valuation.'], 403);
        }

        $valuation = DB::table('inventory')
            ->join('products', 'inventory.product_id', '=', 'products.id')
            ->join('locations', 'inventory.location_id', '=', 'locations.id')
            ->select(
                'locations.name as location_name',
                'locations.code as location_code',
                DB::raw('SUM(inventory.quantity_on_hand * products.buying_price) as total_cost_value'),
                DB::raw('SUM(inventory.quantity_on_hand * products.selling_price) as total_retail_value'),
                DB::raw('SUM(inventory.quantity_on_hand) as total_units')
            )
            ->groupBy('locations.name', 'locations.code')
            ->orderBy('locations.id')
            ->get();

        return response()->json($valuation);
    }

    /**
     * Sales Agent Performance
     */
    public function agentPerformance()
    {
        $agents = User::where('role', 'sales_agent')
            ->withCount(['quotations', 'orders'])
            ->get()
            ->map(function ($agent) {
                $totalRevenue = Order::where('sales_agent_id', $agent->id)->sum('total_amount');
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'email' => $agent->email,
                    'phone' => $agent->phone,
                    'quotes_count' => $agent->quotations_count,
                    'quotations_count' => $agent->quotations_count,
                    'orders_count' => $agent->orders_count,
                    'total_sales' => (float) $totalRevenue,
                    'total_sales_value' => (float) $totalRevenue,
                ];
            });

        return response()->json($agents);
    }
}
