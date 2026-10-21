<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
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

// Public Authentication
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

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

    // Customer Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    // Customer Delivery Addresses
    Route::apiResource('/addresses', AddressController::class);

    // Product Reviews
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    // Orders & Storefront Checkout
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order_number}', [OrderController::class, 'show']);
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Quotations
    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::post('/quotations', [QuotationController::class, 'store']);
    Route::post('/quotations/{id}/convert-to-invoice', [QuotationController::class, 'convertToInvoice']);
    Route::get('/quotations/{id}/pdf', [QuotationController::class, 'downloadPdf']);
    Route::get('/quotations/{id}/whatsapp-link', function ($id) {
        $quote = Quotation::findOrFail($id);
        return response()->json(['link' => WhatsAppService::generateQuotationShareLink($quote)]);
    });

    // Invoices & Payments
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::post('/invoices/{id}/record-payment', [InvoiceController::class, 'recordPayment']);
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);
    Route::get('/invoices/{id}/whatsapp-link', function ($id) {
        $inv = Invoice::findOrFail($id);
        return response()->json(['link' => WhatsAppService::generateInvoiceShareLink($inv)]);
    });

    // Daraja M-Pesa STK Push
    Route::post('/payments/mpesa/stkpush', [MpesaController::class, 'triggerStkPush']);

    // Receipts
    Route::get('/receipts', [PaymentReceiptController::class, 'index']);
    Route::get('/receipts/{id}/pdf', [PaymentReceiptController::class, 'downloadPdf']);

    // Multi-Store Inventory Management (Nairobi, Machakos, Kitui)
    Route::prefix('inventory')->group(function () {
        Route::get('/matrix', [InventoryController::class, 'matrix']);
        Route::post('/stock-in', [InventoryController::class, 'stockIn']);
        Route::post('/adjust', [InventoryController::class, 'adjust']);
        Route::post('/loss-damage', [InventoryController::class, 'recordLossOrDamage']);
        Route::get('/movements', [InventoryController::class, 'movements']);
    });

    // Inter-Store Stock Transfers
    Route::prefix('transfers')->group(function () {
        Route::get('/', [StockTransferController::class, 'index']);
        Route::post('/initiate', [StockTransferController::class, 'initiate']);
        Route::put('/{id}/dispatch', [StockTransferController::class, 'dispatch']);
        Route::put('/{id}/receive', [StockTransferController::class, 'receive']);
    });

    // Back-Office Analytics & Reports
    Route::prefix('reports')->group(function () {
        Route::get('/dashboard', [ReportController::class, 'dashboardOverview']);
        Route::get('/valuation', [ReportController::class, 'inventoryValuation']);
        Route::get('/agent-performance', [ReportController::class, 'agentPerformance']);
    });

    // Administration (Super Admin / Management)
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::get('/reviews', [ReviewController::class, 'adminIndex']);
        Route::put('/reviews/{id}/status', [ReviewController::class, 'moderate']);
        Route::put('/settings', [SettingController::class, 'update']);
    });

    // Catalog Administration
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
});
