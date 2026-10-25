@extends('pdf.layout')

@section('title', 'Official Receipt ' . $receipt->receipt_number)

@section('content')
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td>
                <div class="doc-title" style="color: #16a34a;">OFFICIAL PAYMENT RECEIPT</div>
                <div style="font-size: 14px; font-weight: bold; color: #080c29;">Receipt #: {{ $receipt->receipt_number }}</div>
            </td>
            <td style="text-align: right; font-size: 12px;">
                <div>Date & Time: <strong>{{ $receipt->paid_at->format('d M Y, H:i') }}</strong></div>
                <div>Status: <span style="font-weight: bold; color: #16a34a; text-transform: uppercase;">Payment Confirmed</span></div>
            </td>
        </tr>
    </table>

    <table class="details-grid" cellpadding="0" cellspacing="10">
        <tr>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Received From</div>
                    <div style="font-weight: bold; font-size: 13px;">{{ $receipt->customer->name }}</div>
                    @if($receipt->customer->customerProfile && $receipt->customer->customerProfile->company_name)
                        <div>{{ $receipt->customer->customerProfile->company_name }}</div>
                    @endif
                    <div>Phone: {{ $receipt->customer->phone }}</div>
                    <div>Email: {{ $receipt->customer->email }}</div>
                </div>
            </td>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Transaction Particulars</div>
                    <div>Payment Method: <strong style="text-transform: uppercase;">{{ str_replace('_', ' ', $receipt->payment_method) }}</strong></div>
                    <div>Transaction Ref: <strong style="color: #0e385e; font-size: 13px;">{{ $receipt->transaction_reference }}</strong></div>
                    @if($receipt->invoice)
                        <div>Against Invoice: <strong>{{ $receipt->invoice->invoice_number }}</strong></div>
                    @endif
                    @if($receipt->order)
                        <div>Against Order: <strong>{{ $receipt->order->order_number }}</strong></div>
                    @endif
                    <div>Received By: {{ $receipt->recorder ? $receipt->recorder->name : 'Online Checkout Gateway' }}</div>
                </div>
            </td>
        </tr>
    </table>

    @php
        $lineItems = collect();
        if ($receipt->invoice && $receipt->invoice->items && $receipt->invoice->items->count() > 0) {
            $lineItems = $receipt->invoice->items;
        } elseif ($receipt->order && $receipt->order->items && $receipt->order->items->count() > 0) {
            $lineItems = $receipt->order->items;
        }
        $vatableSubtotal = $lineItems->where('is_vatable', true)->sum('total_price');
        $nonVatableSubtotal = $lineItems->where('is_vatable', false)->sum('total_price');
        $totalVat = $receipt->invoice ? $receipt->invoice->vat_amount : $lineItems->sum('vat_amount');
    @endphp

    @if($lineItems->count() > 0)
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #080c29; margin-bottom: 6px;">
            Receipt Itemized Breakdown &amp; VAT Status
        </div>
        <table class="items-table" style="margin-bottom: 18px;">
            <thead>
                <tr>
                    <th style="width: 4%;">#</th>
                    <th style="width: 32%;">Item / Equipment</th>
                    <th style="width: 14%;">SKU</th>
                    <th style="width: 14%; text-align: center;">VAT Status</th>
                    <th style="width: 8%; text-align: center;">Qty</th>
                    <th style="width: 14%;" class="text-right">VAT (KES)</th>
                    <th style="width: 14%;" class="text-right">Net Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($lineItems as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td><strong>{{ $item->product_name }}</strong></td>
                        <td>{{ $item->sku }}</td>
                        <td style="text-align: center;">
                            @if($item->is_vatable)
                                <span class="vat-badge-taxable">VAT ({{ number_format($item->vat_rate, 0) }}%)</span>
                            @else
                                <span class="vat-badge-exempt">Non-VAT</span>
                            @endif
                        </td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->vat_amount, 2) }}</td>
                        <td class="text-right">{{ number_format($item->total_price, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <table style="width: 100%; margin-bottom: 15px;">
        <tr>
            <td style="vertical-align: top; width: 52%;">
                <div style="padding: 16px; background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: bold; letter-spacing: 1px;">Amount Received ({{ strtoupper(str_replace('_', ' ', $receipt->payment_method)) }})</div>
                    <div style="font-size: 26px; font-weight: bold; color: #15803d; margin: 6px 0;">KES {{ number_format($receipt->amount, 2) }}</div>
                    @if($receipt->invoice)
                        <div style="font-size: 11px; color: #475569;">
                            Remaining Invoice Balance: <strong>KES {{ number_format($receipt->invoice->balance_due, 2) }}</strong>
                        </div>
                    @endif
                </div>
            </td>
            <td style="vertical-align: top; width: 48%;">
                @if($receipt->invoice || $lineItems->count() > 0)
                    <table class="totals-table" style="width: 100%;">
                        <tr>
                            <td>VATable Items Subtotal:</td>
                            <td class="text-right">KES {{ number_format($vatableSubtotal, 2) }}</td>
                        </tr>
                        <tr>
                            <td>Non-VAT (Exempt) Subtotal:</td>
                            <td class="text-right">KES {{ number_format($nonVatableSubtotal, 2) }}</td>
                        </tr>
                        <tr>
                            <td>Total VAT Charged:</td>
                            <td class="text-right">KES {{ number_format($totalVat, 2) }}</td>
                        </tr>
                        @if($receipt->invoice)
                            <tr class="grand-total">
                                <td><strong>Invoice Total (Incl. VAT):</strong></td>
                                <td class="text-right"><strong>KES {{ number_format($receipt->invoice->total_amount, 2) }}</strong></td>
                            </tr>
                        @endif
                    </table>
                @endif
            </td>
        </tr>
    </table>

    @if($receipt->notes)
        <div style="font-size: 11px; color: #64748b; margin-top: 10px;">
            <strong>Transaction Remarks:</strong> {{ $receipt->notes }}
        </div>
    @endif
@endsection
