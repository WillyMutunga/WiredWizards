@extends('pdf.layout')

@section('title', 'Quotation ' . $quotation->quotation_number)

@section('content')
    <table style="width: 100%; margin-bottom: 20px;">
        <tr>
            <td>
                <div class="doc-title">OFFICIAL QUOTATION</div>
                <div style="font-size: 14px; font-weight: bold; color: #080c29;">Reference: {{ $quotation->quotation_number }}</div>
            </td>
            <td style="text-align: right; font-size: 12px;">
                <div>Date: <strong>{{ $quotation->created_at->format('d M Y') }}</strong></div>
                <div>Valid Until: <strong style="color: #ea580c;">{{ $quotation->valid_until->format('d M Y') }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="details-grid" cellpadding="0" cellspacing="10">
        <tr>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Prepared For (Customer)</div>
                    <div style="font-weight: bold; font-size: 13px;">{{ $quotation->customer->name }}</div>
                    @if($quotation->customer->customerProfile && $quotation->customer->customerProfile->company_name)
                        <div>{{ $quotation->customer->customerProfile->company_name }}</div>
                    @endif
                    <div>Phone: {{ $quotation->customer->phone }}</div>
                    <div>Email: {{ $quotation->customer->email }}</div>
                </td>
            <td class="details-col">
                <div class="card-box">
                    <div class="card-title">Sales Representative</div>
                    <div>Agent: <strong>{{ $quotation->salesAgent ? $quotation->salesAgent->name : 'Direct Online Sales' }}</strong></div>
                    <div>Email: {{ $quotation->salesAgent ? $quotation->salesAgent->email : 'sales@wiredwizards.co.ke' }}</div>
                    <div>Status: <strong style="text-transform: uppercase; color: #0284c7;">{{ $quotation->status }}</strong></div>
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Description / Equipment</th>
                <th style="width: 15%;">SKU</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 12%;" class="text-right">Unit Price (KES)</th>
                <th style="width: 13%;" class="text-right">Total (KES)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quotation->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $item->product_name }}</strong>
                    </td>
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
                    <strong>Payment Instructions:</strong><br>
                    &bull; M-Pesa Buy Goods Till: <strong>543210</strong><br>
                    &bull; Bank: <strong>KCB Bank Kenya</strong><br>
                    &bull; Account: <strong>1234567890 (Wired Wizards Ltd)</strong><br>
                    <small>Terms: {{ $quotation->terms_and_conditions ?? 'Equipment warranty valid as per manufacturer datasheets.' }}</small>
                </div>
            </td>
            <td style="vertical-align: top; width: 45%;">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">KES {{ number_format($quotation->subtotal, 2) }}</td>
                    </tr>
                    @if($quotation->discount_amount > 0)
                        <tr>
                            <td style="color: #ea580c;">Discount:</td>
                            <td class="text-right" style="color: #ea580c;">- KES {{ number_format($quotation->discount_amount, 2) }}</td>
                        </tr>
                    @endif
                    <tr>
                        <td>VAT (16%):</td>
                        <td class="text-right">KES {{ number_format($quotation->vat_amount, 2) }}</td>
                    </tr>
                    @if($quotation->delivery_fee > 0)
                        <tr>
                            <td>Delivery / Transport:</td>
                            <td class="text-right">KES {{ number_format($quotation->delivery_fee, 2) }}</td>
                        </tr>
                    @endif
                    <tr class="grand-total">
                        <td><strong>Grand Total:</strong></td>
                        <td class="text-right"><strong>KES {{ number_format($quotation->grand_total, 2) }}</strong></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
@endsection
