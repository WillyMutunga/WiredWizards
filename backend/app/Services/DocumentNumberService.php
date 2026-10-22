<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Collision-free document numbers backed by PostgreSQL sequences.
 * nextval() is atomic, so two concurrent requests can never receive the same number.
 */
class DocumentNumberService
{
    private static function next(string $sequence, string $prefix): string
    {
        $n = DB::selectOne("SELECT nextval('$sequence') AS n")->n;
        return sprintf('%s-%s-%06d', $prefix, date('Y'), $n);
    }

    public static function generateOrderNumber(): string
    {
        return self::next('seq_ord', 'ORD');
    }

    public static function generateQuotationNumber(): string
    {
        return self::next('seq_quo', 'QUO');
    }

    public static function generateInvoiceNumber(): string
    {
        return self::next('seq_inv', 'INV');
    }

    public static function generateReceiptNumber(): string
    {
        return self::next('seq_rec', 'REC');
    }

    public static function generateTransferNumber(): string
    {
        return self::next('seq_tr', 'TR');
    }

    public static function generatePurchaseReference(): string
    {
        return self::next('seq_pur', 'PUR');
    }
}
