import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle2, Smartphone } from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, selectedLocationId, setSelectedLocationId, clearCart, getTotals } = useCartStore();
  const { vatableSubtotal, nonVatableSubtotal, subtotal, totalVat, grandTotal } = getTotals();

  const [paymentMethod, setPaymentMethod] = useState<'mpesa_till' | 'mpesa_stk' | 'bank_transfer' | 'cash_on_delivery'>('mpesa_till');
  const [county, setCounty] = useState('Machakos');
  const [town, setTown] = useState('Machakos Town');
  const [physicalDetails, setPhysicalDetails] = useState('');
  const [stkPhone, setStkPhone] = useState(user?.phone || '+254722334455');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.get('/addresses').then((res) => {
        const list = res.data || [];
        const def = list.find((a: any) => a.is_default) || list[0];
        if (def) {
          setCounty(def.county);
          setTown(def.town);
          setPhysicalDetails(def.physical_details);
        }
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="font-extrabold text-lg text-navy-900">Sign In Required for Checkout</div>
        <p className="text-xs text-slate-500">
          Please sign in or register so we can issue your official KRA Tax Invoice and Receipt.
        </p>
        <Link
          to="/login"
          className="inline-block bg-solar-600 text-white text-xs font-bold px-6 py-3 rounded-lg"
        >
          Sign In / Register
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        location_id: selectedLocationId,
        payment_method: paymentMethod,
        delivery_address: {
          county,
          town,
          physical_details: physicalDetails,
        },
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/orders/checkout', payload);
      const createdOrder = res.data?.order;

      if (paymentMethod === 'mpesa_stk' && createdOrder) {
        await api.post('/payments/mpesa/stkpush', {
          phone: stkPhone,
          amount: createdOrder.total_amount,
          order_id: createdOrder.id,
        });
      }

      setOrderResult(createdOrder);
      clearCart();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8 shadow-lg text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-extrabold text-navy-900">
            Order Confirmed &amp; Stock Reserved!
          </h1>
          <div className="text-sm font-mono font-bold text-solar-600">
            Order Number: {orderResult.order_number}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span>Net Subtotal:</span>
              <strong>{formatKes(orderResult.subtotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total VAT (on VATable Items):</span>
              <strong>{formatKes(orderResult.vat_amount)}</strong>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-navy-900 border-t border-slate-200 pt-1.5">
              <span>Total Order Amount:</span>
              <span>{formatKes(orderResult.total_amount)}</span>
            </div>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="bg-navy-900 hover:bg-solar-600 text-white font-bold text-xs px-6 py-3 rounded-lg"
            >
              View Order Timeline, Invoice &amp; Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1. Fulfillment Branch */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-solar-600" /> 1. Select Dispatch / Pickup Branch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { id: 1, code: 'NBO-WH', name: 'Nairobi Warehouse', sub: 'Enterprise Rd, Industrial Area' },
              { id: 2, code: 'MCK-RET', name: 'Machakos Store', sub: 'Mwatu Wa Ngoma St' },
              { id: 3, code: 'KTU-RET', name: 'Kitui Store', sub: 'Commercial St, Kitui' },
            ].map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  selectedLocationId === loc.id
                    ? 'border-solar-600 bg-solar-50/60 ring-2 ring-solar-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-navy-900">{loc.name}</div>
                <div className="text-[11px] font-mono text-solar-600">{loc.code}</div>
                <div className="text-[11px] text-slate-500 mt-1">{loc.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Delivery Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-navy-900">2. Delivery Destination</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">County *</label>
              <input
                type="text"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Town / Area *</label>
              <input
                type="text"
                required
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Exact Street, Building or Installation Site *</label>
            <input
              type="text"
              required
              value={physicalDetails}
              onChange={(e) => setPhysicalDetails(e.target.value)}
              placeholder="e.g. Opposite AIC Church, Farm Gate 3"
              className="w-full p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-solar-600" /> 3. Payment Channel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'mpesa_till', label: 'M-Pesa Buy Goods Till (543210)', desc: 'Pay to Till 543210' },
              { id: 'mpesa_stk', label: 'M-Pesa Express (STK Push)', desc: 'Instant prompt on your phone' },
              { id: 'bank_transfer', label: 'KCB Bank Transfer / EFT', desc: 'A/C 1234567890 (Wired Wizards)' },
              { id: 'cash_on_delivery', label: 'Pay at Branch / On Delivery', desc: 'Cash or M-Pesa upon verification' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  paymentMethod === m.id
                    ? 'border-solar-600 bg-solar-50/60 ring-2 ring-solar-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-navy-900">{m.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>

          {paymentMethod === 'mpesa_stk' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <label className="block font-bold text-emerald-900 mb-1">M-Pesa Phone Number</label>
                <input
                  type="text"
                  value={stkPhone}
                  onChange={(e) => setStkPhone(e.target.value)}
                  className="w-full p-2 border border-emerald-300 rounded bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full bg-solar-600 hover:bg-solar-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-lg uppercase tracking-wider shadow transition"
          >
            {submitting ? 'Reserving Stock & Generating Invoice...' : `Confirm Order (${formatKes(grandTotal)})`}
          </button>
        </div>
      </form>

      {/* Right Order & Per-Item VAT Preview */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-4">
        <h2 className="text-base font-extrabold text-navy-900 border-b border-slate-200 pb-3">
          Itemized VAT &amp; Order Review
        </h2>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-start justify-between gap-2 text-xs border-b border-slate-100 pb-2.5"
            >
              <div>
                <div className="font-bold text-slate-900">
                  {item.quantity}x {item.name}
                </div>
                <div className="mt-1">
                  <VatStatusBadge
                    isVatable={item.is_vatable}
                    vatRate={item.vat_rate}
                    vatStatus={item.vat_status}
                  />
                </div>
              </div>
              <div className="text-right font-bold text-navy-900 whitespace-nowrap">
                {formatKes(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span>VATable Items Subtotal:</span>
            <span>{formatKes(vatableSubtotal)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>Non-VAT (Exempt) Subtotal:</span>
            <span>{formatKes(nonVatableSubtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Subtotal (Excl. VAT):</span>
            <span>{formatKes(subtotal)}</span>
          </div>
          <div className="flex justify-between text-amber-800 font-semibold">
            <span>Total VAT (16% on VATable Items):</span>
            <span>{formatKes(totalVat)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-navy-900 border-t border-slate-200 pt-2">
            <span>Grand Total:</span>
            <span className="text-solar-600">{formatKes(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
