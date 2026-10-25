import React, { useEffect, useState } from 'react';
import { Users, Settings, MessageSquareQuote, CheckCircle2, XCircle } from 'lucide-react';
import { api, extractErrorMessage } from '../../api/client';

export const UsersSettingsPage: React.FC<{ mode: 'users' | 'reviews' | 'settings' }> = ({ mode }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  // New staff form
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_agent',
    password: 'Staff@2026',
  });

  useEffect(() => {
    setMsg('');
    if (mode === 'users') {
      api.get('/admin/users').then((r) => setUsers(r.data?.data || []));
    } else if (mode === 'reviews') {
      api.get('/admin/reviews').then((r) => setReviews(r.data?.data || []));
    } else {
      api.get('/settings').then((r) => setSettings(r.data || {}));
    }
  }, [mode]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', staffForm);
      setMsg('Staff account created!');
      api.get('/admin/users').then((r) => setUsers(r.data?.data || []));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleToggleUserActive = async (u: any) => {
    try {
      await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active });
      api.get('/admin/users').then((r) => setUsers(r.data?.data || []));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleModerateReview = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      setMsg(`Review marked as ${status}.`);
      api.get('/admin/reviews').then((r) => setReviews(r.data?.data || []));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', { settings });
      setMsg('System & Tax settings updated!');
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  if (mode === 'users') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-solar-600" /> Staff &amp; Role Access Control (Super Admin)
        </h1>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {msg}
          </div>
        )}

        <form
          onSubmit={handleCreateStaff}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs"
        >
          <input
            type="text"
            required
            placeholder="Full Name"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            className="p-2 border border-slate-300 rounded-lg"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            className="p-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            required
            placeholder="Phone (+254...)"
            value={staffForm.phone}
            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
            className="p-2 border border-slate-300 rounded-lg"
          />
          <select
            value={staffForm.role}
            onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
            className="p-2 border border-slate-300 rounded-lg"
          >
            <option value="sales_agent">Sales Agent</option>
            <option value="inventory_manager">Inventory Manager</option>
          </select>
          <button
            type="submit"
            className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-4 py-2 rounded-lg"
          >
            + Add Staff
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-200">
                  <td className="p-3.5 font-bold text-navy-900">{u.name}</td>
                  <td className="p-3.5">{u.email}</td>
                  <td className="p-3.5 font-mono">{u.phone}</td>
                  <td className="p-3.5 uppercase font-bold text-solar-600">{u.role}</td>
                  <td className="p-3.5 font-semibold">
                    <span className={u.is_active ? 'text-emerald-700' : 'text-red-600'}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {u.role !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => handleToggleUserActive(u)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg border border-slate-300"
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'reviews') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
          <MessageSquareQuote className="w-6 h-6 text-solar-600" /> Customer Review Moderation Queue
        </h1>

        {msg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {msg}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No product reviews submitted yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Rating &amp; Comment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev.id} className="border-b border-slate-200">
                    <td className="p-3.5 font-bold text-navy-900">{rev.product?.name}</td>
                    <td className="p-3.5">{rev.user?.name}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-amber-600">{rev.rating}/5 ★</span> — {rev.comment}
                    </td>
                    <td className="p-3.5 uppercase font-bold text-engineering-700">{rev.status}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleModerateReview(rev.id, 'approved')}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModerateReview(rev.id, 'rejected')}
                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2">
        <Settings className="w-6 h-6 text-solar-600" /> System &amp; Tax Configuration
      </h1>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(settings).map(([key, val]) => (
            <div key={key}>
              <label className="block font-bold uppercase text-slate-600 mb-1">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={val || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-6 py-2.5 rounded-lg"
        >
          Save System Configuration
        </button>
      </form>
    </div>
  );
};
