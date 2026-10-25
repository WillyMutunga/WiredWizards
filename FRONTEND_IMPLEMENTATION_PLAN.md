# Wired Wizards — Frontend Implementation Plan & Complete Backend API Handover

**Project:** Jumia-Style Solar E-Commerce Storefront & Integrated Multi-Branch ERP/POS Platform  
**Client:** Wired Wizards Engineering and General Supplies Ltd  
**Backend Stack (Completed & Live):** PHP 8.3 • Laravel 11 • PostgreSQL 18 • Sanctum Auth • DomPDF  
**Frontend Stack (Target):** React 18 (Vite) • Tailwind CSS • React Router v6 • TanStack Query (React Query) • Zustand • Axios • Lucide React

---

## Part 1: Everything Implemented in the Backend (API Handover)

The backend in [`backend/`](./backend) is **100% implemented, security-hardened, and verified** (`20 feature tests, 85 assertions`).

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
| **`inventory_manager`** | `inventory@wiredwizards.co.ke` | `+254700000002` | `Inventory@2026` | Manages products, images, datasheets, categories, brands, suppliers, stock-in, stock adjustments, damage/loss, and inter-branch transfers. **Blocked (`403`)** from `/admin/*` and `/reports/valuation`. `buying_price` is stripped from product responses. |
| **`sales_agent`** | `sales@wiredwizards.co.ke` | `+254700000003` | `Sales@2026` | Creates quotations (discount capped at `max_agent_discount_percent` = `10%`, and cannot price below `buying_price`), converts quotes to invoices, records payments/deposits, updates order statuses, generates WhatsApp share links. **Blocked (`403`)** from inventory writes and admin routes. |
| **`customer`** | `peter@example.com` | `+254722334455` | `Customer@2026` | Public browsing, wishlist, address book, online checkout, M-Pesa STK push, submitting reviews, viewing/downloading **only their own** orders, quotations, invoices, and receipts. **Blocked (`403`)** from all staff routes and other customers' documents. |

### 1.3 Pre-Seeded Store & Warehouse Locations

| `location_id` | Code | Name | Type | County |
| :---: | :--- | :--- | :--- | :--- |
| `1` | `NBO-WH` | Nairobi Warehouse | `warehouse` | Nairobi |
| `2` | `MCK-RET` | Machakos Store | `retail_store` | Machakos |
| `3` | `KTU-RET` | Kitui Store | `retail_store` | Kitui |

---

