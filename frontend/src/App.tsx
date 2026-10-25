import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StorefrontLayout } from './components/storefront/StorefrontLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { RoleGuard } from './routes/RoleGuard';

import { HomePage } from './pages/storefront/HomePage';
import { CatalogPage } from './pages/storefront/CatalogPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { ComparePage } from './pages/storefront/ComparePage';
import { CartPage } from './pages/storefront/CartPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { AuthPage } from './pages/storefront/AuthPage';
import { AccountPortalPage } from './pages/storefront/AccountPortalPage';

import { DashboardPage } from './pages/admin/DashboardPage';
import { QuotationBuilderPage } from './pages/admin/QuotationBuilderPage';
import { DocumentsManagerPage } from './pages/admin/DocumentsManagerPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { StockMatrixPage } from './pages/admin/StockMatrixPage';
import { StockTransfersPage } from './pages/admin/StockTransfersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { UsersSettingsPage } from './pages/admin/UsersSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Customer Storefront */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/account"
            element={
              <RoleGuard>
                <AccountPortalPage />
              </RoleGuard>
            }
          />
        </Route>

        {/* ERP & POS Back-Office Portal */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['super_admin', 'inventory_manager', 'sales_agent']}>
              <AdminLayout />
            </RoleGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="quotations/new" element={<QuotationBuilderPage />} />
          <Route path="documents" element={<DocumentsManagerPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route
            path="inventory"
            element={
              <RoleGuard allowedRoles={['super_admin', 'inventory_manager']}>
                <StockMatrixPage />
              </RoleGuard>
            }
          />
          <Route
            path="transfers"
            element={
              <RoleGuard allowedRoles={['super_admin', 'inventory_manager']}>
                <StockTransfersPage />
              </RoleGuard>
            }
          />
          <Route
            path="products"
            element={
              <RoleGuard allowedRoles={['super_admin', 'inventory_manager']}>
                <AdminProductsPage />
              </RoleGuard>
            }
          />
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={['super_admin']}>
                <UsersSettingsPage mode="users" />
              </RoleGuard>
            }
          />
          <Route
            path="settings"
            element={
              <RoleGuard allowedRoles={['super_admin']}>
                <UsersSettingsPage mode="settings" />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
