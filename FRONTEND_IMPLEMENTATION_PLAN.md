# Wired Wizards — Frontend Implementation Plan & Complete Backend API Handover

**Project:** Jumia-Style Solar E-Commerce Storefront & Integrated Multi-Branch ERP/POS Platform  
**Client:** Wired Wizards Engineering and General Supplies Ltd  
**Backend Stack (Completed & Live):** PHP 8.3 • Laravel 11 • PostgreSQL 18 • Sanctum Auth • DomPDF  
**Frontend Stack (Target):** React 18 (Vite) • Tailwind CSS • React Router v6 • TanStack Query (React Query) • Zustand • Axios • Lucide React

---

## Part 1: Everything Implemented in the Backend (API Handover)

The backend system housed in [`backend/`](./backend) is **100% fully implemented, security-hardened, and thoroughly verified** across all business scenarios (encompassing **21 comprehensive feature tests and 116 assertions**). It acts as the single source of truth for all business logic, per-product VAT compliance (VATable vs. Non-VAT solar equipment), multi-branch inventory tracking, order workflows, and financial document generation (Quotations, Tax Invoices, and Itemized Official Receipts). The client application layer must treat the backend APIs as strict domain boundaries and enforce UI-level UX patterns that mirror backend authorization and validation rules.

### 1.1 Base Configuration & Connectivity
* **API Base URL:** `http://127.0.0.1:8000/api/v1`
* **CORS Pre-configured ([`config/cors.php`](./backend/config/cors.php)):** Already allows `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, and `FRONTEND_URL`.
* **Authentication:** Bearer Token via Laravel Sanctum (`Authorization: Bearer <token>`).
* **Error Handling Convention:**
  * `401 Unauthorized` — Missing or expired token.
  * `403 Forbidden` — Role middleware (`role:...`) or document ownership (IDOR) check blocked the user.
  * `422 Unprocessable Entity` — Validation error (`errors` object) OR business-rule violation (`{"message": "..."}` via `BusinessRuleException`, e.g., insufficient stock, discount cap exceeded, overpayment).
  * `429 Too Many Requests` — Rate limit hit on `/auth/login` or `/auth/register` (`5 requests / minute`).

---

### 1.2 Pre-Seeded Test Accounts & Role Matrix

| Role | Email | Phone | Password | What the Backend Allows / Restricts |
| :--- | :--- | :--- | :--- | :--- |
| **`super_admin`** | `admin@wiredwizards.co.ke` | `+254700000001` | `Admin@2026` | **100% control.** Sees `buying_price`, stock cost valuation, staff management, system settings, review moderation, and unlimited quotation discounts. |
| **`inventory_manager`** | `inventory@wiredwizards.co.ke` | `+254700000002` | `Inventory@2026` | Manages products (including VAT compliance status `is_vatable`), images, datasheets, categories, brands, suppliers, stock-in, stock adjustments, damage/loss, and inter-branch transfers. **Blocked (`403`)** from `/admin/*` and `/reports/valuation`. `buying_price` is stripped from product responses. |
| **`sales_agent`** | `sales@wiredwizards.co.ke` | `+254700000003` | `Sales@2026` | Creates quotations (discount capped at `max_agent_discount_percent` = `10%`, and cannot price below `buying_price`), converts quotes to invoices, records payments/deposits, updates order statuses, generates WhatsApp share links. **Blocked (`403`)** from inventory writes and admin routes. |
| **`customer`** | `peter@example.com` | `+254722334455` | `Customer@2026` | Public browsing, wishlist, address book, online checkout, M-Pesa STK push, submitting reviews, viewing/downloading **only their own** orders, quotations, invoices, and receipts. **Blocked (`403`)** from all staff routes and other customers' documents. |

### 1.3 Pre-Seeded Store & Warehouse Locations

| `location_id` | Code | Name | Type | County |
| :---: | :--- | :--- | :--- | :--- |
| `1` | `NBO-WH` | Nairobi Warehouse | `warehouse` | Nairobi |
| `2` | `MCK-RET` | Machakos Store | `retail_store` | Machakos |
| `3` | `KTU-RET` | Kitui Store | `retail_store` | Kitui |

---

### 1.4 Per-Product VAT Compliance & Itemized Receipting Architecture

Because solar equipment in Kenya includes both **VAT-Exempt (Non-VAT)** items (e.g., Solar Panels, Solar Inverters, Lithium Batteries, Solar Submersible Water Pumps) and **VAT-Compliant (16% VAT)** items (e.g., Streetlights, PV Copper Cables, Accessories), VAT is configured and calculated **per product and per line item**:

1. **Product Creation & Update (`POST /products`, `PUT /products/{id}`):**
   * Requires `is_vatable: boolean` (`true` = VAT Compliant, `false` = Non-VAT / VAT Exempt).
   * Accepts optional `vat_rate: number` (defaults to system `vat_rate` `16.00` when `is_vatable = true`; automatically forced to `0.00` when `is_vatable = false`).
2. **Customer Storefront Product Display (`GET /products`, `GET /products/{slug}`):**
   * Every product resource returns:
     * `is_vatable`: `true` or `false`
     * `vat_rate`: `16` or `0`
     * `vat_status`: Human-readable badge string — `"VATable (16%)"` or `"VAT Exempt (Non-VAT)"`
   * Customers can also filter products by VAT status using `GET /products?is_vatable=1` or `GET /products?is_vatable=0`.
3. **Mixed-Cart Orders, Quotations, Invoices & Receipts:**
   * `order_items`, `quotation_items`, and `invoice_items` store `is_vatable`, `vat_rate`, and `vat_amount` per line item.
   * During checkout (`POST /orders/checkout`) and quotation creation (`POST /quotations`), VAT is calculated **strictly on VATable line items** (`is_vatable = true`). Non-VAT items always incur `0.00` VAT.
   * **Official Payment Receipts (`GET /receipts`, `GET /receipts/{id}`, `GET /receipts/{id}/pdf`)** include the full itemized line breakdown showing each item's `VAT (16%)` vs. `Non-VAT` badge, individual VAT amount, **VATable Items Subtotal**, **Non-VAT (Exempt) Subtotal**, **Total VAT Charged**, **Amount Received**, and **Remaining Invoice Balance**.

---

### 1.5 Complete Backend API Reference (All 69 Endpoints)

#### A. Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public (`throttle:5,1`) | `{ name, email, phone, password, password_confirmation, company_name?, kra_pin?, customer_type?: 'individual'\|'business'\|'installer'\|'institution', county?, town?, physical_details? }` ➔ Returns `{ token, user }`. |
| `POST` | `/auth/login` | Public (`throttle:5,1`) | `{ login, password }` (`login` accepts **email OR phone**) ➔ Returns `{ token, user: { id, name, email, phone, role } }`. |
| `GET` | `/auth/me` | `auth:sanctum` | Returns `{ user }` with `customer_profile` and `addresses`. |
| `POST` | `/auth/logout` | `auth:sanctum` | Revokes current token. |

#### B. Public Storefront Catalog & Discovery (`/api/v1`)
| Method | Endpoint | Auth | Query Params / Payload / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/settings` | Public | Key-value map of company settings (`company_name`, `kra_pin`, `vat_rate`, `mpesa_till`, `bank_name`, `bank_account_number`, `contact_phone`, `contact_email`, `office_address`, `delivery_fee_default`). |
| `GET` | `/categories` | Public | Returns `{ categories: [...], brands: [...] }` with `products_count`. |
| `GET` | `/products` | Public | Paginated list. Supports `?search=`, `?category=slug_or_id`, `?brand=slug_or_id`, `?min_price=`, `?max_price=`, `?wattage=550W` (PostgreSQL JSONB search), `?is_vatable=1\|0` (VATable vs Non-VAT filter), `?featured=1`, `?per_page=12`. |
| `GET` | `/products/compare` | Public | `?ids=1,2,3,4` (max 4 IDs). Returns full product resources including `technical_specs` JSONB, `is_vatable`, `vat_rate`, and `vat_status` for side-by-side table rendering. |
| `GET` | `/products/{slug_or_id}` | Public | Product details with `is_vatable`, `vat_rate`, `vat_status` (`"VATable (16%)"` or `"VAT Exempt (Non-VAT)"`), `images`, `technical_specs`, `inventory_summary` (`total_available`, `status`: `'In Stock'\|'Low Stock'\|'Out of Stock'`), and **approved-only** `reviews` (`average_rating`, `count`, `items`). |
| `GET` | `/whatsapp/product/{id}` | Public | Returns `{ link: "https://wa.me/254...?text=..." }` pre-filled with product name, SKU, and price. |

#### C. Customer Storefront Actions (`auth:sanctum`)
| Method | Endpoint | Allowed Roles | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/wishlist` | Any Auth | Returns `{ wishlist: [{ id, product, added_at }] }`. |
| `POST` | `/wishlist/toggle` | Any Auth | `{ product_id }` ➔ Adds or removes item; returns `{ message, in_wishlist: true\|false }`. |
| `GET` | `/addresses` | Any Auth | Lists customer's saved delivery addresses (`is_default` first). |
| `POST` | `/addresses` | Any Auth | `{ label, county, town, physical_details, is_default? }`. |
| `PUT` | `/addresses/{id}` | Any Auth | Update address or set `is_default: true`. |
| `DELETE` | `/addresses/{id}` | Any Auth | Delete address. |
| `POST` | `/products/{id}/reviews` | Any Auth | `{ rating: 1..5, comment }` ➔ Saved with `status: 'pending'` until approved by admin. |
| `POST` | `/orders/checkout` | Any Auth | `{ location_id, payment_method: 'mpesa_till'\|'mpesa_stk'\|'bank_transfer'\|'cash_on_delivery', delivery_address: { county, town, physical_details }, items: [{ product_id, quantity }] }`. **Server computes prices, per-item VAT (only on `is_vatable = true` items), and delivery fee, reserves stock atomically (`lockForUpdate`), and auto-generates both `ORD-YYYY-XXXXXX` and `INV-YYYY-XXXXXX`.** |
| `GET` | `/orders` | Any Auth | Customers see only their own orders; staff see all. Filter by `?status=`. |
| `GET` | `/orders/{order_number}` | Owner / Staff | Returns `{ order, timeline: [{ stage, done, time? }] }` for the 6-stage visual tracker. |
| `POST` | `/payments/mpesa/stkpush` | Owner / Staff | `{ phone, amount, order_id }` ➔ Triggers Daraja STK Push (or sandbox simulation if live keys aren't set). |

#### D. Quotations, Invoices, Receipts & PDFs
| Method | Endpoint | Allowed Roles | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/quotations` | Customer (own) / Staff (all) | Paginated quotations (`QUO-YYYY-XXXXXX`). |
| `POST` | `/quotations` | `super_admin`, `inventory_manager`, `sales_agent` | `{ customer_id, valid_until, discount_amount?, delivery_fee?, terms_and_conditions?, items: [{ product_id, quantity, unit_price? }] }`. Computes per-item VAT (prorating discounts across VATable items) and enforces 10% agent discount cap and `unit_price >= buying_price`. |
| `POST` | `/quotations/{id}/convert-to-invoice` | `super_admin`, `inventory_manager`, `sales_agent` | 1-click conversion from Quotation to Tax Invoice (`INV-YYYY-XXXXXX`), preserving per-item `is_vatable`, `vat_rate`, and `vat_amount`. |
| `GET` | `/quotations/{id}/pdf` | Owner / Staff | Streams DomPDF `application/pdf` with per-item `VAT (16%)` vs `Non-VAT` badges and VATable/Non-VAT subtotals. |
| `GET` | `/quotations/{id}/whatsapp-link` | Staff | Returns `{ link }` pre-filled with customer phone, quote total, and PDF link. |
| `GET` | `/invoices` | Customer (own) / Staff (all) | Paginated invoices; filter with `?status=unpaid\|partially_paid\|paid`. |
| `GET` | `/invoices/{id}` | Owner / Staff | Invoice detail including `items` (with `is_vatable`, `vat_rate`, `vat_amount`), `payments`, `amount_paid`, `balance_due`. |
| `POST` | `/invoices/{id}/record-payment` | `super_admin`, `inventory_manager`, `sales_agent` | `{ amount, payment_method: 'mpesa_till'\|'mpesa_stk'\|'bank_transfer'\|'cash', transaction_reference, notes? }`. Supports partial deposits, updates `balance_due` & `payment_status`, and creates `REC-YYYY-XXXXXX` (returned with `invoice.items` and `order.items`). |
| `GET` | `/invoices/{id}/pdf` | Owner / Staff | Streams DomPDF Tax Invoice (`application/pdf`) with per-item VAT status and VATable/Non-VAT subtotal breakdown. |
| `GET` | `/invoices/{id}/whatsapp-link` | Staff | Returns `{ link }` with M-Pesa Till and invoice PDF link. |
| `GET` | `/receipts` | Customer (own) / Staff (all) | Paginated payment receipts (`REC-YYYY-XXXXXX`) with eager-loaded `invoice.items` and `order.items`. |
| `GET` | `/receipts/{id}` | Owner / Staff | Single receipt detail with `customer`, `invoice.items`, `order.items`, and itemized VAT breakdown. |
| `GET` | `/receipts/{id}/pdf` | Owner / Staff | Streams DomPDF Official Receipt (`application/pdf`) with **Itemized Receipt Breakdown & VAT Status Table** (`VAT 16%` vs `Non-VAT`). |
| `PUT` | `/orders/{id}/status` | `super_admin`, `inventory_manager`, `sales_agent` | `{ status: 'pending'\|'confirmed'\|'processing'\|'packed'\|'dispatched'\|'delivered'\|'completed'\|'cancelled' }`. Moving to `dispatched`/`delivered`/`completed` permanently deducts reserved stock; moving to `cancelled` releases reserved stock. |

#### E. Multi-Location Inventory, Transfers & Catalog Admin (`role:super_admin,inventory_manager`)
| Method | Endpoint | Payload / Notes |
| :--- | :--- | :--- |
| `GET` | `/inventory/matrix` | Returns `{ locations, inventory: [{ id, name, sku, category, selling_price, min_stock_alert, total_on_hand, total_available, status, branches: { 'NBO-WH': { on_hand, reserved, available }, 'MCK-RET': ..., 'KTU-RET': ... } }] }`. |
| `POST` | `/inventory/stock-in` | `{ supplier_id, location_id, supplier_invoice_ref, items: [{ product_id, quantity, unit_cost }] }` ➔ Increments stock and creates `PUR-YYYY-XXXXXX`. |
| `POST` | `/inventory/adjust` | `{ product_id, location_id, new_physical_count, reason }` ➔ Reconciles physical count and writes to `stock_movements` + `audit_logs`. |
| `POST` | `/inventory/loss-damage` | `{ product_id, location_id, quantity, type: 'damage'\|'loss', reason }`. |
| `GET` | `/inventory/movements` | Paginated immutable ledger (`?product_id=`, `?location_id=`, `?movement_type=`). |
| `GET` | `/transfers` | Lists inter-branch stock transfers (`TR-YYYY-XXXXXX`). |
| `POST` | `/transfers/initiate` | `{ source_location_id, destination_location_id, notes?, items: [{ product_id, quantity }] }`. |
| `PUT` | `/transfers/{id}/dispatch` | Locks transfer, deducts source stock (`transfer_out`), marks `dispatched`. |
| `PUT` | `/transfers/{id}/receive` | Locks transfer, increments destination stock (`transfer_in`), marks `received`. |
| `POST` / `PUT` | `/products`, `/products/{id}` | Create or update product: requires `is_vatable` (`boolean`), optional `vat_rate` (`numeric`, defaults to `16` if `is_vatable=true` or `0` if `false`), plus `technical_specs` JSON object. |
| `POST` | `/products/{id}/images` | `multipart/form-data` with `images[]` (jpg/png/webp, max 4MB each). |
| `PUT` | `/products/{id}/images/{imageId}/primary` | Sets cover image. |
| `DELETE` | `/products/{id}/images/{imageId}` | Deletes image and auto-promotes next cover image. |
| `POST` | `/products/{id}/datasheet` | `multipart/form-data` with `datasheet` PDF (max 10MB). |
| `POST`/`PUT`/`DELETE` | `/categories`, `/brands`, `/suppliers` | Full CRUD (categories with products and suppliers are safely deactivated instead of hard-deleted). |
| `GET` | `/reports/dashboard` | `{ today_sales, month_sales, pending_orders, completed_orders, total_customers, low_stock_alerts }`. |
| `GET` | `/reports/agent-performance` | Sales count, quotation count, and revenue per sales agent. |

#### F. Super Admin Exclusive (`role:super_admin`)
| Method | Endpoint | Payload / Notes |
| :--- | :--- | :--- |
| `GET` | `/reports/valuation` | Per-location `total_cost_value`, `total_retail_value`, and `total_units`. |
| `GET` | `/admin/users` | Paginated users (`?role=`, `?search=`). |
| `POST` | `/admin/users` | `{ name, email, phone, role: 'inventory_manager'\|'sales_agent', password }`. |
| `PUT` | `/admin/users/{id}` | Update user role, details, password, or `is_active: false`. |
| `GET` | `/admin/reviews` | List reviews (`?status=pending\|approved\|rejected`). |
| `PUT` | `/admin/reviews/{id}/status` | `{ status: 'approved'\|'rejected'\|'pending' }`. |
| `PUT` | `/admin/settings` | `{ settings: { company_name, kra_pin, vat_rate, mpesa_till, max_agent_discount_percent, delivery_fee_default, ... } }`. |

---

## Part 2: Brand Design System (Extracted from Logo)

Copy the official logo from `backend/public/images/logo.jpeg` (or `WhatsApp Image 2026-10-19 at 13.06.02.jpeg`) into `frontend/src/assets/logo.jpeg`.

### Tailwind CSS Theme Tokens (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        solar: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c', // Primary CTA (Sunburst Orange)
          700: '#c2410c',
        },
        navy: {
          800: '#111836',
          900: '#080c29', // Brand Midnight Navy (Header / Admin Sidebar)
          950: '#040618',
        },
        engineering: {
          100: '#e0f2fe',
          500: '#0284c7',
          700: '#0e385e', // Engineering Steel Blue (Spec badges / Secondary buttons)
        },
        metal: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
};
```

---

## Part 3: Recommended Frontend Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance with Bearer token & 401/422 interceptors
│   │   ├── pdf.ts                 # Helper to download/open PDF streams with auth token
│   │   ├── auth.api.ts
│   │   ├── catalog.api.ts
│   │   ├── orders.api.ts
│   │   ├── documents.api.ts
│   │   ├── inventory.api.ts
│   │   └── admin.api.ts
│   ├── store/
│   │   ├── authStore.ts           # Zustand persisted auth user + token
│   │   ├── cartStore.ts           # Zustand persisted shopping cart (items, is_vatable, vat_rate, quantities, branch)
│   │   └── compareStore.ts        # Zustand persisted compare tray (up to 4 product IDs)
│   ├── components/
│   │   ├── common/                # Button, Badge, VatStatusBadge, Modal, Pagination, Spinner, EmptyState
│   │   ├── storefront/            # Navbar, CategoryMegamenu, ProductCard, FilterSidebar,
│   │   │                          # CompareFloatingTray, WhatsAppFloatingButton, Footer
│   │   └── admin/                 # AdminSidebar (role-filtered), Topbar, StatCard, DataTable
│   ├── pages/
│   │   ├── storefront/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CatalogPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── AuthPage.tsx       # Login / Register tabs
│   │   │   └── account/
│   │   │       ├── AccountOverviewPage.tsx
│   │   │       ├── OrderTrackingPage.tsx
│   │   │       ├── MyDocumentsPage.tsx
│   │   │       ├── WishlistPage.tsx
│   │   │       └── AddressesPage.tsx
│   │   └── admin/
│   │       ├── DashboardPage.tsx          # Super Admin / Inventory overview
│   │       ├── pos/
│   │       │   ├── QuotationBuilderPage.tsx
│   │       │   ├── QuotationsListPage.tsx
│   │       │   └── InvoicesPaymentsPage.tsx
│   │       ├── orders/
│   │       │   └── AdminOrdersPage.tsx
│   │       ├── inventory/
│   │       │   ├── StockMatrixPage.tsx    # Nairobi vs Machakos vs Kitui table
│   │       │   ├── StockInModal.tsx
│   │       │   ├── StockAdjustModal.tsx
│   │       │   ├── StockTransfersPage.tsx
│   │       │   └── MovementsLedgerPage.tsx
│   │       ├── catalog/
│   │       │   ├── AdminProductsPage.tsx  # Product form (incl. VAT toggle) + JSONB specs editor + image/PDF upload
│   │       │   ├── CategoriesBrandsPage.tsx
│   │       │   └── SuppliersPage.tsx
│   │       └── system/
│   │           ├── UsersStaffPage.tsx     # super_admin only
│   │           ├── ReviewModerationPage.tsx # super_admin only
│   │           └── SystemSettingsPage.tsx # super_admin only
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── RoleGuard.tsx          # Redirects unauthorized roles cleanly
│   └── main.tsx
```

---

## Part 4: Crucial Implementation Patterns for the Frontend Developer

### 1. Axios Client & Error Handling Architecture (`src/api/client.ts`)
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 2. Downloading/Viewing Protected PDFs (`src/api/pdf.ts`)
Because the PDF endpoints (`/quotations/{id}/pdf`, `/invoices/{id}/pdf`, and `/receipts/{id}/pdf`) are protected by the Sanctum authentication layer and enforce strict ownership checks (preventing Insecure Direct Object Reference vulnerabilities), standard HTML anchors (`<a href="...">`) cannot be used directly without exposing credentials. Instead, requests must be dispatched via Axios with binary blob response types and rendered using temporary object URLs:
```typescript
import { api } from './client';

export async function openAuthenticatedPdf(endpoint: string, filename: string) {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
}
```

### 3. Per-Product VAT Calculation in Cart & Quotation Builder
Each product returned by `/api/v1/products` includes `is_vatable: boolean`, `vat_rate: number`, and `vat_status: string`. In both `cartStore.ts` and `QuotationBuilderPage.tsx`:
```typescript
export function calculateCartTotals(items: Array<{ price: number; quantity: number; is_vatable: boolean; vat_rate: number }>) {
  let vatableSubtotal = 0;
  let nonVatableSubtotal = 0;
  let totalVat = 0;

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    if (item.is_vatable) {
      vatableSubtotal += lineTotal;
      totalVat += Number(((lineTotal * item.vat_rate) / 100).toFixed(2));
    } else {
      nonVatableSubtotal += lineTotal;
    }
  }

  const subtotal = vatableSubtotal + nonVatableSubtotal;
  return { vatableSubtotal, nonVatableSubtotal, subtotal, totalVat, grandTotal: subtotal + totalVat };
}
```

### 4. Role-Based UI Visibility
* **Sensitive Financial Data Isolation:** Never render wholesale acquisition costs (`buying_price`), valuation reports, staff management tables, or system configuration tabs unless the authenticated user profile explicitly satisfies `user.role === 'super_admin'`. Although the backend strips sensitive fields automatically from non-admin responses, the UI must conditionally hide corresponding controls to maintain clean layouts.
* **Sales Agent Discount Guidance:** In the Quotation Builder interface, display a real-time policy banner indicating the maximum allowed discount cap (`10%` for sales agents). If an agent attempts to input a discount exceeding this threshold, the form should provide an inline prompt guiding them to submit a discount approval request to a `super_admin` rather than suffering a backend validation rejection.

---

## Part 5: Step-by-Step Frontend Implementation Phases

### Phase 1: Foundation, Routing & Auth (Day 1)
1. **Project Scaffolding & Tooling Setup:** Scaffold the application using Vite with React and TypeScript inside the `frontend/` directory. Install and configure Tailwind CSS alongside Lucide React icon assets and global utility classes.
2. **State Layer & Network Setup:** Configure `api/client.ts` with global request/response interceptors. Initialize persistent Zustand stores: `authStore.ts` (managing tokens and user profiles), `cartStore.ts` (managing cart items, branch selections, and per-item VAT vs Non-VAT calculations), and `compareStore.ts` (tracking up to 4 selected product IDs for comparison).
3. **Routing & Guard Architecture:** Establish React Router v6 routing trees. Implement `<RoleGuard allowedRoles={[...]} />` wrapper components to protect administrative routes and wrap pages with dual layouts: `<StorefrontLayout />` (containing consumer navigation and footer) and `<AdminLayout />` (containing role-sensitive sidebars and topbars).
4. **Authentication Flows:** Construct the unified login and registration interfaces (`/login` and `/register`). Wire these views to `POST /auth/login` (supporting both email and phone number login identifiers) and `POST /auth/register`. Ensure automatic redirection sending staff members to `/admin` and retail customers to the main storefront landing page.

### Phase 2: Jumia-Style Public Storefront & Comparison (Days 2–3)
1. **Homepage (`/`):** Features an interactive marketing hero section, dynamic category cards powered by `GET /categories`, a grid of curated solar products fetched via `GET /products?featured=1` (displaying each product's `vat_status` badge), and a persistent floating WhatsApp widget populated using tenant settings from `GET /settings`.
2. **Catalog & Faceted Filter Page (`/products`):** Provides rich, real-time product browsing designed for solar system builders:
   * Debounced full-text search bar (`?search=`), multi-select category and brand filter checkboxes, price range sliders (`?min_price=&max_price=`), VAT status filter (`?is_vatable=0` for VAT-Exempt Solar vs `?is_vatable=1` for VATable items), and solar capacity quick-pills (e.g., `100W`, `300W`, `550W`, `5kW` matching backend JSONB spec queries via `?wattage=`).
3. **Product Details Page (`/products/:slug`):** Complete product showcase providing technical confidence to buyers:
   * High-resolution image gallery with thumbnail selectors, prominent **VAT Status Pill** (`VAT Exempt (Non-VAT)` in green or `VATable (16%)` in amber), dynamic branch stock badges (`In Stock` green, `Low Stock` orange, `Out of Stock` red), technical specifications table parsed from `technical_specs`, downloadable PDF datasheet trigger (`datasheet_url`), "Inquire on WhatsApp" action opening pre-formatted messaging (`GET /whatsapp/product/{id}`), and verified customer reviews with an inline review submission form (`POST /products/{id}/reviews`).
4. **Comparison Tool (`/compare`):** Direct technical evaluation for complex hardware selection:
   * A persistent floating drawer tracking up to 4 selected products, linked to a dedicated side-by-side comparison matrix powered by `GET /products/compare?ids=...` that highlights technical discrepancies (including `vat_status`, voltage, battery capacity, and inverter wave types).

### Phase 3: Cart, Checkout & Customer Account Portal (Day 4)
1. **Shopping Cart (`/cart`):** Provides item quantity adjustments, per-item `VAT (16%)` vs `Non-VAT` badges, and a clear breakdown showing **VATable Subtotal**, **Non-VAT Subtotal**, **Total VAT**, and **Grand Total** prior to order commitment.
2. **Checkout Workflow (`/checkout`):** A multi-step conversion flow ensuring valid fulfillment routing:
   * Allows branch fulfillment selection (`Nairobi`, `Machakos`, or `Kitui`), address management (selecting saved addresses via `GET /addresses` or defining new physical locations), and payment gateway selection (`M-Pesa Till`, `M-Pesa STK Push`, `Bank Transfer`, or `Cash on Delivery`) before submitting to `POST /orders/checkout`.
   * If `M-Pesa STK Push` is selected, the page renders a prompt overlay initiating payment via `POST /payments/mpesa/stkpush` and polls for payment completion.
3. **Customer Account Portal (`/account/*`):** Self-service customer management dashboard:
   * Displays historical order records fetched via `GET /orders` alongside an interactive 6-stage order timeline powered by `GET /orders/{order_number}`.
   * Includes dedicated document download hubs for **Quotations, Tax Invoices, and Itemized Official Receipts** (`GET /receipts`, `GET /receipts/{id}`) with per-item VAT breakdowns and one-click PDF downloads (`openAuthenticatedPdf`).
   * Houses customer wishlists (`GET /wishlist`, `POST /wishlist/toggle`) and saved delivery address management (`apiResource /addresses`).

### Phase 4: Back-Office Inventory & Catalog Management (Day 5)
*(Restricted to authorized roles: `super_admin` & `inventory_manager`)*
1. **Multi-Location Stock Matrix (`/admin/inventory`):** Provides real-time stock visibility across branches:
   * Displays a consolidated grid from `GET /inventory/matrix` showing stock breakdowns for Nairobi Warehouse, Machakos Store, and Kitui Store (tracking `on_hand`, `reserved`, and `available` quantities) alongside low-stock alerts.
   * Integrates modal workflows for **Stock-In** entries (`POST /inventory/stock-in`), physical **Stock Adjustments** (`POST /inventory/adjust`), and **Damage/Loss** logging (`POST /inventory/loss-damage`).
2. **Inter-Branch Transfers (`/admin/transfers`):** Manages inter-branch inventory movements:
   * Allows staff to initiate transfer requests (`POST /transfers/initiate`), execute dispatch commands (`PUT /transfers/{id}/dispatch`), and confirm destination inventory receipts (`PUT /transfers/{id}/receive`).
3. **Product & Catalog Management (`/admin/products`):** Administrative control over product details and assets:
   * Provides form interfaces for product definitions including a **VAT Compliance Toggle** (`is_vatable: true/false` and `vat_rate`), dynamic JSON specification editors, multi-image uploads (`POST /products/{id}/images`), and technical PDF datasheet uploads (`POST /products/{id}/datasheet`).
   * Includes management tabs for categories, brands, and suppliers with safe soft-deactivation protection.

### Phase 5: Sales Agent POS, Quotations, Invoices & Payments (Day 6)
*(Restricted to authorized roles: `super_admin`, `inventory_manager`, `sales_agent`)*
1. **Quotation Builder (`/admin/quotations/new`):** Point-of-sale quotation generation tool:
   * Features customer lookup, product auto-complete (displaying each product's `VAT 16%` or `Non-VAT` badge), unit pricing fields, live VATable vs Non-VAT subtotal preview, and discount validation enforcing agent discount caps before submitting to `POST /quotations`.
2. **Document & Sales Management (`/admin/quotations`, `/admin/invoices`, `/admin/receipts`):** Full lifecycle sales document handling:
   * Provides one-click conversion from quotations to official tax invoices (`POST /quotations/{id}/convert-to-invoice`).
   * Features a **Record Payment** modal (`POST /invoices/{id}/record-payment`) supporting deposit tracking, M-Pesa transaction reference inputs, and immediate itemized payment receipt generation (`REC-YYYY-XXXXXX`).
   * Includes PDF preview triggers and WhatsApp sharing links (`GET /quotations/{id}/whatsapp-link`, `GET /invoices/{id}/whatsapp-link`).
3. **Order Fulfillment Board (`/admin/orders`):** Operations board for managing customer order progression:
   * Filter and update order status stages (`Pending` → `Confirmed` → `Processing` → `Packed` → `Dispatched` → `Delivered` → `Completed` / `Cancelled`), triggering appropriate stock releases or permanent deductions.

### Phase 6: Executive Dashboards, Staff & System Settings (Day 7)
*(Restricted exclusively to: `super_admin`)*
1. **Executive Dashboard (`/admin`):** High-level executive operational analytics:
   * Renders high-level KPI cards (`GET /reports/dashboard`), sales agent performance leaderboards (`GET /reports/agent-performance`), and multi-branch stock valuation reports comparing cost versus retail value (`GET /reports/valuation`).
2. **Staff & User Management (`/admin/users`):** Administrative control to create, modify, or deactivate staff accounts for sales agents and inventory managers.
3. **Review Moderation Queue (`/admin/reviews`):** Moderation console to review, approve, or reject customer product reviews before public publication.
4. **System Settings (`/admin/settings`):** Configuration panel to update organizational details including KRA PIN, default VAT percentage, M-Pesa Till numbers, banking credentials, default delivery fees, and discount caps.
