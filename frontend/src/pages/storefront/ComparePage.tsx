import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, ShoppingCart, Trash2 } from 'lucide-react';
import { api, formatKes } from '../../api/client';
import { useCompareStore } from '../../store/compareStore';
import { useCartStore } from '../../store/cartStore';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';

export const ComparePage: React.FC = () => {
  const { items, removeCompare, clearCompare } = useCompareStore();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    const ids = items.map((i) => i.id).join(',');
    api
      .get(`/products/compare?ids=${ids}`)
      .then((res) => setProducts(res.data?.data || []))
      .finally(() => setLoading(false));
  }, [items]);

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.technical_specs || {})))
  );

  return (
    <div className="w-full px-3 sm:px-5 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-solar-600" /> Side-by-Side Technical Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Compare electrical ratings, warranty, and VAT status across up to 4 solar products.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-red-600 font-bold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="font-bold text-slate-800">No products selected for comparison</div>
          <Link
            to="/products"
            className="inline-block bg-solar-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg"
          >
            Browse Solar Catalog
          </Link>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border p-12 text-center text-xs text-slate-500">
          Loading comparison matrix...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 w-48 font-bold text-navy-900 uppercase">Specification</th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 min-w-[220px] border-l border-slate-200 align-top">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Link to={`/products/${p.slug}`} className="font-extrabold text-sm text-navy-900 hover:text-solar-600">
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeCompare(p.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-base font-extrabold text-solar-600 mb-2">
                      {formatKes(p.effective_price)}
                    </div>
                    <div className="mb-3">
                      <VatStatusBadge
                        isVatable={p.is_vatable}
                        vatRate={p.vat_rate}
                        vatStatus={p.vat_status}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(p, 1)}
                      className="w-full bg-navy-900 hover:bg-solar-600 text-white font-bold py-2 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold bg-slate-50">SKU</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 border-l border-slate-200 font-mono">
                    {p.sku}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold bg-slate-50">Brand</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 border-l border-slate-200">
                    {p.brand?.name || '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold bg-slate-50">Warranty</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 border-l border-slate-200 font-semibold text-solar-700">
                    {p.warranty_period || '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold bg-slate-50">Stock Availability</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 border-l border-slate-200 font-semibold text-emerald-700">
                    {p.inventory_summary?.status} ({p.inventory_summary?.total_available} units)
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => (
                <tr key={key} className="border-b border-slate-200">
                  <td className="p-3 font-bold bg-slate-50 uppercase text-[11px] text-slate-600">
                    {key.replace(/_/g, ' ')}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 border-l border-slate-200 font-medium text-slate-800">
                      {p.technical_specs?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
