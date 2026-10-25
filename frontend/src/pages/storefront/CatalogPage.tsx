import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  ShieldCheck,
  Receipt,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import { ProductCard } from '../../components/storefront/ProductCard';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [isVatable, setIsVatable] = useState(searchParams.get('is_vatable') ?? '');
  const [wattage, setWattage] = useState(searchParams.get('wattage') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data?.categories || []);
      setBrands(res.data?.brands || []);
    });
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setBrand(searchParams.get('brand') || '');
    setIsVatable(searchParams.get('is_vatable') ?? '');
    setWattage(searchParams.get('wattage') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = { per_page: 24 };
        if (search) params.search = search;
        if (category) params.category = category;
        if (brand) params.brand = brand;
        if (isVatable !== '') params.is_vatable = isVatable;
        if (wattage) params.wattage = wattage;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const res = await api.get('/products', { params });
        setProducts(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, brand, isVatable, wattage, minPrice, maxPrice]);

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setIsVatable('');
    setWattage('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = Number(a.effective_price ?? a.selling_price ?? 0);
    const priceB = Number(b.effective_price ?? b.selling_price ?? 0);
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    return 0;
  });

  const wattagePills = ['300W', '550W', '1.5 HP', '5000W', '10.24 kWh'];
  const hasActiveFilters = Boolean(search || category || brand || isVatable !== '' || wattage || minPrice || maxPrice);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top Breadcrumb & Category Quick Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-solar-600 font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="font-bold text-navy-900">Solar Equipment Catalog</span>
          {category && (
            <>
              <span>/</span>
              <span className="font-bold text-solar-600 capitalize">
                {category.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-navy-900">{sortedProducts.length}</strong> product(s)
          </span>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-navy-900 focus:outline-none focus:border-solar-500"
            >
              <option value="featured">Featured &amp; Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Faceted Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2 font-extrabold text-sm text-navy-900">
              <SlidersHorizontal className="w-4 h-4 text-solar-600" /> Filter Specifications
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-solar-600 hover:text-solar-700 inline-flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          {/* Keyword Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Search Model or SKU
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Jinko 550W, Growatt..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-solar-500 transition"
              />
            </div>
          </div>

          {/* VAT Tax Classification Filter Cards */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              VAT Tax Status
            </label>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setIsVatable('')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border font-semibold transition ${
                  isVatable === ''
                    ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-solar-500" /> All Equipment
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsVatable('0')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border font-semibold transition ${
                  isVatable === '0'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> VAT Exempt (Non-VAT)
                </span>
                <span className="text-[10px] font-bold">0%</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVatable('1')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border font-semibold transition ${
                  isVatable === '1'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/70'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" /> VAT Compliant
                </span>
                <span className="text-[10px] font-bold">16%</span>
              </button>
            </div>
          </div>

          {/* Category List */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Product Category
            </label>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold transition ${
                  category === ''
                    ? 'bg-solar-50 text-solar-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Solar Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-medium transition ${
                    category === c.slug
                      ? 'bg-solar-50 text-solar-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[11px] text-slate-400">{c.products_count ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Manufacturer Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
            >
              <option value="">All Tier-1 Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Power / Capacity Spec Pills */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Capacity / Rating
            </label>
            <div className="flex flex-wrap gap-1.5">
              {wattagePills.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWattage(wattage === w ? '' : w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    wattage === w
                      ? 'bg-solar-600 text-white border-solar-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-solar-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Budget Range (KES)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min KES"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
              <input
                type="number"
                placeholder="Max KES"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <section className="lg:col-span-9 space-y-4">
          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {category && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1 rounded-full font-semibold text-slate-700">
                  Category: {category}
                  <button type="button" onClick={() => setCategory('')}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </span>
              )}
              {isVatable !== '' && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1 rounded-full font-semibold text-slate-700">
                  {isVatable === '0' ? 'VAT Exempt (Non-VAT)' : '16% VATable'}
                  <button type="button" onClick={() => setIsVatable('')}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </span>
              )}
              {wattage && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1 rounded-full font-semibold text-slate-700">
                  Spec: {wattage}
                  <button type="button" onClick={() => setWattage('')}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-48 bg-slate-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-10 bg-slate-100 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="text-base font-bold text-slate-800">
                No matching solar equipment found
              </div>
              <p className="text-xs text-slate-500">
                Try clearing your filters or searching a broader term.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-solar-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
