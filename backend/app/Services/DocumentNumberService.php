<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\PaymentReceipt;
use App\Models\StockTransfer;
use App\Models\PurchaseRecord;

class DocumentNumberService
{
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $count = Order::whereYear('created_at', $year)->count() + 1;
        return sprintf('ORD-%s-%06d', $year, $count);
    }

    public static function generateQuotationNumber(): string
    {
        $year = date('Y');
        $count = Quotation::whereYear('created_at', $year)->count() + 1;
        return sprintf('QUO-%s-%06d', $year, $count);
    }

    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $count = Invoice::whereYear('created_at', $year)->count() + 1;
        return sprintf('INV-%s-%06d', $year, $count);
    }

    public static function generateReceiptNumber(): string
    {
        $year = date('Y');
        $count = PaymentReceipt::whereYear('created_at', $year)->count() + 1;
        return sprintf('REC-%s-%06d', $year, $count);
    }

    public static function generateTransferNumber(): string
    {
        $year = date('Y');
        $count = StockTransfer::whereYear('created_at', $year)->count() + 1;
        return sprintf('TR-%s-%06d', $year, $count);
    }

    public static function generatePurchaseReference(): string
    {
        $year = date('Y');
        $count = PurchaseRecord::whereYear('created_at', $year)->count() + 1;
        return sprintf('PUR-%s-%06d', $year, $count);
    }
}
