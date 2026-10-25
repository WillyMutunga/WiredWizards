import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  User,
  GitCompare,
  PhoneCall,
  MapPin,
  ShieldCheck,
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
      {/* Top Engineering Utility Bar */}
      <div className="bg-navy-950 text-slate-300 text-xs py-2 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-solar-500 font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Branches: Nairobi Warehouse • Machakos Store • Kitui Store
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> KRA PIN: P051982736Z (VAT & Solar Exempt Compliant)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+254712345678" className="hover:text-white inline-flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-solar-500" /> +254 712 345 678
            </a>
            <Link to="/compare" className="hover:text-solar-500 font-medium">
              Compare ({compareItems.length}/4)
            </Link>
          </div>
        </div>
      </div>

      {/* Main Brand Header (Midnight Navy #080c29) */}
      <header className="bg-navy-900 text-white sticky top-0 z-40 shadow-lg border-b-2 border-solar-600">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Wired Wizards Logo"
              className="h-12 w-auto rounded bg-white p-0.5 object-contain"
            />
            <div>
              <div className="font-extrabold text-lg tracking-tight leading-none text-white">
                WIRED <span className="text-solar-500">WIZARDS</span>
              </div>
              <div className="text-[11px] text-slate-300 tracking-wider uppercase mt-0.5">
                Engineering &amp; General Supplies Ltd
              </div>
            </div>
          </Link>

          {/* Jumia-Style Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto flex">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solar panels, 5kW inverters, LiFePO4 batteries, SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-l-lg text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-solar-600 hover:bg-solar-700 text-white font-bold text-sm px-5 py-2.5 rounded-r-lg transition"
            >
              SEARCH
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {isStaff && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-engineering-700 hover:bg-engineering-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                ERP / POS Portal
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-navy-800 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700"
                >
                  <User className="w-4 h-4 text-solar-500" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-navy-800 hover:bg-red-600/80 text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-800 hover:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-700"
              >
                <User className="w-4 h-4 text-solar-500" />
                Sign In / Register
              </Link>
            )}

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-solar-600 hover:bg-solar-700 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition shadow"
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
        <nav className="bg-navy-800 border-t border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-5 overflow-x-auto whitespace-nowrap">
            <Link to="/products" className="font-bold text-solar-500 hover:underline">
              All Solar Equipment
            </Link>
            <Link to="/products?category=solar-panels" className="text-slate-200 hover:text-solar-500">
              Solar Panels
            </Link>
            <Link to="/products?category=solar-inverters" className="text-slate-200 hover:text-solar-500">
              Hybrid &amp; Off-Grid Inverters
            </Link>
            <Link to="/products?category=solar-batteries" className="text-slate-200 hover:text-solar-500">
              Lithium (LiFePO4) Batteries
            </Link>
            <Link to="/products?category=solar-water-pumps" className="text-slate-200 hover:text-solar-500">
              Solar Water Pumps
            </Link>
            <Link to="/products?category=solar-lighting" className="text-slate-200 hover:text-solar-500">
              Solar Streetlights
            </Link>
            <Link to="/products?is_vatable=0" className="text-emerald-400 font-semibold hover:underline">
              ✓ VAT-Exempt Solar Items
            </Link>
            {user && (
              <Link to="/account" className="ml-auto text-solar-500 font-semibold inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> My Orders, Invoices &amp; Receipts
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
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:w-[540px] bg-navy-900 text-white rounded-xl shadow-2xl border-2 border-solar-500 p-3.5 z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-solar-500">
              <GitCompare className="w-4 h-4" /> Technical Spec Comparison ({compareItems.length}/4)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Clear All
              </button>
              <Link
                to="/compare"
                className="bg-solar-600 hover:bg-solar-700 text-white text-xs font-bold px-3 py-1 rounded"
              >
                Compare Now
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {compareItems.map((item) => (
              <div
                key={item.id}
                className="bg-navy-800 rounded p-2 text-xs relative border border-slate-700"
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

      {/* Floating WhatsApp Engineering Helpline */}
      <a
        href="https://wa.me/254712345678?text=Hello%20Wired%20Wizards%20Engineering,%20I%20need%20assistance%20sizing%20a%20solar%20system."
        target="_blank"
        rel="noreferrer"
        title="Chat with a Solar Engineer on WhatsApp"
        className="fixed bottom-5 right-5 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-xl z-50 flex items-center justify-center transition transform hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 text-xs border-t border-navy-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-extrabold text-white text-base mb-2">
              WIRED <span className="text-solar-500">WIZARDS</span> LTD
            </div>
            <p className="leading-relaxed mb-3">
              Wired Wizards Engineering and General Supplies Ltd — Tier-1 Solar Panels, Hybrid Inverters, LiFePO4 Battery Banks &amp; Borehole Solar Pumping Solutions across Kenya.
            </p>
            <div className="text-slate-300 font-mono text-[11px]">
              KRA PIN: P051982736Z • M-Pesa Buy Goods Till: <strong className="text-solar-500">543210</strong>
            </div>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider mb-3">Our Branches</div>
            <ul className="space-y-1.5">
              <li><strong className="text-slate-200">Nairobi Warehouse:</strong> Enterprise Rd, Industrial Area</li>
              <li><strong className="text-slate-200">Machakos Store:</strong> Mwatu Wa Ngoma St, Machakos</li>
              <li><strong className="text-slate-200">Kitui Store:</strong> Commercial St, Kitui Town</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider mb-3">Solar Categories</div>
            <ul className="space-y-1.5">
              <li><Link to="/products?category=solar-panels" className="hover:text-white">Monocrystalline Solar Panels</Link></li>
              <li><Link to="/products?category=solar-inverters" className="hover:text-white">Hybrid &amp; Off-Grid Inverters</Link></li>
              <li><Link to="/products?category=solar-batteries" className="hover:text-white">Lithium Ion (LiFePO4) Batteries</Link></li>
              <li><Link to="/products?category=solar-water-pumps" className="hover:text-white">DC Submersible Water Pumps</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider mb-3">Tax &amp; Receipting Policy</div>
            <p className="leading-relaxed">
              Every product clearly displays its KRA tax classification (<span className="text-emerald-400">VAT Exempt / Non-VAT</span> vs <span className="text-amber-400">16% VATable</span>). Official PDF Quotations, Tax Invoices, and Payment Receipts itemize VAT per line item.
            </p>
          </div>
        </div>
        <div className="border-t border-navy-900 py-4 text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} Wired Wizards Engineering and General Supplies Ltd. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};
