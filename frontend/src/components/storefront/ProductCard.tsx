import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  GitCompare,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Heart,
} from 'lucide-react';
import { api, formatKes } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { useAuthStore } from '../../store/authStore';
import { VatStatusBadge } from '../common/VatStatusBadge';
import { SolarProductArtwork } from './SolarProductArtwork';

interface Props {
  product: any;
}

const PRIORITY_SPEC_KEYS = [
  'rated_power',
  'usable_capacity',
  'power_rating',
  'lumens',
  'cross_section',
  'efficiency',
  'battery_voltage',
  'nominal_voltage',
  'cell_type',
  'max_head',
  'roll_length',
];

export const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const compareItems = useCompareStore((s) => s.items);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const [wishlisted, setWishlisted] = useState(false);

  const isCompared = compareItems.some((i) => i.id === product.id);
  const sellingPrice = Number(product.selling_price || 0);
  const effectivePrice = Number(product.effective_price ?? product.discount_price ?? sellingPrice);
  const hasDiscount = effectivePrice < sellingPrice && sellingPrice > 0;
  const discountPct = hasDiscount ? Math.round(((sellingPrice - effectivePrice) / sellingPrice) * 100) : 0;

  const stockStatus = product.inventory_summary?.status || 'In Stock';
  const totalAvailable = Number(product.inventory_summary?.total_available ?? 10);
  const specs = product.technical_specs || {};

  const sortedSpecEntries = Object.entries(specs).sort(([a], [b]) => {
    const idxA = PRIORITY_SPEC_KEYS.indexOf(a);
    const idxB = PRIORITY_SPEC_KEYS.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });
  const topSpecs = sortedSpecEntries.slice(0, 2);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/wishlist/toggle', { product_id: product.id });
      setWishlisted(Boolean(res.data?.in_wishlist));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-solar-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Visual Canvas */}
      <Link
        to={`/products/${product.slug}`}
        className="relative h-52 bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/60 flex items-center justify-center p-5 border-b border-slate-100 overflow-hidden"
      >
        <SolarProductArtwork product={product} />

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-solar-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-sm tracking-wide">
            SAVE {discountPct}%
          </span>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleToggleWishlist}
            title="Save to Wishlist"
            className={`p-2 rounded-full border transition shadow-sm ${
              wishlisted
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-500 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product);
            }}
            title="Add to Technical Comparison"
            className={`p-2 rounded-full border transition shadow-sm ${
              isCompared
                ? 'bg-engineering-700 text-white border-engineering-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-solar-500 hover:text-solar-600'
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-2.5 left-3">
          <VatStatusBadge
            isVatable={product.is_vatable}
            vatRate={product.vat_rate}
            vatStatus={product.vat_status}
          />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="font-bold text-engineering-700 uppercase tracking-wider text-[10px]">
              {product.category?.name || 'Solar Hardware'}
            </span>
            {product.brand?.name && (
              <span className="text-[11px] font-semibold text-slate-400">
                {product.brand.name}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="font-bold text-slate-900 group-hover:text-solar-600 line-clamp-2 text-[15px] leading-snug mb-3 transition-colors"
          >
            {product.name}
          </Link>

          {/* Key Electrical Spec Pills */}
          {topSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {topSpecs.map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-md font-semibold border border-slate-200/70"
                >
                  <Zap className="w-3 h-3 text-solar-600 shrink-0" />
                  {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          {/* Pricing & Stock */}
          <div className="flex items-end justify-between gap-2 mb-3.5">
            <div>
              <div className="text-lg font-extrabold text-navy-900 leading-none">
                {formatKes(effectivePrice)}
              </div>
              {hasDiscount ? (
                <div className="text-xs text-slate-400 line-through mt-1">
                  {formatKes(sellingPrice)}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 mt-1">
                  {product.is_vatable ? `+ ${product.vat_rate}% VAT` : '0% VAT (Exempt)'}
                </div>
              )}
            </div>

            <div className="text-right text-xs">
              {stockStatus === 'In Stock' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> {totalAvailable} in stock
                </span>
              ) : stockStatus === 'Low Stock' ? (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  <AlertTriangle className="w-3 h-3" /> {totalAvailable} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  <XCircle className="w-3 h-3" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            disabled={totalAvailable <= 0}
            onClick={() => addItem(product, 1)}
            className="w-full py-2.5 px-4 rounded-xl bg-solar-600 hover:bg-solar-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm hover:shadow"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalAvailable > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};
