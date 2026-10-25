import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  PackagePlus,
  FileSpreadsheet,
  Receipt,
  ClipboardList,
  Users,
  Settings,
  Store,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const role = user?.role || 'customer';

  const navItems = [
    {
      label: 'Executive Dashboard',
      to: '/admin',
      icon: LayoutDashboard,
      roles: ['super_admin', 'inventory_manager', 'sales_agent'],
      end: true,
    },
    {
      label: 'POS Quotation Builder',
      to: '/admin/quotations/new',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'inventory_manager', 'sales_agent'],
    },
    {
      label: 'Quotes, Invoices & Receipts',
      to: '/admin/documents',
      icon: Receipt,
      roles: ['super_admin', 'inventory_manager', 'sales_agent'],
    },
    {
      label: 'Orders Fulfilment Board',
      to: '/admin/orders',
      icon: ClipboardList,
      roles: ['super_admin', 'inventory_manager', 'sales_agent'],
    },
    {
      label: 'Branch Stock Matrix',
      to: '/admin/inventory',
      icon: Boxes,
      roles: ['super_admin', 'inventory_manager'],
    },
    {
      label: 'Inter-Branch Transfers',
      to: '/admin/transfers',
      icon: ArrowLeftRight,
      roles: ['super_admin', 'inventory_manager'],
    },
    {
      label: 'Products & VAT Catalog',
      to: '/admin/products',
      icon: PackagePlus,
      roles: ['super_admin', 'inventory_manager'],
    },
    {
      label: 'Staff & Role Access',
      to: '/admin/users',
      icon: Users,
      roles: ['super_admin'],
    },
    {
      label: 'System & Tax Settings',
      to: '/admin/settings',
      icon: Settings,
      roles: ['super_admin'],
    },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Left Sidebar */}
      <aside className="w-64 bg-navy-900 text-slate-200 flex flex-col shrink-0 border-r border-navy-800">
        <div className="p-4 border-b border-navy-800 flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-auto rounded bg-white p-0.5" />
          <div>
            <div className="font-extrabold text-sm text-white leading-tight">
              WIRED <span className="text-solar-500">WIZARDS</span>
            </div>
            <div className="text-[10px] text-solar-500 uppercase font-mono tracking-wider">
              ERP &amp; Multi-Branch POS
            </div>
          </div>
        </div>

        {/* Logged-in Role Badge */}
        <div className="px-4 py-3 bg-navy-950/60 border-b border-navy-800 text-xs">
          <div className="font-bold text-white truncate">{user?.name}</div>
          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono uppercase mt-0.5">
            <Shield className="w-3 h-3" /> {role.replace('_', ' ')}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-solar-600 text-white shadow'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-navy-800 space-y-1.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            <Store className="w-4 h-4 text-solar-500" />
            View Public Storefront
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Branches Active: <strong className="text-slate-800">Nairobi Warehouse (NBO-WH)</strong> •{' '}
            <strong className="text-slate-800">Machakos Store (MCK-RET)</strong> •{' '}
            <strong className="text-slate-800">Kitui Store (KTU-RET)</strong>
          </div>
          <div className="text-xs font-mono text-slate-600">
            M-Pesa Till: <strong className="text-solar-600">543210</strong>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
