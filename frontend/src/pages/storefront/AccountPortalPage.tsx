import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Package,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Trash2,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { openAuthenticatedPdf } from '../../api/pdf';
import { useCartStore } from '../../store/cartStore';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const AccountPortalPage: React.FC = () => {
  const [tab, setTab] = useState<'orders' | 'invoices' | 'receipts' | 'quotations' | 'wishlist' | 'addresses'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedOrderTimeline, setSelectedOrderTimeline] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const addItem = useCartStore((s) => s.addItem);

  // Address Form
  const [addrForm, setAddrForm] = useState({
    label: 'Home / Farm Installation Site',
    county: 'Machakos',
    town: 'Machakos Town',
    physical_details: '',
    is_default: true,
  });

  const loadAll = () => {
    api.get('/orders').then((r) => setOrders(r.data?.data || []));
    api.get('/invoices').then((r) => setInvoices(r.data?.data || []));
    api.get('/receipts').then((r) => setReceipts(r.data?.data || []));
    api.get('/quotations').then((r) => setQuotations(r.data?.data || []));
    api.get('/wishlist').then((r) => setWishlist(r.data?.wishlist || []));
    api.get('/addresses').then((r) => setAddresses(r.data || []));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const viewTimeline = async (orderNumber: string) => {
    const res = await api.get(`/orders/${orderNumber}`);
    setSelectedOrderTimeline(res.data);
  };

  const handleRemoveWishlist = async (productId: number) => {
    await api.post('/wishlist/toggle', { product_id: productId });
    api.get('/wishlist').then((r) => setWishlist(r.data?.wishlist || []));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/addresses', addrForm);
      setAddrForm({ ...addrForm, physical_details: '' });
      api.get('/addresses').then((r) => setAddresses(r.data || []));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleSetDefaultAddress = async (addr: any) => {
    await api.put(`/addresses/${addr.id}`, { ...addr, is_default: true });
    api.get('/addresses').then((r) => setAddresses(r.data || []));
  };

  const handleDeleteAddress = async (id: number) => {
    await api.delete(`/addresses/${id}`);
    api.get('/addresses').then((r) => setAddresses(r.data || []));
  };

  return (
    <div className="w-full px-3 sm:px-5 py-6 space-y-6">
      <div className="bg-navy-900 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Customer Self-Service &amp; Document Hub</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track deliveries, manage saved addresses &amp; wishlists, and download itemized Tax Invoices &amp; Official Receipts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'invoices', label: `Tax Invoices (${invoices.length})`, icon: FileText },
            { id: 'receipts', label: `Official Receipts (${receipts.length})`, icon: Receipt },
            { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileText },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
            { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={`px-3.5 py-2.5 rounded-xl font-bold inline-flex items-center gap-1.5 transition ${
                  tab === t.id
                    ? 'bg-solar-600 text-white'
                    : 'bg-navy-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Orders & 6-Stage Visual Tracker */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {selectedOrderTimeline && (
            <div className="bg-white rounded-2xl border-2 border-solar-500 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-navy-900">
                  Live Fulfilment Tracker — {selectedOrderTimeline.order?.order_number}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedOrderTimeline(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                {(selectedOrderTimeline.timeline || []).map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center ${
                      step.done
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    )}
                    <div className="font-bold">{step.stage}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px]">
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Fulfilment Stage</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-right">VAT Charged</th>
                  <th className="p-3.5 text-right">Grand Total</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} className="border-b border-slate-200">
                    <td className="p-3.5 font-mono font-bold text-navy-900">{ord.order_number}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-solar-100 text-solar-700 font-bold uppercase text-[11px]">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">{formatKes(ord.subtotal)}</td>
                    <td className="p-3.5 text-right text-amber-700 font-semibold">
                      {formatKes(ord.vat_amount)}
                    </td>
                    <td className="p-3.5 text-right font-extrabold">{formatKes(ord.total_amount)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => viewTimeline(ord.order_number)}
                        className="bg-navy-900 hover:bg-solar-600 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        Track Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Tax Invoices */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[11px]">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">VAT</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-200">
                  <td className="p-3.5 font-mono font-bold">{inv.invoice_number}</td>
                  <td className="p-3.5 uppercase font-bold text-emerald-700">{inv.payment_status}</td>
                  <td className="p-3.5 text-right">{formatKes(inv.subtotal)}</td>
                  <td className="p-3.5 text-right text-amber-700">{formatKes(inv.vat_amount)}</td>
                  <td className="p-3.5 text-right font-bold">{formatKes(inv.total_amount)}</td>
                  <td className="p-3.5 text-right font-bold text-red-600">{formatKes(inv.balance_due)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openAuthenticatedPdf(`/invoices/${inv.id}/pdf`, `${inv.invoice_number}.pdf`)}
                      className="inline-flex items-center gap-1 bg-solar-600 hover:bg-solar-700 text-white font-bold px-3 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" /> Tax Invoice PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Official Payment Receipts with Itemized VAT Status */}
      {tab === 'receipts' && (
        <div className="space-y-4">
          {selectedReceipt && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">
                    Official Receipt Breakdown — {selectedReceipt.receipt_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transaction Ref: <strong>{selectedReceipt.transaction_reference}</strong> • Amount Paid:{' '}
                    <strong className="text-emerald-700">{formatKes(selectedReceipt.amount)}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAuthenticatedPdf(`/receipts/${selectedReceipt.id}/pdf`, `${selectedReceipt.receipt_number}.pdf`)
                    }
                    className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Receipt PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 uppercase text-[11px]">
                    <th className="p-2.5">Item / Equipment</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5 text-center">VAT Status</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Line VAT</th>
                    <th className="p-2.5 text-right">Net Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedReceipt.invoice?.items || selectedReceipt.order?.items || []).map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="p-2.5 font-bold">{item.product_name}</td>
                      <td className="p-2.5 font-mono">{item.sku}</td>
                      <td className="p-2.5 text-center">
                        <VatStatusBadge isVatable={item.is_vatable} vatRate={item.vat_rate} />
                      </td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right font-semibold text-amber-700">
                        {formatKes(item.vat_amount)}
                      </td>
                      <td className="p-2.5 text-right font-bold">{formatKes(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[11px]">
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Method &amp; Ref</th>
                  <th className="p-3.5 text-right">Amount Paid</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-200">
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{rec.receipt_number}</td>
                    <td className="p-3.5">
                      <span className="uppercase font-semibold">{rec.payment_method}</span> •{' '}
                      <span className="font-mono text-slate-500">{rec.transaction_reference}</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold">{formatKes(rec.amount)}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(rec)}
                        className="bg-navy-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        Inspect VAT Breakdown
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthenticatedPdf(`/receipts/${rec.id}/pdf`, `${rec.receipt_number}.pdf`)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Quotations */}
      {tab === 'quotations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[11px]">
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">VAT</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-slate-200">
                  <td className="p-3.5 font-mono font-bold">{q.quotation_number}</td>
                  <td className="p-3.5">{q.valid_until}</td>
                  <td className="p-3.5 text-right">{formatKes(q.subtotal)}</td>
                  <td className="p-3.5 text-right text-amber-700">{formatKes(q.vat_amount)}</td>
                  <td className="p-3.5 text-right font-extrabold">{formatKes(q.grand_total)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openAuthenticatedPdf(`/quotations/${q.id}/pdf`, `${q.quotation_number}.pdf`)}
                      className="inline-flex items-center gap-1 bg-solar-600 hover:bg-solar-700 text-white font-bold px-3 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" /> Quote PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Saved Wishlist */}
      {tab === 'wishlist' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {wishlist.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              Your wishlist is empty. Click the heart icon on any solar product to save it here.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 uppercase text-[11px] text-slate-700">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5 text-center">VAT Status</th>
                  <th className="p-3.5 text-right">Price</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((w: any) => (
                  <tr key={w.id} className="border-b border-slate-200">
                    <td className="p-3.5">
                      <Link
                        to={`/products/${w.product?.slug}`}
                        className="font-bold text-navy-900 hover:text-solar-600"
                      >
                        {w.product?.name}
                      </Link>
                      <div className="font-mono text-[10px] text-slate-400">{w.product?.sku}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <VatStatusBadge
                        isVatable={w.product?.is_vatable}
                        vatRate={w.product?.vat_rate}
                        vatStatus={w.product?.vat_status}
                      />
                    </td>
                    <td className="p-3.5 text-right font-extrabold">
                      {formatKes(w.product?.effective_price)}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => addItem(w.product, 1)}
                        className="inline-flex items-center gap-1 bg-solar-600 hover:bg-solar-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveWishlist(w.product?.id)}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 6: Saved Delivery Address Book */}
      {tab === 'addresses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddAddress}
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs h-fit"
          >
            <h3 className="text-base font-extrabold text-navy-900 border-b border-slate-200 pb-2">
              + Add Delivery Address
            </h3>
            <div>
              <label className="block font-bold mb-1">Site Label *</label>
              <input
                type="text"
                required
                value={addrForm.label}
                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">County *</label>
                <input
                  type="text"
                  required
                  value={addrForm.county}
                  onChange={(e) => setAddrForm({ ...addrForm, county: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Town *</label>
                <input
                  type="text"
                  required
                  value={addrForm.town}
                  onChange={(e) => setAddrForm({ ...addrForm, town: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">Physical Street / Landmark *</label>
              <input
                type="text"
                required
                value={addrForm.physical_details}
                onChange={(e) => setAddrForm({ ...addrForm, physical_details: e.target.value })}
                placeholder="e.g. Opposite AIC Church, Gate 3"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-solar-600 hover:bg-solar-700 text-white font-bold py-2.5 rounded-lg"
            >
              Save Delivery Address
            </button>
          </form>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm text-xs space-y-2 ${
                  addr.is_default ? 'border-solar-500 ring-1 ring-solar-500/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-navy-900">{addr.label}</span>
                  {addr.is_default ? (
                    <span className="bg-solar-100 text-solar-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      DEFAULT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr)}
                      className="text-slate-400 hover:text-solar-600 inline-flex items-center gap-1 font-semibold"
                    >
                      <Star className="w-3.5 h-3.5" /> Set Default
                    </button>
                  )}
                </div>
                <div className="text-slate-600">
                  {addr.physical_details}, {addr.town}, {addr.county} County
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-600 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
