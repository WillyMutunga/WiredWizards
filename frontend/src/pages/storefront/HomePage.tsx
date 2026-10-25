import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  Zap,
  BatteryCharging,
  Droplets,
  Lightbulb,
  Cable,
} from 'lucide-react';
import { api } from '../../api/client';
import { ProductCard } from '../../components/storefront/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, featRes, allRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=1&per_page=8'),
          api.get('/products?per_page=8'),
        ]);
        setCategories(catRes.data?.categories || []);
        setFeaturedProducts(featRes.data?.data || []);
        setAllProducts(allRes.data?.data || []);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const categoryIcons: Record<string, any> = {
    'solar-panels': Sun,
    'solar-inverters': Zap,
    'solar-batteries': BatteryCharging,
    'solar-water-pumps': Droplets,
    'solar-lighting': Lightbulb,
    'accessories-and-cables': Cable,
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-engineering-700 text-white py-12 px-4 sm:px-6 border-b-4 border-solar-600">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-solar-600/20 border border-solar-500/40 text-solar-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sun className="w-4 h-4" /> Tier-1 Solar Engineering &amp; Supplies
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Power Your Home, Farm &amp; Business with{' '}
              <span className="text-solar-500">Reliable Solar Energy</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Shop genuine Jinko N-Type Panels, Growatt Hybrid Inverters, Felicity LiFePO4 Lithium Batteries &amp; Submersible Borehole Pumps. Transparent{' '}
              <strong className="text-emerald-400">VAT-Exempt</strong> vs{' '}
              <strong className="text-amber-400">16% VAT</strong> pricing with instant itemized PDF receipts.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/products"
                className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm shadow-lg transition"
              >
                Shop All Solar Equipment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?is_vatable=0"
                className="bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-lg inline-flex items-center gap-2 text-sm border border-emerald-400/30 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Browse VAT-Exempt Solar
              </Link>
              <Link
                to="/compare"
                className="bg-navy-800 hover:bg-slate-800 text-slate-200 font-bold px-5 py-3 rounded-lg text-sm border border-slate-700 transition"
              >
                Compare Specs
              </Link>
            </div>
          </div>

          {/* Right Highlight Promo Box */}
          <div className="lg:col-span-5 bg-navy-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-solar-500 font-bold">
                  Multi-Branch Live Stock
                </span>
                <h3 className="text-lg font-bold text-white">Instant Dispatch &amp; Pickup</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                3 Branches Online
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-navy-900 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-solar-500">NBO-WH</div>
                <div className="text-slate-300 mt-0.5">Nairobi Hub</div>
              </div>
              <div className="bg-navy-900 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-solar-500">MCK-RET</div>
                <div className="text-slate-300 mt-0.5">Machakos</div>
              </div>
              <div className="bg-navy-900 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-solar-500">KTU-RET</div>
                <div className="text-slate-300 mt-0.5">Kitui Store</div>
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-navy-950/70 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-white">✓ Official KRA Tax Invoices &amp; Itemized Receipts</div>
              <p className="text-slate-400">
                Every order and quotation clearly separates <strong>VAT Exempt (Non-VAT)</strong> solar modules from <strong>16% VATable</strong> accessories on your official receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Transparent VAT Status</div>
              <div className="text-slate-500">VATable vs Non-VAT shown on every item</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-solar-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Up to 12-Yr Warranty</div>
              <div className="text-slate-500">Genuine Tier-1 serial-tracked hardware</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-engineering-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Countrywide Delivery</div>
              <div className="text-slate-500">Nairobi, Machakos, Kitui &amp; all 47 counties</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">M-Pesa Till 543210</div>
              <div className="text-slate-500">Instant digital PDF receipt generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-navy-900">Shop by Solar Category</h2>
            <Link to="/products" className="text-xs font-bold text-solar-600 hover:underline">
              View Full Catalog &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Sun;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="bg-white hover:bg-solar-50 border border-slate-200 hover:border-solar-500 rounded-xl p-4 text-center transition group shadow-sm"
                >
                  <div className="w-11 h-11 rounded-full bg-navy-900 text-solar-500 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 line-clamp-1">{cat.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cat.products_count ?? 0} Products</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Solar Deals */}
        <section>
          <div className="bg-gradient-to-r from-solar-600 to-solar-700 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-base uppercase tracking-wide">
              <Zap className="w-5 h-5" /> Top Featured Solar Equipment
            </div>
            <Link to="/products?featured=1" className="text-xs font-bold underline">
              See All Deals
            </Link>
          </div>
          <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-4">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading solar catalog...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(featuredProducts.length > 0 ? featuredProducts : allProducts).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Complete Catalog Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy-900">All Solar Hardware &amp; Accessories</h2>
              <p className="text-xs text-slate-500">
                Notice the green <strong>VAT Exempt (Non-VAT)</strong> and amber <strong>VATable (16%)</strong> badges on every product.
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-solar-600 hover:underline">
              Open Filterable Catalog &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
