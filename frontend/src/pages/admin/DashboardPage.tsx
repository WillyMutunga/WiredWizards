import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Building2,
  FilePlus2,
  Boxes,
} from 'lucide-react';
import { api, formatKes } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<any>(null);
  const [valuation, setValuation] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    if (user && ['super_admin', 'inventory_manager'].includes(user.role)) {
      api.get('/reports/dashboard').then((r) => setOverview(r.data));
      api.get('/reports/agent-performance').then((r) => setAgents(r.data || []));
    }
    if (user?.role === 'super_admin') {
      api.get('/reports/valuation').then((r) => setValuation(r.data || []));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            ERP &amp; Multi-Branch Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time financial metrics, branch stock valuation, and POS shortcuts
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/quotations/new"
            className="bg-solar-600 hover:bg-solar-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-1.5 shadow"
          >
            <FilePlus2 className="w-4 h-4" /> New Quotation (POS)
          </Link>
          {['super_admin', 'inventory_manager'].includes(user?.role || '') && (
            <Link
              to="/admin/inventory"
              className="bg-navy-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4" /> Stock Matrix
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Month Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-navy-900 mt-2">
              {formatKes(overview.month_sales)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Today: {formatKes(overview.today_sales)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Pending Orders</span>
              <ShoppingBag className="w-4 h-4 text-solar-600" />
            </div>
            <div className="text-xl font-extrabold text-navy-900 mt-2">
              {overview.pending_orders}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              Completed: {overview.completed_orders}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Registered Clients</span>
              <Users className="w-4 h-4 text-engineering-700" />
            </div>
            <div className="text-xl font-extrabold text-navy-900 mt-2">
              {overview.total_customers}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active retail &amp; B2B accounts</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-amber-600 mt-2">
              {overview.low_stock_alerts}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across NBO, MCK &amp; KTU</div>
          </div>
        </div>
      )}

      {/* Super Admin Exclusive: Multi-Location Stock Cost vs Retail Valuation */}
      {user?.role === 'super_admin' && valuation.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-solar-600" /> Multi-Branch Inventory Valuation (Super Admin Exclusive)
              </h2>
              <p className="text-xs text-slate-500">
                Wholesale Acquisition Cost (`buying_price`) vs Retail Selling Valuation per branch
              </p>
            </div>
            <span className="bg-solar-100 text-solar-700 text-[11px] font-bold px-2.5 py-1 rounded">
              Restricted to Super Admin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {valuation.map((loc: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="font-extrabold text-sm text-navy-900">{loc.location}</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Units on Hand:</span>
                  <span className="font-bold">{loc.total_units} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cost Value (Buying):</span>
                  <span className="font-bold text-slate-800">{formatKes(loc.total_cost_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retail Value (Selling):</span>
                  <span className="font-bold text-emerald-700">{formatKes(loc.total_retail_value)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-solar-600">
                  <span>Projected Gross Margin:</span>
                  <span>
                    {formatKes(Number(loc.total_retail_value) - Number(loc.total_cost_value))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Agent Performance Leaderboard */}
      {agents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-navy-900 mb-3">
            Sales Team Performance Leaderboard
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-3">Agent Name</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Quotations Issued</th>
                <th className="p-3 text-center">Orders Closed</th>
                <th className="p-3 text-right">Total Sales Value</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((ag: any) => (
                <tr key={ag.id} className="border-b border-slate-200">
                  <td className="p-3 font-bold text-navy-900">{ag.name}</td>
                  <td className="p-3 text-slate-500">{ag.email}</td>
                  <td className="p-3 text-center font-semibold">{ag.quotations_count}</td>
                  <td className="p-3 text-center font-semibold">{ag.orders_count}</td>
                  <td className="p-3 text-right font-extrabold text-emerald-700">
                    {formatKes(ag.total_sales_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
