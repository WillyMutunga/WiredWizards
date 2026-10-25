import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Truck, CheckCircle2 } from 'lucide-react';
import { api, extractErrorMessage } from '../../api/client';

export const StockTransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sourceId, setSourceId] = useState(1); // Nairobi
  const [destId, setDestId] = useState(2); // Machakos
  const [productId, setProductId] = useState(1);
  const [qty, setQty] = useState(5);
  const [notes, setNotes] = useState('Replenishing retail store solar panel stock');
  const [msg, setMsg] = useState('');

  const loadData = () => {
    api.get('/transfers').then((r) => setTransfers(r.data?.data || []));
  };

  useEffect(() => {
    loadData();
    api.get('/products?per_page=50').then((r) => {
      const list = r.data?.data || [];
      setProducts(list);
      if (list.length > 0) setProductId(list[0].id);
    });
  }, []);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/transfers/initiate', {
        source_location_id: sourceId,
        destination_location_id: destId,
        notes,
        items: [{ product_id: productId, quantity: qty }],
      });
      setMsg(res.data?.message || 'Transfer initiated!');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await api.put(`/transfers/${id}/dispatch`);
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleReceive = async (id: number) => {
    try {
      await api.put(`/transfers/${id}/receive`);
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-solar-600" /> Inter-Branch Stock Transfers (`TR-YYYY-XXXXXX`)
        </h1>
        <p className="text-xs text-slate-500">
          Move inventory between Nairobi Warehouse, Machakos Store &amp; Kitui Store with full audit trail
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Initiate Transfer Form */}
      <form
        onSubmit={handleInitiate}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs"
      >
        <div>
          <label className="block font-bold mb-1">From Source Branch</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg"
          >
            <option value={1}>NBO-WH (Nairobi Warehouse)</option>
            <option value={2}>MCK-RET (Machakos Store)</option>
            <option value={3}>KTU-RET (Kitui Store)</option>
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">To Destination Branch</label>
          <select
            value={destId}
            onChange={(e) => setDestId(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg"
          >
            <option value={1}>NBO-WH (Nairobi Warehouse)</option>
            <option value={2}>MCK-RET (Machakos Store)</option>
            <option value={3}>KTU-RET (Kitui Store)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-bold mb-1">Solar Equipment</label>
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 p-2 border border-slate-300 rounded-lg"
            />
            <button
              type="submit"
              className="flex-1 bg-solar-600 hover:bg-solar-700 text-white font-bold px-3 py-2 rounded-lg"
            >
              Initiate
            </button>
          </div>
        </div>
      </form>

      {/* Transfers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
              <th className="p-3.5">Transfer #</th>
              <th className="p-3.5">Source &rarr; Destination</th>
              <th className="p-3.5">Items</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Workflow Action</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((tr) => (
              <tr key={tr.id} className="border-b border-slate-200">
                <td className="p-3.5 font-mono font-bold text-navy-900">{tr.transfer_number}</td>
                <td className="p-3.5 font-semibold">
                  {tr.source_location?.name} &rarr; {tr.destination_location?.name}
                </td>
                <td className="p-3.5">
                  {(tr.items || []).map((it: any) => (
                    <div key={it.id}>
                      {it.quantity_requested}x {it.product?.name}
                    </div>
                  ))}
                </td>
                <td className="p-3.5 uppercase font-bold text-solar-600">{tr.status}</td>
                <td className="p-3.5 text-right">
                  {tr.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleDispatch(tr.id)}
                      className="inline-flex items-center gap-1 bg-navy-900 hover:bg-solar-600 text-white font-bold px-3 py-1.5 rounded-lg"
                    >
                      <Truck className="w-3.5 h-3.5" /> Dispatch Stock
                    </button>
                  )}
                  {tr.status === 'in_transit' && (
                    <button
                      type="button"
                      onClick={() => handleReceive(tr.id)}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
