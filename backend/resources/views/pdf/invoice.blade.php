@extends('pdf.layout')

@section('title', 'Tax Invoice ' . $invoice->invoice_number)

@section('content')
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td>
                <div class="doc-title" style="color: #080c29;">TAX INVOICE</div>
                <div style="font-size: 14px; font-weight: bold; color: #ea580c;">Invoice #: {{ $invoice->invoice_number }}</div>
                @if($invoice->order)
                    <div style="font-size: 11px; color: #64748b;">Order Ref: {{ $invoice->order->order_number }}</div>
                @endif
                @if($invoice->quotation)
                    <div style="font-size: 11px; color: #64748b;">Converted from Quote: {{ $invoice->quotation->quotation_number }}</div>
                @endif
            </td>
            <td style="text-align: right; font-size: 12px;">
                <div>Invoice Date: <strong>{{ $invoice->created_at->format('d M Y') }}</strong></div>
                <div>Due Date: <strong>{{ $invoice->due_date->format('d M Y') }}</strong></div>
                <div style="margin-top: 4px;">Status: 
                    <span style="font-weight: bold; text-transform: uppercase; color: {{ $invoice->payment_status === 'paid' ? '#16a34a' : ($invoice->payment_status === 'partially_paid' ? '#d97706' : '#dc2626') }};">
                        {{ str_replace('_', ' ', $invoice->payment_status) }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <table class="details-grid" cellpadding="0" cellspacing="10">
        <tr>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Billed To (Client)</div>
                    <div style="font-weight: bold; font-size: 13px;">{{ $invoice->customer->name }}</div>
                    @if($invoice->customer->customerProfile && $invoice->customer->customerProfile->company_name)
                        <div>{{ $invoice->customer->customerProfile->company_name }}</div>
                    @endif
                    @if($invoice->customer->customerProfile && $invoice->customer->customerProfile->kra_pin)
                        <div>Client KRA PIN: <strong>{{ $invoice->customer->customerProfile->kra_pin }}</strong></div>
                    @endif
                    <div>Phone: {{ $invoice->customer->phone }}</div>
                    <div>Email: {{ $invoice->customer->email }}</div>
                </div>
            </td>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Payment Overview</div>
                    <div>Total Invoiced: <strong>KES {{ number_format($invoice->total_amount, 2) }}</strong></div>
                    <div>Total Paid: <strong style="color: #16a34a;">KES {{ number_format($invoice->amount_paid, 2) }}</strong></div>
                    <div style="border-top: 1px dashed #cbd5e1; margin-top: 6px; padding-top: 6px;">
                        Balance Outstanding: <strong style="color: #dc2626; font-size: 14px;">KES {{ number_format($invoice->balance_due, 2) }}</strong>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Description / Item</th>
                <th style="width: 15%;">SKU</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 12%;" class="text-right">Unit Price</th>
                <th style="width: 13%;" class="text-right">Amount (KES)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $item->product_name }}</strong></td>
                    <td>{{ $item->sku }}</td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table style="width: 100%;">
        <tr>
            <td style="vertical-align: top; width: 55%;">
                <div class="bank-box">
                    <strong>Official Payment Channels:</strong><br>
                    &bull; M-Pesa Buy Goods Till: <strong>543210</strong><br>
                    &bull; Bank: <strong>KCB Bank Kenya</strong> | A/C: <strong>1234567890</strong><br>
                    <small>Please quote invoice reference <strong>{{ $invoice->invoice_number }}</strong> on all payments.</small>
                </div>
            </td>
            <td style="vertical-align: top; width: 45%;">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">KES {{ number_format($invoice->subtotal, 2) }}</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                        <tr>
                            <td style="color: #ea580c;">Discount:</td>
                            <td class="text-right" style="color: #ea580c;">- KES {{ number_format($invoice->discount_amount, 2) }}</td>
                        </tr>
                    @endif
                    <tr>
                        <td>VAT (16% Inclusive):</td>
                        <td class="text-right">KES {{ number_format($invoice->vat_amount, 2) }}</td>
                    </tr>
                    <tr class="grand-total">
                        <td><strong>Total Invoiced:</strong></td>
                        <td class="text-right"><strong>KES {{ number_format($invoice->total_amount, 2) }}</strong></td>
                    </tr>
                    <tr>
                        <td style="color: #16a34a;">Amount Paid:</td>
                        <td class="text-right" style="color: #16a34a;">- KES {{ number_format($invoice->amount_paid, 2) }}</td>
                    </tr>
                    <tr style="border-top: 1px solid #cbd5e1; font-weight: bold; color: #dc2626;">
                        <td>Balance Due:</td>
                        <td class="text-right">KES {{ number_format($invoice->balance_due, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
@endsection
