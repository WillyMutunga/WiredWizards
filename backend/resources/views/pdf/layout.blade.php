<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>@yield('title') - Wired Wizards</title>
    <style>
        @page {
            margin: 30px 40px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 3px solid #ea580c;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .logo {
            max-width: 220px;
            height: auto;
        }
        .company-meta {
            text-align: right;
            font-size: 11px;
            color: #475569;
        }
        .company-title {
            font-size: 15px;
            font-weight: bold;
            color: #080c29;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .doc-title {
            font-size: 24px;
            font-weight: bold;
            color: #ea580c;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 10px 0;
        }
        .details-grid {
            width: 100%;
            margin-bottom: 25px;
        }
        .details-col {
            width: 50%;
            vertical-align: top;
        }
        .card-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
        }
        .card-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            color: #080c29;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #080c29;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            padding: 10px 8px;
            text-align: left;
        }
        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right !important;
        }
        .totals-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 6px 8px;
            font-size: 12px;
        }
        .totals-table .grand-total {
            background-color: #fff7ed;
            border-top: 2px solid #ea580c;
            border-bottom: 2px solid #ea580c;
            font-size: 14px;
            font-weight: bold;
            color: #c2410c;
        }
        .bank-box {
            width: 50%;
            background-color: #f1f5f9;
            border-left: 4px solid #0e385e;
            padding: 10px 14px;
            font-size: 11px;
            margin-top: 15px;
        }
        .footer {
            position: fixed;
            bottom: 0px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="vertical-align: middle;">
                <img src="{{ public_path('images/logo.jpeg') }}" class="logo" alt="Wired Wizards Logo">
            </td>
            <td class="company-meta" style="vertical-align: middle;">
                <div class="company-title">Wired Wizards Engineering & General Supplies Ltd</div>
                <div>KRA PIN: <strong>P051982736Z</strong> | VAT: <strong>16% Inclusive</strong></div>
                <div>Machakos Branch & Nairobi Distribution Centre</div>
                <div>Tel: +254 712 345 678 | Email: sales@wiredwizards.co.ke</div>
            </td>
        </tr>
    </table>

    @yield('content')

    <div class="footer">
        Wired Wizards Engineering and General Supplies Ltd &bull; Solar Panels &bull; Inverters &bull; Batteries &bull; Water Pumps &bull; Lighting
    </div>
</body>
</html>
