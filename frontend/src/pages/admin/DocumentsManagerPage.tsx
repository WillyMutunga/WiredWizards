import React, { useEffect, useState } from 'react';
import {
  FileText,
  Receipt,
  ArrowRightLeft,
  Download,
  MessageCircle,
  CreditCard,
} from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { openAuthenticatedPdf } from '../../api/pdf';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const DocumentsManagerPage: React.FC = () => {
  const [tab, setTab] = useState<'quotations' | 'invoices' | 'receipts'>('quotations');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  // Payment recording modal state
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('mpesa_till');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Selected Receipt for itemized VAT inspection
  const [inspectedReceipt, setInspectedReceipt] = useState<any>(null);

  const loadAll = () => {
    api.get('/quotations').then((r) => setQuotations(r.data?.data || []));
    api.get('/invoices').then((r) => setInvoices(r.data?.data || []));
    api.get('/receipts').then((r) => setReceipts(r.data?.data || []));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const convertToInvoice = async (quoteId: number) => {
    setMsg('');
    try {
      const res = await api.post(`/quotations/${quoteId}/convert-to-invoice`);
      setMsg(res.data?.message || 'Converted to Tax Invoice!');
      loadAll();
      setTab('invoices');
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    try {
      const res = await api.post(`/invoices/${payingInvoice.id}/record-payment`, {
        amount: Number(payAmount),
        payment_method: payMethod,
        transaction_reference: payRef,
        notes: payNotes,
      });
      setMsg(`Receipt ${res.data?.receipt?.receipt_number} generated!`);
      setPayingInvoice(null);
      setPayAmount('');
      setPayRef('');
      setPayNotes('');
      loadAll();
      setInspectedReceipt(res.data?.receipt);
      setTab('receipts');
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const openWhatsAppShare = async (type: 'quotations' | 'invoices', id: number) => {
    const res = await api.get(`/${type}/${id}/whatsapp-link`);
    if (res.data?.link) {
      window.open(res.data.link, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Quotations, Tax Invoices &amp; Itemized Receipts
          </h1>
          <p className="text-xs text-slate-500">
            Convert quotes to invoices, record full or partial deposits, and print itemized VAT receipts
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          {[
            { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileText },
            { id: 'invoices', label: `Tax Invoices (${invoices.length})`, icon: FileText },
            { id: 'receipts', label: `Official Receipts (${receipts.length})`, icon: Receipt },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold inline-flex items-center gap-1.5 transition ${
                  tab === t.id
                    ? 'bg-solar-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="bg-white rounded-2xl border-2 border-solar-500 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-solar-600" /> Record Payment Against{' '}
              {payingInvoice.invoice_number} (Balance: {formatKes(payingInvoice.balance_due)})
            </h3>
            <button
              type="button"
              onClick={() => setPayingInvoice(null)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Amount Paid (KES) *</label>
              <input
                type="number"
                required
                min={1}
                max={Number(payingInvoice.balance_due)}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Payment Method *</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="mpesa_till">M-Pesa Till (543210)</option>
                <option value="mpesa_stk">M-Pesa STK</option>
                <option value="bank_transfer">KCB Bank Transfer</option>
                <option value="cash">Cash at Counter</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Transaction Reference *</label>
              <input
                type="text"
                required
                placeholder="e.g. QKA8912XYZ"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg"
              >
                Save &amp; Issue Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotations Table */}
      {tab === 'quotations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">VAT</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-slate-200">
                  <td className="p-3.5 font-mono font-bold text-navy-900">{q.quotation_number}</td>
                  <td className="p-3.5 font-semibold">{q.customer?.name}</td>
                  <td className="p-3.5 uppercase font-bold text-engineering-700">{q.status}</td>
                  <td className="p-3.5 text-right">{formatKes(q.subtotal)}</td>
                  <td className="p-3.5 text-right text-amber-700 font-semibold">
                    {formatKes(q.vat_amount)}
                  </td>
                  <td className="p-3.5 text-right font-extrabold">{formatKes(q.grand_total)}</td>
                  <td className="p-3.5 text-right space-x-1.5">
                    {q.status !== 'converted' && (
                      <button
                        type="button"
                        onClick={() => convertToInvoice(q.id)}
                        className="inline-flex items-center gap-1 bg-navy-900 hover:bg-solar-600 text-white font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Convert to Invoice
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openAuthenticatedPdf(`/quotations/${q.id}/pdf`, `${q.quotation_number}.pdf`)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsAppShare('quotations', q.id)}
                      className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices Table */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5 text-right">VAT</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-200">
                  <td className="p-3.5 font-mono font-bold text-navy-900">{inv.invoice_number}</td>
                  <td className="p-3.5 font-semibold">{inv.customer?.name}</td>
                  <td className="p-3.5 uppercase font-bold text-solar-600">{inv.payment_status}</td>
                  <td className="p-3.5 text-right text-amber-700 font-semibold">
                    {formatKes(inv.vat_amount)}
                  </td>
                  <td className="p-3.5 text-right font-bold">{formatKes(inv.total_amount)}</td>
                  <td className="p-3.5 text-right font-extrabold text-red-600">
                    {formatKes(inv.balance_due)}
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    {Number(inv.balance_due) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayingInvoice(inv);
                          setPayAmount(String(inv.balance_due));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        + Record Payment
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openAuthenticatedPdf(`/invoices/${inv.id}/pdf`, `${inv.invoice_number}.pdf`)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsAppShare('invoices', inv.id)}
                      className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipts Table + Itemized VAT Breakdown Inspector */}
      {tab === 'receipts' && (
        <div className="space-y-4">
          {inspectedReceipt && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">
                    Official Payment Receipt — {inspectedReceipt.receipt_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Itemized VAT Compliance Breakdown (as printed on the customer's Receipt PDF)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAuthenticatedPdf(`/receipts/${inspectedReceipt.id}/pdf`, `${inspectedReceipt.receipt_number}.pdf`)
                    }
                    className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Open Official Receipt PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectedReceipt(null)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 uppercase text-[11px]">
                    <th className="p-2.5">Equipment</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5 text-center">VAT Status</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Line VAT (KES)</th>
                    <th className="p-2.5 text-right">Net Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(inspectedReceipt.invoice?.items || inspectedReceipt.order?.items || []).map((item: any) => (
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
                <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Payment Ref</th>
                  <th className="p-3.5 text-right">Amount Received</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-200">
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{rec.receipt_number}</td>
                    <td className="p-3.5 font-semibold">{rec.customer?.name}</td>
                    <td className="p-3.5 font-mono">{rec.transaction_reference}</td>
                    <td className="p-3.5 text-right font-extrabold">{formatKes(rec.amount)}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setInspectedReceipt(rec)}
                        className="bg-navy-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        View Itemized VAT
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
    </div>
  );
};
