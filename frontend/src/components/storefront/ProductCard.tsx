import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, GitCompare, Zap, CheckCircle2, AlertTriangle, XCircle, Sun } from 'lucide-react';
import { formatKes } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { VatStatusBadge } from '../common/VatStatusBadge';

interface Props {
  product: any;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const compareItems = useCompareStore((s) => s.items);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);

  const isCompared = compareItems.some((i) => i.id === product.id);
  const sellingPrice = Number(product.selling_price || 0);
  const effectivePrice = Number(product.effective_price ?? product.discount_price ?? sellingPrice);
  const hasDiscount = effectivePrice < sellingPrice && sellingPrice > 0;
  const discountPct = hasDiscount ? Math.round(((sellingPrice - effectivePrice) / sellingPrice) * 100) : 0;

  const stockStatus = product.inventory_summary?.status || 'In Stock';
  const totalAvailable = Number(product.inventory_summary?.total_available ?? 10);
  const specs = product.technical_specs || {};
  const topSpecs = Object.entries(specs).slice(0, 2);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-solar-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Image & Badges */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 overflow-hidden">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-navy-900/40">
            <Sun className="w-16 h-16 text-solar-500/70 mb-1" />
            <span className="text-[11px] font-mono uppercase tracking-wider">{product.sku}</span>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-solar-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
            -{discountPct}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(product)}
          title="Compare Technical Specs"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full border transition ${
            isCompared
              ? 'bg-engineering-700 text-white border-engineering-700 shadow'
              : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <GitCompare className="w-4 h-4" />
        </button>

        <div className="absolute bottom-2 left-2.5">
          <VatStatusBadge
            isVatable={product.is_vatable}
            vatRate={product.vat_rate}
            vatStatus={product.vat_status}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
            <span className="font-medium text-engineering-700 truncate">
              {product.category?.name || 'Solar Equipment'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">{product.sku}</span>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="font-bold text-slate-900 hover:text-solar-600 line-clamp-2 text-sm leading-snug mb-2"
          >
            {product.name}
          </Link>

          {/* Mini Technical Spec Pills */}
          {topSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topSpecs.map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium"
                >
                  <Zap className="w-3 h-3 text-solar-600" />
                  {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Pricing & Stock */}
          <div className="mb-3">
            <div className="text-lg font-extrabold text-navy-900">{formatKes(effectivePrice)}</div>
            <div className="flex items-center justify-between text-xs mt-0.5">
              {hasDiscount ? (
                <span className="text-slate-400 line-through">{formatKes(sellingPrice)}</span>
              ) : (
                <span className="text-slate-400">
                  {product.is_vatable ? `+ ${product.vat_rate}% VAT at checkout` : '0% VAT (Solar Exempt)'}
                </span>
              )}

              {stockStatus === 'In Stock' ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({totalAvailable})
                </span>
              ) : stockStatus === 'Low Stock' ? (
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({totalAvailable})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={totalAvailable <= 0}
            onClick={() => addItem(product, 1)}
            className="w-full py-2.5 px-4 rounded-lg bg-solar-600 hover:bg-solar-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalAvailable > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};
