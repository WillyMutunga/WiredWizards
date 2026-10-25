import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  User,
  GitCompare,
  LayoutDashboard,
  LogOut,
  FileText,
  X,
  MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { formatKes } from '../../api/client';

export const StorefrontLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getTotals } = useCartStore();
  const { items: compareItems, removeCompare, clearCompare } = useCompareStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { itemCount, grandTotal } = getTotals();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const isStaff = user && ['super_admin', 'inventory_manager', 'sales_agent'].includes(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Main Brand Header — Full-bleed so Logo starts right at the top-left margin */}
      <header className="bg-navy-900 text-white sticky top-0 z-40 shadow-lg border-b-2 border-solar-600">
        <div className="w-full pl-2 pr-4 sm:pr-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo Flush at Top-Left Margin */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.jpeg"
              alt="Wired Wizards Logo"
              className="h-12 w-auto rounded bg-white p-0.5 object-contain shadow-sm"
            />
            <div className="hidden sm:block">
              <div className="font-extrabold text-base tracking-tight leading-none text-white">
                WIRED <span className="text-solar-500">WIZARDS</span>
              </div>
              <div className="text-[10px] text-slate-300 tracking-wider uppercase mt-0.5">
                Engineering &amp; General Supplies Ltd
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto flex">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solar panels, inverters, batteries, water pumps..."
                className="w-full pl-10 pr-4 py-2 rounded-l-xl text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-r-xl transition"
            >
              Search
            </button>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isStaff && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-engineering-700 hover:bg-engineering-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-navy-800 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700"
                >
                  <User className="w-4 h-4 text-solar-500" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-navy-800 hover:bg-red-600/80 text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-800 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700"
              >
                <User className="w-4 h-4 text-solar-500" />
                Sign In
              </Link>
            )}

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition shadow"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-navy-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">{formatKes(grandTotal)}</span>
            </Link>
          </div>
        </div>

        {/* Category Quick Navigation Strip */}
        <nav className="bg-navy-800/95 border-t border-slate-800 text-xs">
          <div className="w-full px-3 sm:px-6 py-2 flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            <Link to="/products" className="font-bold text-solar-500 hover:underline">
              All Solar Equipment
            </Link>
            <Link to="/products?category=solar-panels" className="text-slate-200 hover:text-solar-500 font-medium">
              Solar Panels
            </Link>
            <Link to="/products?category=solar-inverters" className="text-slate-200 hover:text-solar-500 font-medium">
              Solar Inverters
            </Link>
            <Link to="/products?category=solar-batteries" className="text-slate-200 hover:text-solar-500 font-medium">
              Lithium Batteries
            </Link>
            <Link to="/products?category=solar-water-pumps" className="text-slate-200 hover:text-solar-500 font-medium">
              Water Pumps
            </Link>
            <Link to="/products?category=solar-lighting" className="text-slate-200 hover:text-solar-500 font-medium">
              Solar Streetlights
            </Link>
            {compareItems.length > 0 && (
              <Link to="/compare" className="text-amber-400 font-semibold hover:underline">
                Compare ({compareItems.length}/4)
              </Link>
            )}
            {user && (
              <Link to="/account" className="ml-auto text-solar-500 font-semibold inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> My Orders &amp; Receipts
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Technical Comparison Tray */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-[540px] bg-navy-900 text-white rounded-2xl shadow-2xl border-2 border-solar-500 p-4 z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-solar-500">
              <GitCompare className="w-4 h-4" /> Compare Products ({compareItems.length}/4)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Clear
              </button>
              <Link
                to="/compare"
                className="bg-solar-600 hover:bg-solar-700 text-white text-xs font-bold px-3 py-1 rounded-lg"
              >
                Compare Now
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {compareItems.map((item) => (
              <div
                key={item.id}
                className="bg-navy-800 rounded-lg p-2 text-xs relative border border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => removeCompare(item.id)}
                  className="absolute top-1 right-1 text-slate-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="font-semibold truncate pr-3">{item.name}</div>
                <div className="text-[10px] text-solar-500 font-mono">{formatKes(item.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Helpline */}
      <a
        href="https://wa.me/254712345678?text=Hello%20Wired%20Wizards%20Engineering,%20I%20need%20assistance%20with%20solar%20equipment."
        target="_blank"
        rel="noreferrer"
        title="Chat on WhatsApp"
        className="fixed bottom-5 right-5 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-xl z-50 flex items-center justify-center transition transform hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Clean Footer */}
      <footer className="bg-navy-950 text-slate-400 text-xs border-t border-navy-800 mt-16">
        <div className="w-full px-3 sm:px-5 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-extrabold text-white text-sm mb-2">
              WIRED <span className="text-solar-500">WIZARDS</span> ENGINEERING &amp; GENERAL SUPPLIES LTD
            </div>
            <p className="leading-relaxed">
              Solar Panels, Hybrid Inverters, Lithium (LiFePO4) Battery Banks, Solar Water Pumps &amp; Streetlights.
            </p>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider mb-2">Branches</div>
            <p className="leading-relaxed">
              Nairobi (Industrial Area) • Machakos Town • Kitui Town
            </p>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider mb-2">Contact &amp; Support</div>
            <p className="leading-relaxed">
              Tel: +254 712 345 678 • Email: sales@wiredwizards.co.ke
            </p>
          </div>
        </div>
        <div className="border-t border-navy-900 py-3.5 text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} Wired Wizards Engineering and General Supplies Ltd.
        </div>
      </footer>
    </div>
  );
};
