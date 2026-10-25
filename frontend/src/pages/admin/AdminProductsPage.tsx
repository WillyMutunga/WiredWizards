import React, { useEffect, useState } from 'react';
import { PackagePlus, ShieldCheck, Receipt } from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category_id: 1,
    brand_id: 1,
    buying_price: '',
    selling_price: '',
    discount_price: '',
    is_vatable: false,
    vat_rate: 0,
    warranty_period: '5 Years',
    description: '',
    rated_power: '550W',
    voltage: '48VDC',
  });

  const loadProducts = () => {
    api.get('/products?per_page=50').then((r) => setProducts(r.data?.data || []));
  };

  useEffect(() => {
    loadProducts();
    api.get('/categories').then((r) => {
      setCategories(r.data?.categories || []);
      setBrands(r.data?.brands || []);
    });
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/products', {
        name: form.name,
        sku: form.sku,
        category_id: Number(form.category_id),
        brand_id: Number(form.brand_id),
        buying_price: Number(form.buying_price),
        selling_price: Number(form.selling_price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        is_vatable: form.is_vatable,
        vat_rate: form.is_vatable ? Number(form.vat_rate || 16) : 0,
        warranty_period: form.warranty_period,
        description: form.description,
        technical_specs: {
          rated_power: form.rated_power,
          nominal_voltage: form.voltage,
        },
      });
      setMsg('Product created with specified VAT compliance status!');
      setShowCreate(false);
      loadProducts();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const toggleProductVat = async (product: any) => {
    try {
      const nextVatable = !product.is_vatable;
      await api.put(`/products/${product.id}`, {
        is_vatable: nextVatable,
        vat_rate: nextVatable ? 16 : 0,
      });
      loadProducts();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-solar-600" /> Product Catalog &amp; VAT Compliance Manager
          </h1>
          <p className="text-xs text-slate-500">
            Specify whether each product is <strong>VAT Compliant (16% VAT)</strong> or <strong>Non-VAT (VAT Exempt Solar)</strong> during creation or editing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-solar-600 hover:bg-solar-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow"
        >
          {showCreate ? 'Close Product Form' : '+ Add New Solar Product'}
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreateProduct}
          className="bg-white rounded-2xl border-2 border-solar-500 p-6 shadow-lg space-y-4 text-xs"
        >
          <h2 className="text-base font-extrabold text-navy-900 border-b border-slate-200 pb-2">
            Create New Solar Product (Specify VAT Status)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Deye 8kW Hybrid Solar Inverter SUN-8K-SG01LP1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="SOL-INV-8KW-DEYE"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Explicit VAT Compliance Selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block font-extrabold text-navy-900 uppercase">
              KRA VAT Compliance Classification *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_vatable: false, vat_rate: 0 })}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  !form.is_vatable
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30'
                    : 'border-slate-300 bg-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">Non-VAT (VAT Exempt Solar Equipment)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    0% VAT charged. Displayed as &ldquo;VAT Exempt (Non-VAT)&rdquo; to customers and on receipts.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, is_vatable: true, vat_rate: 16 })}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  form.is_vatable
                    ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/30'
                    : 'border-slate-300 bg-white'
                }`}
              >
                <Receipt className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900">VAT Compliant (16% Standard VAT)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    16% VAT calculated at checkout and itemized on Tax Invoices and Official Receipts.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Buying Cost (KES) *</label>
              <input
                type="number"
                required
                value={form.buying_price}
                onChange={(e) => setForm({ ...form, buying_price: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Selling Price (KES) *</label>
              <input
                type="number"
                required
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Discount Price (Optional)</label>
              <input
                type="number"
                value={form.discount_price}
                onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Technical Description *</label>
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="bg-navy-900 hover:bg-solar-600 text-white font-bold px-6 py-2.5 rounded-lg"
          >
            Save Product to Catalog
          </button>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
              <th className="p-3.5">SKU / Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5 text-center">Customer VAT Status</th>
              <th className="p-3.5 text-right">Effective Price</th>
              <th className="p-3.5 text-right">Quick Toggle VAT</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-200">
                <td className="p-3.5">
                  <div className="font-bold text-navy-900">{p.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{p.sku}</div>
                </td>
                <td className="p-3.5">{p.category?.name}</td>
                <td className="p-3.5 text-center">
                  <VatStatusBadge
                    isVatable={p.is_vatable}
                    vatRate={p.vat_rate}
                    vatStatus={p.vat_status}
                  />
                </td>
                <td className="p-3.5 text-right font-extrabold">
                  {formatKes(p.effective_price)}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => toggleProductVat(p)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    Switch to {p.is_vatable ? 'Non-VAT (0%)' : '16% VAT'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