### 1.4 Complete Backend API Reference (All 68 Endpoints)

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
| `GET` | `/products/{slug_or_id}` | Public | Product details with `is_vatable` (`boolean`), `vat_rate` (`number`, e.g. `16.0` or `0.0`), `vat_status` (`"VATable (16%)"` vs `"VAT Exempt (Non-VAT)"`), `images`, `technical_specs`, `inventory_summary` (`total_available`, `status`: `'In Stock'\|'Low Stock'\|'Out of Stock'`), and **approved-only** `reviews` (`average_rating`, `count`, `items`). |
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
| `POST` | `/orders/checkout` | Any Auth | `{ location_id, payment_method: 'mpesa_till'\|'mpesa_stk'\|'bank_transfer'\|'cash_on_delivery', delivery_address: { county, town, physical_details }, items: [{ product_id, quantity }] }`. **Server computes prices, per-item VAT (charging 16% VAT ONLY on products where `is_vatable = true`, and 0% on Non-VAT solar items), and delivery fee, reserves stock atomically (`lockForUpdate`), and auto-generates both `ORD-YYYY-XXXXXX` and `INV-YYYY-XXXXXX`.** |
| `GET` | `/orders` | Any Auth | Customers see only their own orders; staff see all. Filter by `?status=`. |
| `GET` | `/orders/{order_number}` | Owner / Staff | Returns `{ order, timeline: [{ stage, done, time? }] }` for the 6-stage visual tracker. |
| `POST` | `/payments/mpesa/stkpush` | Owner / Staff | `{ phone, amount, order_id }` ➔ Triggers Daraja STK Push (or sandbox simulation if live keys aren't set). |

#### D. Quotations, Invoices, Receipts & PDFs
| Method | Endpoint | Allowed Roles | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/quotations` | Customer (own) / Staff (all) | Paginated quotations (`QUO-YYYY-XXXXXX`). |
| `POST` | `/quotations` | `super_admin`, `inventory_manager`, `sales_agent` | `{ customer_id, valid_until, discount_amount?, delivery_fee?, terms_and_conditions?, items: [{ product_id, quantity, unit_price? }] }`. Enforces 10% agent discount cap and `unit_price >= buying_price`. |
| `POST` | `/quotations/{id}/convert-to-invoice` | `super_admin`, `inventory_manager`, `sales_agent` | 1-click conversion from Quotation to Tax Invoice (`INV-YYYY-XXXXXX`). |
| `GET` | `/quotations/{id}/pdf` | Owner / Staff | Streams DomPDF `application/pdf`. |
| `GET` | `/quotations/{id}/whatsapp-link` | Staff | Returns `{ link }` pre-filled with customer phone, quote total, and PDF link. |
| `GET` | `/invoices` | Customer (own) / Staff (all) | Paginated invoices; filter with `?status=unpaid\|partially_paid\|paid`. |
| `GET` | `/invoices/{id}` | Owner / Staff | Invoice detail including `items`, `payments`, `amount_paid`, `balance_due`. |
| `POST` | `/invoices/{id}/record-payment` | `super_admin`, `inventory_manager`, `sales_agent` | `{ amount, payment_method: 'mpesa_till'\|'mpesa_stk'\|'bank_transfer'\|'cash', transaction_reference, notes? }`. Supports partial deposits, updates `balance_due` & `payment_status`, and creates `REC-YYYY-XXXXXX`. |
| `GET` | `/invoices/{id}/pdf` | Owner / Staff | Streams DomPDF Tax Invoice (`application/pdf`). |
| `GET` | `/invoices/{id}/whatsapp-link` | Staff | Returns `{ link }` with M-Pesa Till and invoice PDF link. |
| `GET` | `/receipts` | Customer (own) / Staff (all) | Paginated payment receipts (`REC-YYYY-XXXXXX`) with eager-loaded `invoice.items` and `order.items` (including per-item `is_vatable`, `vat_rate`, `vat_amount`). |
| `GET` | `/receipts/{id}` | Owner / Staff | Receipt detail with `customer`, `invoice.items`, `order.items`, and itemized VAT breakdown. |
| `GET` | `/receipts/{id}/pdf` | Owner / Staff | Streams DomPDF Official Receipt (`application/pdf`) featuring an **Itemized Receipt Breakdown & VAT Status Table** (`VAT 16%` vs `Non-VAT`) and VATable vs Non-VAT Subtotal summary. |
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
| `POST` / `PUT` | `/products`, `/products/{id}` | Create or update product: requires `is_vatable` (`true` for VAT-compliant items or `false` for Non-VAT/VAT-exempt solar equipment), optional `vat_rate` (defaults to `16%` when `is_vatable=true`, automatically `0%` when `is_vatable=false`), plus `technical_specs` JSON object. |
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
│   │   ├── cartStore.ts           # Zustand persisted shopping cart (items, quantities, branch)
│   │   └── compareStore.ts        # Zustand persisted compare tray (up to 4 product IDs)
│   ├── components/
│   │   ├── common/                # Button, Badge, Modal, Pagination, Spinner, EmptyState
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
│   │       │   ├── AdminProductsPage.tsx  # Product form + JSONB specs editor + image/PDF upload
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

### 1. Axios Client & Error Handling (`src/api/client.ts`)
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
Because `/quotations/{id}/pdf`, `/invoices/{id}/pdf`, and `/receipts/{id}/pdf` require the `Authorization: Bearer <token>` header (to enforce customer IDOR protection), **do not use a plain `<a href="...">` link**. Fetch as a `blob` and open in a new tab:
```typescript
import { api } from './client';

export async function openAuthenticatedPdf(endpoint: string, filename: string) {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
}
```

### 3. Role-Based UI Visibility
* Never render `buying_price`, Valuation charts, Staff Management, or Settings tabs unless `user.role === 'super_admin'`.
* For `sales_agent` in the Quotation Builder, display a live helper badge showing the `10%` max discount cap; if a larger discount is needed, show a message to request `super_admin` approval.

---

## Part 5: Step-by-Step Frontend Implementation Phases

### Phase 1: Foundation, Routing & Auth (Day 1)
1. Scaffold Vite + React + TypeScript + Tailwind CSS in `frontend/`.
2. Configure `api/client.ts`, `authStore.ts`, `cartStore.ts`, and `compareStore.ts`.
3. Build `<RoleGuard allowedRoles={[...]} />` and dual layouts (`<StorefrontLayout />` and `<AdminLayout />`).
4. Build `/login` and `/register` connected to `POST /auth/login` and `POST /auth/register`, redirecting staff to `/admin` and customers to `/`.

### Phase 2: Jumia-Style Public Storefront & Comparison (Days 2–3)
1. **Homepage (`/`)**: Hero banner, category cards (`GET /categories`), featured solar deals (`GET /products?featured=1`), and floating WhatsApp support button (`GET /settings`).
2. **Catalog & Faceted Filter Page (`/products`)**:
   * Search bar (`?search=`), Category & Brand checkboxes, Price range inputs (`?min_price=&max_price=`), and Wattage quick-pills (`100W`, `300W`, `550W`, `5kW` ➔ `?wattage=`).
3. **Product Details Page (`/products/:slug`)**:
   * Image gallery, stock status badge (`In Stock` green, `Low Stock` orange, `Out of Stock` red), `technical_specs` key-value table, downloadable PDF datasheet link (`datasheet_url`), "Inquire on WhatsApp" button (`GET /whatsapp/product/{id}`), approved customer reviews list + review submission form (`POST /products/{id}/reviews`).
4. **Comparison Tool (`/compare`)**:
   * Floating bottom compare bar (up to 4 products) + side-by-side matrix table powered by `GET /products/compare?ids=...`.

### Phase 3: Cart, Checkout & Customer Account Portal (Day 4)
1. **Shopping Cart (`/cart`)**: Quantity controls, subtotal + 16% VAT preview.
2. **Checkout (`/checkout`)**:
   * Select fulfillment branch (`Nairobi`, `Machakos`, or `Kitui`), pick a saved address (`GET /addresses`) or enter a new one, select payment method (`M-Pesa Till`, `M-Pesa STK Push`, `Bank Transfer`, `Cash on Delivery`), and submit `POST /orders/checkout`.
   * If `mpesa_stk` is chosen, trigger `POST /payments/mpesa/stkpush`.
3. **Customer Portal (`/account/*`)**:
   * Order history (`GET /orders`) + visual 6-step timeline (`GET /orders/{order_number}`).
   * Invoices & Receipts tab with one-click PDF view (`openAuthenticatedPdf`).
   * Wishlist (`GET /wishlist`, `POST /wishlist/toggle`) and Address Book (`apiResource /addresses`).

### Phase 4: Back-Office Inventory & Catalog Management (Day 5)
*(For `super_admin` & `inventory_manager`)*
1. **Multi-Location Stock Matrix (`/admin/inventory`)**:
   * Live table from `GET /inventory/matrix` showing `NBO-WH`, `MCK-RET`, `KTU-RET` columns (`on_hand`, `reserved`, `available`) and low-stock highlights.
   * Action modals for **Stock-In** (`POST /inventory/stock-in`), **Stock Adjustment** (`POST /inventory/adjust`), and **Damage/Loss** (`POST /inventory/loss-damage`).
2. **Inter-Branch Transfers (`/admin/transfers`)**:
   * Initiate transfer (`POST /transfers/initiate`), 1-click **Dispatch** (`PUT /transfers/{id}/dispatch`), and 1-click **Confirm Receipt** (`PUT /transfers/{id}/receive`).
3. **Product & Media Manager (`/admin/products`)**:
   * Create/edit products with dynamic key-value pairs for `technical_specs`, multi-image uploader (`POST /products/{id}/images`), and PDF datasheet uploader (`POST /products/{id}/datasheet`).
   * CRUD tabs for Categories, Brands, and Suppliers.

### Phase 5: Sales Agent POS, Quotations, Invoices & Payments (Day 6)
*(For `super_admin`, `inventory_manager`, `sales_agent`)*
1. **Quotation Builder (`/admin/quotations/new`)**:
   * Customer selector/search, product picker, quantity & unit price fields, discount field (validating the 10% cap for agents), submits to `POST /quotations`.
2. **Quotations & Invoices Manager (`/admin/quotations`, `/admin/invoices`)**:
   * 1-click **Convert to Invoice** (`POST /quotations/{id}/convert-to-invoice`).
   * **Record Payment Modal** (`POST /invoices/{id}/record-payment`) supporting partial deposits and M-Pesa transaction reference codes, immediately unlocking the generated Receipt PDF (`REC-`).
   * **PDF Preview** & **Share via WhatsApp** buttons (`GET /quotations/{id}/whatsapp-link`, `GET /invoices/{id}/whatsapp-link`).
3. **Order Fulfilment Board (`/admin/orders`)**:
   * Filter orders by stage and transition status (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Packed` ➔ `Dispatched` ➔ `Delivered` ➔ `Completed` / `Cancelled`).

### Phase 6: Executive Dashboards, Staff & System Settings (Day 7)
*(For `super_admin`)*
1. **Executive Dashboard (`/admin`)**:
   * KPI cards (`GET /reports/dashboard`), Sales Agent leaderboard (`GET /reports/agent-performance`), and Branch Stock Valuation (`GET /reports/valuation` — cost vs. retail).
2. **Staff Manager (`/admin/users`)**: Create/deactivate `sales_agent` and `inventory_manager` accounts.
3. **Review ModerationQueue (`/admin/reviews`)**: Approve or reject pending customer product reviews.
4. **System Settings (`/admin/settings`)**: Form to edit KRA PIN, VAT %, M-Pesa Till, bank details, delivery fee default, and max agent discount %.
