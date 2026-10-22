<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $sequences = [
        'seq_ord' => ['orders', 'order_number'],
        'seq_quo' => ['quotations', 'quotation_number'],
        'seq_inv' => ['invoices', 'invoice_number'],
        'seq_rec' => ['payments_and_receipts', 'receipt_number'],
        'seq_tr'  => ['stock_transfers', 'transfer_number'],
        'seq_pur' => ['purchase_records', 'purchase_reference'],
    ];

    public function up(): void
    {
        foreach ($this->sequences as $seq => [$table, $column]) {
            // Start after the highest existing numeric suffix (e.g. INV-2026-000007 -> 8)
            $max = DB::table($table)
                ->selectRaw("COALESCE(MAX(CAST(SUBSTRING($column FROM '[0-9]+$') AS INTEGER)), 0) AS m")
                ->value('m');

            DB::statement("CREATE SEQUENCE IF NOT EXISTS $seq START WITH " . ((int) $max + 1));
        }
    }

    public function down(): void
    {
        foreach (array_keys($this->sequences) as $seq) {
            DB::statement("DROP SEQUENCE IF EXISTS $seq");
        }
    }
};
