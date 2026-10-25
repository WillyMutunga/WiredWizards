import React, { useEffect, useState } from 'react';
import { Boxes, PlusCircle, Sliders, AlertOctagon, History } from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';

export const StockMatrixPage: React.FC = () => {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeAction, setActiveAction] = useState<'none' | 'stock_in' | 'adjust' | 'damage'>('none');
  const [msg, setMsg] = useState('');

  // Action form state
  const [productId, setProductId] = useState<number>(1);
  const [locationId, setLocationId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(12500);
  const [invoiceRef, setInvoiceRef] = useState('SUP-INV-2026-01');
  const [reason, setReason] = useState('Routine physical stock count');
  const [lossType, setLossType] = useState<'damage' | 'loss'>('damage');

  const loadData = () => {
    api.get('/inventory/matrix').then((r) => {
      const inv = r.data?.inventory || [];
      setMatrix(inv);
      if (inv.length > 0 && !productId) setProductId(inv[0].id);
    });
    api.get('/inventory/movements').then((r) => setMovements(r.data?.data || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/stock-in', {
        supplier_id: 1,
        location_id: locationId,
        supplier_invoice_ref: invoiceRef,
        items: [{ product_id: productId, quantity, unit_cost: unitCost }],
      });
      setMsg(res.data?.message || 'Stock received!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/adjust', {
        product_id: productId,
        location_id: locationId,
        new_physical_count: quantity,
        reason,
      });
      setMsg(res.data?.message || 'Stock adjusted!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleLossDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/loss-damage', {
        product_id: productId,
        location_id: locationId,
        quantity,
        type: lossType,
        reason,
      });
      setMsg(res.data?.message || 'Loss/Damage recorded!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-solar-600" /> Multi-Branch Inventory Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Live On-Hand, Reserved &amp; Available quantities across Nairobi Warehouse, Machakos &amp; Kitui
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'stock_in' ? 'none' : 'stock_in')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Supplier Stock-In
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'adjust' ? 'none' : 'adjust')}
            className="bg-navy-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" /> Physical Count Adjust
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'damage' ? 'none' : 'damage')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4" /> Log Damage / Loss
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Action Forms */}
      {activeAction !== 'none' && (
        <form
          onSubmit={
            activeAction === 'stock_in'
              ? handleStockIn
              : activeAction === 'adjust'
              ? handleAdjust
              : handleLossDamage
          }
          className="bg-white rounded-2xl border-2 border-solar-500 p-6 shadow-md grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs"
        >
          <div className="sm:col-span-2">
            <label className="block font-bold mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {matrix.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.sku} — {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Branch Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              <option value={1}>NBO-WH (Nairobi Warehouse)</option>
              <option value={2}>MCK-RET (Machakos Store)</option>
              <option value={3}>KTU-RET (Kitui Store)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">
              {activeAction === 'adjust' ? 'New Physical Count' : 'Quantity'}
            </label>
            <input
              type="number"
              required
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          {activeAction === 'stock_in' ? (
            <div>
              <label className="block font-bold mb-1">Unit Cost (KES)</label>
              <input
                type="number"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold mb-1">Reason / Audit Note</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {activeAction === 'damage' && (
            <div>
              <label className="block font-bold mb-1">Incident Type</label>
              <select
                value={lossType}
                onChange={(e) => setLossType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="damage">Damaged in Transit / Store</option>
                <option value="loss">Missing / Stock Loss</option>
              </select>
            </div>
          )}

          <div className="sm:col-span-5 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveAction('none')}
              className="px-4 py-2 rounded-lg border border-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-5 py-2 rounded-lg"
            >
              Commit Inventory Update
            </button>
          </div>
        </form>
      )}

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-navy-900 text-white uppercase text-[11px]">
              <th className="p-3.5">SKU / Equipment</th>
              <th className="p-3.5 text-right">Selling Price</th>
              <th className="p-3.5 text-center bg-navy-800">Nairobi (NBO-WH)</th>
              <th className="p-3.5 text-center">Machakos (MCK-RET)</th>
              <th className="p-3.5 text-center bg-navy-800">Kitui (KTU-RET)</th>
              <th className="p-3.5 text-center">Total Available</th>
              <th className="p-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.id} className="border-b border-slate-200">
                <td className="p-3.5">
                  <div className="font-bold text-navy-900">{row.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{row.sku}</div>
                </td>
                <td className="p-3.5 text-right font-semibold">{formatKes(row.selling_price)}</td>
                {['NBO-WH', 'MCK-RET', 'KTU-RET'].map((code) => {
                  const b = row.branches?.[code] || { on_hand: 0, reserved: 0, available: 0 };
                  return (
                    <td key={code} className="p-3.5 text-center border-l border-slate-100">
                      <span className="font-extrabold text-sm text-navy-900">{b.available}</span>
                      <div className="text-[10px] text-slate-400">
                        On-Hand: {b.on_hand} | Res: {b.reserved}
                      </div>
                    </td>
                  );
                })}
                <td className="p-3.5 text-center font-extrabold text-base text-emerald-700">
                  {row.total_available}
                </td>
                <td className="p-3.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      row.status === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Immutable Stock Movements Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
          <History className="w-5 h-5 text-solar-600" /> Recent Immutable Stock Movement Ledger
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-2.5">Ref #</th>
                <th className="p-2.5">Product</th>
                <th className="p-2.5">Branch</th>
                <th className="p-2.5">Movement Type</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-center">Before &rarr; After</th>
                <th className="p-2.5">Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map((m) => (
                <tr key={m.id} className="border-b border-slate-200">
                  <td className="p-2.5 font-mono font-bold">{m.reference_number}</td>
                  <td className="p-2.5 font-semibold">{m.product?.name}</td>
                  <td className="p-2.5 font-mono">{m.location?.code}</td>
                  <td className="p-2.5 uppercase font-bold text-engineering-700">
                    {m.movement_type}
                  </td>
                  <td className="p-2.5 text-center font-bold">{m.quantity}</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">
                    {m.quantity_before} &rarr; {m.quantity_after}
                  </td>
                  <td className="p-2.5 text-slate-600">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
