import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search } from 'lucide-react';
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

  const wattagePills = ['300W', '550W', '1.5 HP', '5000W', '10.24 kWh'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Faceted Filter Sidebar */}
      <aside className="lg:col-span-3 space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-sm text-navy-900">
              <Filter className="w-4 h-4 text-solar-600" /> Filter Equipment
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-solar-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Keyword Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Keyword / SKU
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Jinko, 48V, SPF..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-solar-500"
              />
            </div>
          </div>

          {/* VAT Compliance Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              VAT Tax Classification
            </label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vat_filter"
                  checked={isVatable === ''}
                  onChange={() => setIsVatable('')}
                />
                <span>All Products (VAT &amp; Non-VAT)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-emerald-700 font-semibold">
                <input
                  type="radio"
                  name="vat_filter"
                  checked={isVatable === '0'}
                  onChange={() => setIsVatable('0')}
                />
                <span>VAT Exempt (Non-VAT Solar)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-amber-700 font-semibold">
                <input
                  type="radio"
                  name="vat_filter"
                  checked={isVatable === '1'}
                  onChange={() => setIsVatable('1')}
                />
                <span>VAT Compliant (16% VAT)</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.products_count ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Manufacturer Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wattage / Rating Quick Pills (JSONB Query) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Power / Capacity Spec
            </label>
            <div className="flex flex-wrap gap-1.5">
              {wattagePills.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWattage(wattage === w ? '' : w)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                    wattage === w
                      ? 'bg-solar-600 text-white border-solar-600'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Price Range (KES)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <section className="lg:col-span-9">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div>
            <h1 className="text-lg font-extrabold text-navy-900">Solar Equipment Catalog</h1>
            <p className="text-xs text-slate-500">
              Showing {products.length} item(s) • Every product shows its KRA VAT status badge
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500">
            Loading filtered solar products...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="text-base font-bold text-slate-800">No matching solar equipment found</div>
            <p className="text-xs text-slate-500">Try clearing your filters or searching a broader term.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-solar-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
