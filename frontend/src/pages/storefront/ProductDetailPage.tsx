import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  GitCompare,
  FileDown,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Star,
  Sun,
  Award,
} from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { useAuthStore } from '../../store/authStore';
import { VatStatusBadge } from '../../components/common/VatStatusBadge';
import { SolarProductArtwork } from '../../components/storefront/SolarProductArtwork';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [waLink, setWaLink] = useState('');

  // Review state
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const addItem = useCartStore((s) => s.addItem);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        const prod = res.data?.data || res.data;
        setProduct(prod);
        if (prod?.id) {
          api.get(`/whatsapp/product/${prod.id}`).then((r) => setWaLink(r.data?.link || ''));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg('');
    try {
      const res = await api.post(`/products/${product.id}/reviews`, { rating, comment });
      setReviewMsg(res.data?.message || 'Review submitted for moderation!');
      setComment('');
    } catch (err) {
      setReviewMsg(extractErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="w-full px-3 sm:px-5 py-12 text-center text-sm text-slate-500">Loading product specifications...</div>;
  }

  if (!product) {
    return (
      <div className="w-full px-3 sm:px-5 py-12 text-center">
        <h2 className="text-lg font-bold">Product Not Found</h2>
        <Link to="/products" className="text-solar-600 text-xs underline mt-2 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const sellingPrice = Number(product.selling_price || 0);
  const effectivePrice = Number(product.effective_price ?? product.discount_price ?? sellingPrice);
  const isVatable = Boolean(product.is_vatable);
  const vatRate = isVatable ? Number(product.vat_rate ?? 16) : 0;
  const unitVatAmount = isVatable ? Number(((effectivePrice * vatRate) / 100).toFixed(2)) : 0;
  const specs = product.technical_specs || {};
  const available = Number(product.inventory_summary?.total_available ?? 0);

  return (
    <div className="w-full px-3 sm:px-5 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-solar-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-solar-600">Catalog</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{product.name}</span>
      </div>

      {/* Main Product Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Image Area */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200/60 rounded-xl p-6 border border-slate-200 min-h-[320px] group">
          <SolarProductArtwork product={product} />
        </div>

        {/* Right Product Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-engineering-100 text-engineering-700 text-xs font-bold px-2.5 py-0.5 rounded">
              {product.category?.name || 'Solar Hardware'}
            </span>
            {product.brand?.name && (
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                Brand: {product.brand.name}
              </span>
            )}
            <VatStatusBadge
              isVatable={product.is_vatable}
              vatRate={product.vat_rate}
              vatStatus={product.vat_status}
              size="md"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-navy-900">{product.name}</h1>

          <div className="text-xs text-slate-500 font-mono">
            SKU: <strong className="text-slate-800">{product.sku}</strong>
            {product.warranty_period && (
              <span className="ml-4 inline-flex items-center gap-1 text-solar-600 font-sans font-bold">
                <Award className="w-3.5 h-3.5" /> Warranty: {product.warranty_period}
              </span>
            )}
          </div>

          {/* Pricing & Explicit Customer VAT Breakdown Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-navy-900">{formatKes(effectivePrice)}</span>
              {effectivePrice < sellingPrice && (
                <span className="text-sm text-slate-400 line-through">{formatKes(sellingPrice)}</span>
              )}
            </div>

            {isVatable ? (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <strong>VAT Status — {product.vat_status}:</strong> This product attracts{' '}
                <strong>{vatRate}% VAT ({formatKes(unitVatAmount)} per unit)</strong>. Total inclusive unit price at checkout &amp; receipting:{' '}
                <strong>{formatKes(effectivePrice + unitVatAmount)}</strong>.
              </div>
            ) : (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>VAT Status — {product.vat_status}:</strong> Zero/Exempt VAT renewable solar equipment. You pay{' '}
                  <strong>KES 0.00 VAT</strong> on this item at checkout and on your official receipt.
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Availability */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            {product.inventory_summary?.status || 'In Stock'} ({available} units available across Nairobi, Machakos &amp; Kitui)
          </div>

          {/* Quantity & Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-sm"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-sm"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={available <= 0}
              onClick={() => addItem(product, quantity)}
              className="bg-solar-600 hover:bg-solar-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg inline-flex items-center gap-2 shadow transition"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>

            <button
              type="button"
              onClick={() => toggleCompare(product)}
              className="bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-4 py-3 rounded-lg inline-flex items-center gap-1.5"
            >
              <GitCompare className="w-4 h-4" /> Compare
            </button>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-lg inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Inquire on WhatsApp
              </a>
            )}

            {product.datasheet_url && (
              <a
                href={product.datasheet_url}
                target="_blank"
                rel="noreferrer"
                className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-3 rounded-lg inline-flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4 text-solar-600" /> Technical Datasheet (PDF)
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Technical Specifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-navy-900 mb-4">
          Engineering &amp; Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-semibold text-slate-500 uppercase">KRA VAT Classification</span>
            <span className="font-bold text-navy-900">{product.vat_status}</span>
          </div>
          {Object.entries(specs).map(([key, val]) => (
            <div
              key={key}
              className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <span className="font-semibold text-slate-500 uppercase">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-bold text-navy-900">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-extrabold text-navy-900">
            Verified Customer Reviews ({product.reviews?.count || 0})
          </h2>
          {product.reviews?.items?.length > 0 ? (
            <div className="space-y-3">
              {product.reviews.items.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rev.user_name || 'Verified Buyer'}</span>
                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}/5
                    </span>
                  </div>
                  <p className="text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No approved reviews yet for this equipment.</p>
          )}
        </div>

        <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-navy-900 mb-2">Write a Product Review</h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value={5}>5 Stars — Excellent Output</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Average</option>
                  <option value={2}>2 Stars — Below Expectations</option>
                  <option value={1}>1 Star — Poor</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Your Experience</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how this panel, inverter or battery performs..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              {reviewMsg && <div className="text-emerald-700 font-semibold">{reviewMsg}</div>}
              <button
                type="submit"
                className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-4 py-2 rounded-lg"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">
              Please <Link to="/login" className="text-solar-600 font-bold underline">Sign In</Link> to submit a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
