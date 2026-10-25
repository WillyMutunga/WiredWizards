import React, { useEffect, useState } from 'react';
import { FileText, Package, Receipt, Download, CheckCircle2, Clock } from 'lucide-react';
import { api, formatKes } from '../../api/client';
import { openAuthenticatedPdf } from '../../api/pdf';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const AccountPortalPage: React.FC = () => {
  const [tab, setTab] = useState<'orders' | 'invoices' | 'receipts' | 'quotations'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selectedOrderTimeline, setSelectedOrderTimeline] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data?.data || []));
    api.get('/invoices').then((r) => setInvoices(r.data?.data || []));
    api.get('/receipts').then((r) => setReceipts(r.data?.data || []));
    api.get('/quotations').then((r) => setQuotations(r.data?.data || []));
  }, []);

  const viewTimeline = async (orderNumber: string) => {
    const res = await api.get(`/orders/${orderNumber}`);
    setSelectedOrderTimeline(res.data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-navy-900 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Customer Self-Service &amp; Document Hub</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track your solar deliveries and download official KRA Tax Invoices &amp; Itemized Receipts (with per-item VAT status).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'invoices', label: `Tax Invoices (${invoices.length})`, icon: FileText },
            { id: 'receipts', label: `Official Receipts (${receipts.length})`, icon: Receipt },
            { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileText },
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

              {/* Itemized Receipt VAT Table */}
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
    </div>
  );
};
