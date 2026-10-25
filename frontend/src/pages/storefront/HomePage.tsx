import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
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
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?per_page=12'),
        ]);
        setCategories(catRes.data?.categories || []);
        setProducts(prodRes.data?.data || []);
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
      {/* Clean Hero Banner */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-engineering-700 text-white py-8 px-3 sm:px-5 border-b-4 border-solar-600">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-solar-600/20 border border-solar-500/40 text-solar-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5" /> Solar Energy Solutions
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Power Your Home, Farm &amp; Business with{' '}
              <span className="text-solar-500">Reliable Solar Equipment</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Genuine Monocrystalline Panels, Hybrid Inverters, LiFePO4 Lithium Batteries &amp; Submersible Borehole Solar Pumps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/products"
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg transition"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-5 py-6 space-y-8">
        {/* Categories Strip */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-navy-900">Shop by Category</h2>
            <Link to="/products" className="text-xs font-bold text-solar-600 hover:underline">
              View All &rarr;
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
                  <div className="w-10 h-10 rounded-full bg-navy-900 text-solar-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 line-clamp-1">{cat.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{cat.products_count ?? 0} items</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-navy-900">Featured Solar Products</h2>
            <Link to="/products" className="text-xs font-bold text-solar-600 hover:underline">
              Filter &amp; Search All Products &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading solar products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
