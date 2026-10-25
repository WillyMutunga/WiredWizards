import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus } from 'lucide-react';
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
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
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
                placeholder="you@example.com or +2547..."
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
    </div>
  );
};
