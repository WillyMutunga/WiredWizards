import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Truck, CheckCircle2, Clock } from 'lucide-react';
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
      const res = await api.put(`/transfers/${id}/dispatch`);
      setMsg(res.data?.message || 'Transfer dispatched!');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleReceive = async (id: number) => {
    try {
      const res = await api.put(`/transfers/${id}/receive`);
      setMsg(res.data?.message || 'Transfer received at destination branch!');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-solar-600" /> Inter-Branch Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Move inventory between Nairobi Warehouse, Machakos Store &amp; Kitui Store with 2-step Dispatch &amp; Receive verification
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Initiate Transfer Form */}
      <form
        onSubmit={handleInitiate}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs"
      >
        <div className="font-extrabold text-sm text-navy-900 border-b border-slate-100 pb-2">
          Initiate New Branch Stock Transfer
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">From Source Branch</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            >
              <option value={1}>NBO-WH (Nairobi Warehouse)</option>
              <option value={2}>MCK-RET (Machakos Store)</option>
              <option value={3}>KTU-RET (Kitui Store)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">To Destination Branch</label>
            <select
              value={destId}
              onChange={(e) => setDestId(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            >
              <option value={1}>NBO-WH (Nairobi Warehouse)</option>
              <option value={2}>MCK-RET (Machakos Store)</option>
              <option value={3}>KTU-RET (Kitui Store)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Solar Equipment</label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Quantity</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center"
              />
              <button
                type="submit"
                className="flex-1 bg-solar-600 hover:bg-solar-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                Initiate
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Transfers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {transfers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No inter-branch stock transfers initiated yet. Use the form above to transfer stock between Nairobi, Machakos, and Kitui.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600 border-b border-slate-200">
                <th className="p-3.5">Transfer #</th>
                <th className="p-3.5">Source &rarr; Destination</th>
                <th className="p-3.5">Items &amp; Quantities</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((tr) => (
                <tr key={tr.id} className="border-b border-slate-200 hover:bg-slate-50/80">
                  <td className="p-3.5 font-mono font-bold text-navy-900">{tr.transfer_number}</td>
                  <td className="p-3.5 font-semibold">
                    <span className="text-slate-800">{tr.source_location?.name}</span>
                    <span className="mx-2 text-solar-600 font-bold">&rarr;</span>
                    <span className="text-emerald-700">{tr.destination_location?.name}</span>
                  </td>
                  <td className="p-3.5">
                    {(tr.items || []).map((it: any) => (
                      <div key={it.id} className="font-medium">
                        <strong>{it.quantity_dispatched ?? it.quantity_requested}x</strong>{' '}
                        {it.product?.name}
                      </div>
                    ))}
                  </td>
                  <td className="p-3.5">
                    {tr.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                        <Clock className="w-3 h-3" /> Pending Dispatch
                      </span>
                    )}
                    {tr.status === 'dispatched' && (
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                        <Truck className="w-3 h-3" /> In Transit (Dispatched)
                      </span>
                    )}
                    {tr.status === 'received' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Received
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {tr.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleDispatch(tr.id)}
                        className="inline-flex items-center gap-1 bg-navy-900 hover:bg-solar-600 text-white font-bold px-3.5 py-1.5 rounded-xl transition"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch Stock
                      </button>
                    )}
                    {(tr.status === 'dispatched' || tr.status === 'in_transit') && (
                      <button
                        type="button"
                        onClick={() => handleReceive(tr.id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
