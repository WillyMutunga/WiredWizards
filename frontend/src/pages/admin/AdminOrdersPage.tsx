import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/orders', { params }).then((r) => setOrders(r.data?.data || []));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const stages = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'dispatched',
    'delivered',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-solar-600" /> Order Fulfilment &amp; Dispatch Board
          </h1>
          <p className="text-xs text-slate-500">
            Transitioning to Dispatched/Delivered deducts reserved branch stock; Cancelled releases reservation.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
        >
          <option value="">All Fulfilment Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
              <th className="p-3.5">Order #</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Branch</th>
              <th className="p-3.5 text-right">Subtotal</th>
              <th className="p-3.5 text-right">VAT</th>
              <th className="p-3.5 text-right">Total</th>
              <th className="p-3.5">Fulfilment Stage</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id} className="border-b border-slate-200">
                <td className="p-3.5 font-mono font-bold text-navy-900">{ord.order_number}</td>
                <td className="p-3.5 font-semibold">{ord.customer?.name}</td>
                <td className="p-3.5 font-mono">{ord.location?.code || `LOC-${ord.location_id}`}</td>
                <td className="p-3.5 text-right">{formatKes(ord.subtotal)}</td>
                <td className="p-3.5 text-right text-amber-700 font-semibold">
                  {formatKes(ord.vat_amount)}
                </td>
                <td className="p-3.5 text-right font-extrabold">{formatKes(ord.total_amount)}</td>
                <td className="p-3.5">
                  <select
                    value={ord.order_status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg font-bold uppercase text-[11px] bg-slate-50"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
