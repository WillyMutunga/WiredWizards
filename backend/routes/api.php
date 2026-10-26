<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductMediaController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\StockTransferController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentReceiptController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\MpesaController;
use App\Services\WhatsAppService;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Invoice;

/*
|--------------------------------------------------------------------------
| Wired Wizards REST API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication (Rate limited to prevent credential stuffing)
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Public Product Discovery & Settings
Route::prefix('v1')->group(function () {
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/compare', [ProductController::class, 'compare']);
    Route::get('/products/{identifier}', [ProductController::class, 'show']);

    // Public WhatsApp enquiry deep-link generator
    Route::get('/whatsapp/product/{id}', function ($id) {
        $product = Product::findOrFail($id);
        return response()->json(['link' => WhatsAppService::generateProductInquiryLink($product)]);
    });

    // Public Safaricom M-Pesa Callback Webhook
    Route::post('/payments/mpesa/callback', [MpesaController::class, 'handleCallback']);
});

// Authenticated Endpoints
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Customer Wishlist, Addresses, Reviews & Checkout (Any authenticated user)
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::apiResource('/addresses', AddressController::class);
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    // Orders & Document Viewing (Controller enforces customer ownership on individual records)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order_number}', [OrderController::class, 'show']);
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::post('/payments/mpesa/stkpush', [MpesaController::class, 'triggerStkPush']);

    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::get('/quotations/{id}/pdf', [QuotationController::class, 'downloadPdf']);

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);

    Route::get('/receipts', [PaymentReceiptController::class, 'index']);
    Route::get('/receipts/{id}', [PaymentReceiptController::class, 'show']);
    Route::get('/receipts/{id}/pdf', [PaymentReceiptController::class, 'downloadPdf']);

    // Sales & Order Operations (Super Admin, Inventory Manager, Sales Agent)
    Route::middleware('role:super_admin,inventory_manager,sales_agent')->group(function () {
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/quotations', [QuotationController::class, 'store']);
        Route::post('/quotations/{id}/convert-to-invoice', [QuotationController::class, 'convertToInvoice']);
        Route::get('/quotations/{id}/whatsapp-link', function ($id) {
            $quote = Quotation::findOrFail($id);
            return response()->json(['link' => WhatsAppService::generateQuotationShareLink($quote)]);
        });
        Route::post('/invoices/{id}/record-payment', [InvoiceController::class, 'recordPayment']);
        Route::get('/invoices/{id}/whatsapp-link', function ($id) {
            $inv = Invoice::findOrFail($id);
            return response()->json(['link' => WhatsAppService::generateInvoiceShareLink($inv)]);
        });

        // Operational Dashboard & Agent Leaderboard (All Staff)
        Route::get('/reports/dashboard', [ReportController::class, 'dashboardOverview']);
        Route::get('/reports/agent-performance', [ReportController::class, 'agentPerformance']);
    });

    // Inventory, Transfers, Suppliers & Catalog Write Operations (Super Admin & Inventory Manager)
    Route::middleware('role:super_admin,inventory_manager')->group(function () {
        Route::prefix('inventory')->group(function () {
            Route::get('/overview', [InventoryController::class, 'overview']);
            Route::get('/matrix', [InventoryController::class, 'matrix']);
            Route::get('/purchases', [InventoryController::class, 'purchases']);
            Route::get('/locations', [InventoryController::class, 'locations']);
            Route::post('/locations', [InventoryController::class, 'storeLocation']);
            Route::put('/quick-price', [InventoryController::class, 'quickUpdateItemPrice']);
            Route::post('/stock-in', [InventoryController::class, 'stockIn']);
            Route::post('/adjust', [InventoryController::class, 'adjust']);
            Route::post('/loss-damage', [InventoryController::class, 'recordLossOrDamage']);
            Route::get('/movements', [InventoryController::class, 'movements']);
        });

        Route::prefix('transfers')->group(function () {
            Route::get('/', [StockTransferController::class, 'index']);
            Route::post('/initiate', [StockTransferController::class, 'initiate']);
            Route::put('/{id}/dispatch', [StockTransferController::class, 'dispatch']);
            Route::put('/{id}/receive', [StockTransferController::class, 'receive']);
        });

        // Catalog CRUD & Media Uploads
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::post('/products/{id}/images', [ProductMediaController::class, 'storeImages']);
        Route::put('/products/{id}/images/{imageId}/primary', [ProductMediaController::class, 'setPrimary']);
        Route::delete('/products/{id}/images/{imageId}', [ProductMediaController::class, 'destroyImage']);
        Route::post('/products/{id}/datasheet', [ProductMediaController::class, 'storeDatasheet']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/brands', [BrandController::class, 'store']);
        Route::put('/brands/{id}', [BrandController::class, 'update']);
        Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

        Route::apiResource('/suppliers', SupplierController::class);
    });

    // Super Admin Exclusive Endpoints
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/reports/valuation', [ReportController::class, 'inventoryValuation']);

        Route::prefix('admin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::get('/reviews', [ReviewController::class, 'adminIndex']);
            Route::put('/reviews/{id}/status', [ReviewController::class, 'moderate']);
            Route::put('/settings', [SettingController::class, 'update']);
        });
    });
});
