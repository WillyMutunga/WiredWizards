import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatKes } from '../../api/client';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotals } = useCartStore();
  const { vatableSubtotal, nonVatableSubtotal, subtotal, totalVat, grandTotal } = getTotals();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-solar-600" /> Shopping Cart &amp; VAT Breakdown
          </h1>
          <p className="text-xs text-slate-500">
            VAT is computed strictly on VAT-compliant items. Non-VAT solar items incur 0% VAT.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-red-600 font-bold hover:underline"
          >
            Empty Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-base font-bold text-slate-800">Your solar cart is empty</div>
          <Link
            to="/products"
            className="inline-block bg-solar-600 text-white text-xs font-bold px-6 py-3 rounded-lg"
          >
            Explore Solar Equipment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Line Items */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-navy-900 text-white uppercase text-[11px]">
                  <th className="p-3.5">Equipment / SKU</th>
                  <th className="p-3.5 text-center">VAT Status</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Line VAT</th>
                  <th className="p-3.5 text-right">Line Total</th>
                  <th className="p-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lineNet = item.price * item.quantity;
                  const lineVat =
                    item.is_vatable && item.vat_rate > 0
                      ? Number(((lineNet * item.vat_rate) / 100).toFixed(2))
                      : 0;
                  return (
                    <tr key={item.product_id} className="border-b border-slate-200">
                      <td className="p-3.5">
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-bold text-slate-900 hover:text-solar-600 block"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-[11px] text-slate-400">{item.sku}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <VatStatusBadge
                          isVatable={item.is_vatable}
                          vatRate={item.vat_rate}
                          vatStatus={item.vat_status}
                        />
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center border border-slate-300 rounded">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="px-2 py-1 bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="px-2 py-1 bg-slate-100 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-medium">{formatKes(item.price)}</td>
                      <td className="p-3.5 text-right font-semibold text-amber-700">
                        {lineVat > 0 ? formatKes(lineVat) : 'KES 0.00'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-navy-900">
                        {formatKes(lineNet)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
            <h2 className="text-base font-extrabold text-navy-900 border-b border-slate-200 pb-3">
              Order &amp; Tax Summary
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>VATable Items Subtotal:</span>
                <span className="font-semibold">{formatKes(vatableSubtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Non-VAT (Exempt Solar) Subtotal:</span>
                <span className="font-semibold">{formatKes(nonVatableSubtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                <span>Net Subtotal (Excl. VAT):</span>
                <span>{formatKes(subtotal)}</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Total VAT (on VATable Items):</span>
                <span className="font-bold">{formatKes(totalVat)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-solar-600 pt-3 text-base font-extrabold text-navy-900">
                <span>Total Payable:</span>
                <span className="text-solar-600">{formatKes(grandTotal)}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your official Tax Invoice and Payment Receipt will itemize each product's VAT status exactly as shown above.
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full bg-solar-600 hover:bg-solar-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2 shadow transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
