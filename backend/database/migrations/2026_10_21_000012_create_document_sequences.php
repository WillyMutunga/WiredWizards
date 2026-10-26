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
        if (DB::getDriverName() === 'pgsql') {
            foreach ($this->sequences as $seq => [$table, $column]) {
                $max = DB::table($table)
                    ->selectRaw("COALESCE(MAX(CAST(SUBSTRING($column FROM '[0-9]+$') AS INTEGER)), 0) AS m")
                    ->value('m');

                DB::statement("CREATE SEQUENCE IF NOT EXISTS $seq START WITH " . ((int) $max + 1));
            }
        } else {
            \Illuminate\Support\Facades\Schema::create('document_sequences', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->string('name', 30)->primary();
                $table->unsignedBigInteger('current_value')->default(0);
            });
            foreach (array_keys($this->sequences) as $seq) {
                DB::table('document_sequences')->insert(['name' => $seq, 'current_value' => 10]);
            }
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            foreach (array_keys($this->sequences) as $seq) {
                DB::statement("DROP SEQUENCE IF EXISTS $seq");
            }
        } else {
            \Illuminate\Support\Facades\Schema::dropIfExists('document_sequences');
        }
    }
};
