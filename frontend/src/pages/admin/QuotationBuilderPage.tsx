import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, Trash2, AlertCircle } from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const QuotationBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number>(4); // Default Peter Kioko (seeded customer ID 4)
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [terms, setTerms] = useState(
    'Warranty as per manufacturer datasheet. Payment via M-Pesa Till 543210 or KCB Bank A/C 1234567890.'
  );
  const [lines, setLines] = useState<
    Array<{
      product_id: number;
      name: string;
      sku: string;
      quantity: number;
      unit_price: number;
      is_vatable: boolean;
      vat_rate: number;
      vat_status: string;
    }>
  >([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/products?per_page=50').then((res) => {
      const list = res.data?.data || [];
      setProducts(list);
      if (list.length > 0 && lines.length === 0) {
        const first = list[0];
        setLines([
          {
            product_id: first.id,
            name: first.name,
            sku: first.sku,
            quantity: 2,
            unit_price: Number(first.effective_price ?? first.selling_price),
            is_vatable: Boolean(first.is_vatable),
            vat_rate: first.is_vatable ? Number(first.vat_rate ?? 16) : 0,
            vat_status: first.vat_status,
          },
        ]);
      }
    });
  }, []);

  const addProductLine = (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setLines([
      ...lines,
      {
        product_id: prod.id,
        name: prod.name,
        sku: prod.sku,
        quantity: 1,
        unit_price: Number(prod.effective_price ?? prod.selling_price),
        is_vatable: Boolean(prod.is_vatable),
        vat_rate: prod.is_vatable ? Number(prod.vat_rate ?? 16) : 0,
        vat_status: prod.vat_status,
      },
    ]);
  };

  // Compute live VATable vs Non-VAT totals (with discount proration matching backend)
  const subtotal = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const vatableSubtotal = lines
    .filter((l) => l.is_vatable)
    .reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const nonVatableSubtotal = lines
    .filter((l) => !l.is_vatable)
    .reduce((sum, l) => sum + l.unit_price * l.quantity, 0);

  const discountRatio = subtotal > 0 ? Math.max(0, (subtotal - discountAmount) / subtotal) : 1;
  const totalVat = lines.reduce((sum, l) => {
    if (l.is_vatable && l.vat_rate > 0) {
      const taxableLine = l.unit_price * l.quantity * discountRatio;
      return sum + Number(((taxableLine * l.vat_rate) / 100).toFixed(2));
    }
    return sum;
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount) + totalVat + Number(deliveryFee || 0);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/quotations', {
        customer_id: customerId,
        valid_until: validUntil,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        terms_and_conditions: terms,
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      });
      navigate('/admin/documents');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-solar-600" /> POS Quotation Builder
        </h1>
        <p className="text-xs text-slate-500">
          Generate formal solar system quotations (`QUO-YYYY-XXXXXX`) with per-product VAT compliance
        </p>
      </div>

      {user?.role !== 'super_admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Sales Policy Notice:</strong> Agent discounts are capped at <strong>10%</strong> of list price and unit prices cannot fall below acquisition cost. Larger discounts require Super Admin approval.
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateQuotation} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Client / Customer ID *</label>
              <input
                type="number"
                required
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Default 4 = Peter Kioko (Kioko Farms)</span>
            </div>
            <div>
              <label className="block font-bold mb-1">Valid Until *</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Add Solar Equipment</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addProductLine(Number(e.target.value));
                    e.target.value = '';
                  }
                }}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="">+ Select Product to Add...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.is_vatable ? '16% VAT' : 'Non-VAT'}) — {formatKes(p.effective_price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-700">
                <th className="p-2.5">Product</th>
                <th className="p-2.5 text-center">VAT Status</th>
                <th className="p-2.5 text-center w-20">Qty</th>
                <th className="p-2.5 text-right w-32">Unit Price (KES)</th>
                <th className="p-2.5 text-right">Line Total</th>
                <th className="p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">{line.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{line.sku}</div>
                  </td>
                  <td className="p-2.5 text-center">
                    <VatStatusBadge
                      isVatable={line.is_vatable}
                      vatRate={line.vat_rate}
                      vatStatus={line.vat_status}
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx].quantity = Math.max(1, Number(e.target.value));
                        setLines(next);
                      }}
                      className="w-16 p-1.5 text-center border border-slate-300 rounded"
                    />
                  </td>
                  <td className="p-2.5 text-right">
                    <input
                      type="number"
                      min={0}
                      value={line.unit_price}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx].unit_price = Number(e.target.value);
                        setLines(next);
                      }}
                      className="w-28 p-1.5 text-right border border-slate-300 rounded"
                    />
                  </td>
                  <td className="p-2.5 text-right font-bold text-navy-900">
                    {formatKes(line.unit_price * line.quantity)}
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-xs">
            <label className="block font-bold mb-1">Terms &amp; Warranty Conditions</label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Right Totals & Submit */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit text-xs">
          <h2 className="text-base font-extrabold text-navy-900 border-b border-slate-200 pb-2">
            Quotation Tax &amp; Totals
          </h2>
          <div>
            <label className="block font-bold mb-1">Overall Discount (KES)</label>
            <input
              type="number"
              min={0}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Delivery / Transport Fee (KES)</label>
            <input
              type="number"
              min={0}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span>VATable Items Subtotal:</span>
              <span>{formatKes(vatableSubtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Non-VAT (Exempt) Subtotal:</span>
              <span>{formatKes(nonVatableSubtotal)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Subtotal (Excl. VAT):</span>
              <span>{formatKes(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-solar-600">
                <span>Discount:</span>
                <span>- {formatKes(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-amber-800 font-semibold">
              <span>VAT (16% on VATable Items):</span>
              <span>{formatKes(totalVat)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-navy-900 border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span className="text-solar-600">{formatKes(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || lines.length === 0}
            className="w-full bg-solar-600 hover:bg-solar-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> {submitting ? 'Generating...' : 'Generate Official Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
};
