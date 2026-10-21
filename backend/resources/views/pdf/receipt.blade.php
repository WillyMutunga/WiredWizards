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

    <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; text-transform: uppercase; color: #166534; font-weight: bold; letter-spacing: 1px;">Amount Received in Full / Part</div>
        <div style="font-size: 32px; font-weight: bold; color: #15803d; margin: 8px 0;">KES {{ number_format($receipt->amount, 2) }}</div>
        @if($receipt->invoice)
            <div style="font-size: 12px; color: #475569;">
                Remaining Invoice Balance: <strong>KES {{ number_format($receipt->invoice->balance_due, 2) }}</strong>
            </div>
        @endif
    </div>

    @if($receipt->notes)
        <div style="font-size: 11px; color: #64748b; margin-top: 15px;">
            <strong>Transaction Remarks:</strong> {{ $receipt->notes }}
        </div>
    @endif
@endsection
