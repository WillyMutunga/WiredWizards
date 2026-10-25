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
  PackagePlus,
  Award,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { api, formatKes } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<any>({
    today_sales: 0,
    month_sales: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_customers: 0,
    low_stock_alerts: 0,
  });
  const [valuation, setValuation] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/reports/dashboard')
      .then((r) => {
        if (r.data) setOverview(r.data);
      })
      .catch(() => {});

    api
      .get('/reports/agent-performance')
      .then((r) => setAgents(r.data || []))
      .catch(() => {});

    if (user?.role === 'super_admin') {
      api
        .get('/reports/valuation')
        .then((r) => setValuation(r.data || []))
        .catch(() => {});
    }
  }, [user]);

  const totalCompanyUnits = valuation.reduce((s, v) => s + Number(v.total_units || 0), 0);
  const totalCompanyCost = valuation.reduce((s, v) => s + Number(v.total_cost_value || 0), 0);
  const totalCompanyRetail = valuation.reduce((s, v) => s + Number(v.total_retail_value || 0), 0);
  const totalCompanyMargin = totalCompanyRetail - totalCompanyCost;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-engineering-700 text-white rounded-2xl p-6 shadow-md border-b-4 border-solar-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-solar-500 text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" /> Multi-Branch Solar ERP &amp; POS Command Centre
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            ERP &amp; Multi-Branch Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time financial metrics, branch stock valuation across Nairobi, Machakos &amp; Kitui, and POS shortcuts
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/quotations/new"
            className="bg-solar-600 hover:bg-solar-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow transition"
          >
            <FilePlus2 className="w-4 h-4" /> New Quotation (POS)
          </Link>
          {['super_admin', 'inventory_manager'].includes(user?.role || '') && (
            <>
              <Link
                to="/admin/inventory"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <Boxes className="w-4 h-4 text-solar-500" /> Stock Matrix
              </Link>
              <Link
                to="/admin/products"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <PackagePlus className="w-4 h-4 text-emerald-400" /> Products &amp; VAT
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 4 High-Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Sales Revenue
            </div>
            <div className="text-2xl font-extrabold text-navy-900 mt-2">
              {formatKes(overview.month_sales)}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2">
              <ArrowUpRight className="w-3 h-3" /> Today: {formatKes(overview.today_sales)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Orders
            </div>
            <div className="text-2xl font-extrabold text-navy-900 mt-2">
              {overview.pending_orders}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-2">
              Completed Orders: <strong className="text-emerald-700">{overview.completed_orders}</strong>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-solar-100 text-solar-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Clients
            </div>
            <div className="text-2xl font-extrabold text-navy-900 mt-2">
              {overview.total_customers}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Active Retail &amp; B2B Solar Accounts
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-engineering-100 text-engineering-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alerts
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">
              {overview.low_stock_alerts}
            </div>
            <Link
              to="/admin/inventory"
              className="inline-block text-[11px] font-bold text-solar-600 hover:underline mt-2"
            >
              Inspect Branch Stock &rarr;
            </Link>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Super Admin Exclusive: Multi-Location Stock Cost vs Retail Valuation */}
      {user?.role === 'super_admin' && valuation.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-solar-600" /> Multi-Branch Inventory Valuation (Super Admin Exclusive)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Wholesale Acquisition Cost (<code className="bg-slate-100 px-1 rounded">buying_price</code>) vs Retail Selling Valuation (<code className="bg-slate-100 px-1 rounded">selling_price</code>) per branch
              </p>
            </div>
            <span className="bg-solar-50 border border-solar-200 text-solar-700 text-xs font-bold px-3 py-1 rounded-full">
              Restricted to Super Admin
            </span>
          </div>

          {/* 3 Branch Valuation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {valuation.map((loc: any, idx: number) => {
              const branchName = loc.location_name || loc.location || `Branch #${idx + 1}`;
              const branchCode =
                loc.location_code ||
                (branchName.includes('Nairobi')
                  ? 'NBO-WH'
                  : branchName.includes('Machakos')
                  ? 'MCK-RET'
                  : 'KTU-RET');
              const cost = Number(loc.total_cost_value || 0);
              const retail = Number(loc.total_retail_value || 0);
              const margin = retail - cost;
              const marginPct = retail > 0 ? Math.round((margin / retail) * 100) : 0;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm hover:border-solar-400 transition space-y-3.5"
                >
                  {/* Branch Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="font-extrabold text-sm text-navy-900">{branchName}</div>
                      <span className="inline-block font-mono text-[10px] font-bold text-engineering-700 bg-engineering-100 px-2 py-0.5 rounded mt-0.5">
                        {branchCode}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="bg-navy-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        {loc.total_units} units
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Cost Value (Buying):</span>
                      <span className="font-bold text-slate-800">{formatKes(cost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Retail Value (Selling):</span>
                      <span className="font-bold text-emerald-700">{formatKes(retail)}</span>
                    </div>
                  </div>

                  {/* Margin Footer */}
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-solar-600">
                        Projected Gross Margin
                      </div>
                      <div className="text-sm font-extrabold text-solar-600 mt-0.5">
                        {formatKes(margin)}
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      +{marginPct}% Margin
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Company-Wide Consolidated Valuation Summary Strip */}
          <div className="bg-navy-900 text-white rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Total Network Stock</div>
              <div className="text-base font-extrabold text-white mt-0.5">{totalCompanyUnits} Units</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Total Cost Valuation</div>
              <div className="text-base font-extrabold text-slate-200 mt-0.5">{formatKes(totalCompanyCost)}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Total Retail Valuation</div>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">{formatKes(totalCompanyRetail)}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Total Projected Margin</div>
              <div className="text-base font-extrabold text-solar-500 mt-0.5">{formatKes(totalCompanyMargin)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Agent Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-solar-600" /> Sales Team Performance Leaderboard
            </h2>
            <p className="text-xs text-slate-500">
              Quotations generated, orders closed, and total revenue attributed per sales executive
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 uppercase text-[11px] text-slate-600 border-y border-slate-200">
                <th className="p-3.5">Sales Executive</th>
                <th className="p-3.5">Contact Email &amp; Phone</th>
                <th className="p-3.5 text-center">Quotations Issued</th>
                <th className="p-3.5 text-center">Orders Closed</th>
                <th className="p-3.5 text-right">Total Sales Value</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((ag: any) => {
                const quotesCount = ag.quotes_count ?? ag.quotations_count ?? 0;
                const ordersCount = ag.orders_count ?? 0;
                const salesTotal = ag.total_sales ?? ag.total_sales_value ?? 0;
                return (
                  <tr key={ag.id} className="border-b border-slate-200 hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-navy-900 text-solar-500 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {(ag.name || 'S')[0]}
                        </div>
                        <span className="font-bold text-navy-900">{ag.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{ag.email}</div>
                      {ag.phone && <div className="font-mono text-[11px] text-slate-400">{ag.phone}</div>}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block bg-engineering-100 text-engineering-700 font-bold px-2.5 py-1 rounded-md">
                        {quotesCount} Quotes
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-md">
                        {ordersCount} Orders
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-sm text-emerald-700">
                      {formatKes(salesTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
