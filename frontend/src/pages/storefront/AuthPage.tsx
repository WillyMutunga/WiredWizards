import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, KeyRound, Shield } from 'lucide-react';
import { api, extractErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    kra_pin: '',
    customer_type: 'individual',
    county: 'Machakos',
    town: 'Machakos Town',
    physical_details: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        login: loginId,
        password: loginPassword,
      });
      const { user, token } = res.data;
      setAuth(user, token);
      if (['super_admin', 'inventory_manager', 'sales_agent'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quickFillDemo = (email: string, pass: string) => {
    setTab('login');
    setLoginId(email);
    setLoginPassword(pass);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', regForm);
      const { user, token } = res.data;
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Auth Form */}
      <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
              tab === 'login'
                ? 'border-solar-600 text-solar-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5 inline mr-1" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
              tab === 'register'
                ? 'border-solar-600 text-solar-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Create Customer Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="admin@wiredwizards.co.ke or +2547..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-solar-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-solar-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-solar-600 hover:bg-solar-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition"
            >
              {loading ? 'Signing In...' : 'Sign In to Wired Wizards'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+2547..."
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  value={regForm.company_name}
                  onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client KRA PIN (Optional)</label>
                <input
                  type="text"
                  value={regForm.kra_pin}
                  onChange={(e) => setRegForm({ ...regForm, kra_pin: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={regForm.password_confirmation}
                  onChange={(e) => setRegForm({ ...regForm, password_confirmation: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-solar-600 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition"
            >
              {loading ? 'Creating Account...' : 'Register Customer Account'}
            </button>
          </form>
        )}
      </div>

      {/* Right Quick-Fill Pre-Seeded Role Accounts */}
      <div className="md:col-span-5 bg-navy-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-solar-500 font-extrabold text-sm uppercase tracking-wider">
          <KeyRound className="w-4 h-4" /> Quick Demo Role Switcher
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Click any pre-seeded role below to auto-fill credentials and inspect role-based permissions:
        </p>

        <div className="space-y-2.5 text-xs">
          <button
            type="button"
            onClick={() => quickFillDemo('admin@wiredwizards.co.ke', 'Admin@2026')}
            className="w-full text-left p-3 rounded-xl bg-navy-800 hover:bg-slate-800 border border-slate-700 transition"
          >
            <div className="flex items-center justify-between font-bold text-solar-500">
              <span>1. Super Admin (Director)</span>
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-slate-300 font-mono text-[11px] mt-0.5">
              admin@wiredwizards.co.ke • Admin@2026
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Full access: buying_price, stock valuation, staff &amp; system settings.
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickFillDemo('inventory@wiredwizards.co.ke', 'Inventory@2026')}
            className="w-full text-left p-3 rounded-xl bg-navy-800 hover:bg-slate-800 border border-slate-700 transition"
          >
            <div className="font-bold text-emerald-400">2. Inventory Manager</div>
            <div className="text-slate-300 font-mono text-[11px] mt-0.5">
              inventory@wiredwizards.co.ke • Inventory@2026
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Manages products (incl. VAT status), stock-in, adjustments &amp; branch transfers.
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickFillDemo('sales@wiredwizards.co.ke', 'Sales@2026')}
            className="w-full text-left p-3 rounded-xl bg-navy-800 hover:bg-slate-800 border border-slate-700 transition"
          >
            <div className="font-bold text-sky-400">3. Sales Agent (POS)</div>
            <div className="text-slate-300 font-mono text-[11px] mt-0.5">
              sales@wiredwizards.co.ke • Sales@2026
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Quotations (10% discount cap), invoice conversion, payment &amp; receipting.
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickFillDemo('peter@example.com', 'Customer@2026')}
            className="w-full text-left p-3 rounded-xl bg-navy-800 hover:bg-slate-800 border border-slate-700 transition"
          >
            <div className="font-bold text-amber-400">4. Customer (Kioko Farms Ltd)</div>
            <div className="text-slate-300 font-mono text-[11px] mt-0.5">
              peter@example.com • Customer@2026
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Online checkout, order tracking, and downloading own PDF invoices &amp; receipts.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
