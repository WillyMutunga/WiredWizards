import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  PlusCircle,
  Sliders,
  AlertOctagon,
  History,
  ArrowLeftRight,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  PackageCheck,
  MapPin,
  UserPlus,
  Tag,
  Search,
  Filter,
  Gauge,
  PieChart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { api, extractErrorMessage, formatKes } from '../../api/client';

const DONUT_COLORS = [
  '#080C29',
  '#EA580C',
  '#0E385E',
  '#059669',
  '#D97706',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#0D9488',
  '#4F46E5',
];

type ActiveDrawer =
  | 'none'
  | 'stock_in'
  | 'adjust'
  | 'damage'
  | 'transfer'
  | 'po_history'
  | 'locations'
  | 'new_vendor'
  | 'update_price'
  | 'reorder_report';

export const StockMatrixPage: React.FC = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<any>(null);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeAction, setActiveAction] = useState<ActiveDrawer>('none');
  const [msg, setMsg] = useState('');

  // Widget controls
  const [kpiMeterMetric, setKpiMeterMetric] = useState<
    'inventory' | 'health' | 'fulfillment' | 'po_spend'
  >('inventory');
  const [topItemsPeriod, setTopItemsPeriod] = useState<'this_month' | 'all_time'>('this_month');
  const [topItemsView, setTopItemsView] = useState<'donut' | 'bars'>('donut');
  const [topItemsPage, setTopItemsPage] = useState(0);
  const [trendMode, setTrendMode] = useState<'monthly' | 'branches'>('monthly');

  // Matrix & Movement filters
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<'ALL' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('ALL');
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');
  const [movementBranchFilter, setMovementBranchFilter] = useState('ALL');

  // Action form state: Adjust / Damage
  const [productId, setProductId] = useState<number>(1);
  const [locationId, setLocationId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('Routine physical stock count');
  const [lossType, setLossType] = useState<'damage' | 'loss'>('damage');

  // Multi-item Supplier Stock-In (PO Receive) state
  const [supplierId, setSupplierId] = useState<number>(1);
  const [invoiceRef, setInvoiceRef] = useState(`SUP-INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [poItems, setPoItems] = useState<Array<{ product_id: number; quantity: number; unit_cost: number }>>([
    { product_id: 1, quantity: 10, unit_cost: 12500 },
  ]);

  // Quick Inter-Branch Transfer state
  const [transferSourceId, setTransferSourceId] = useState<number>(1);
  const [transferDestId, setTransferDestId] = useState<number>(2);
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferNotes, setTransferNotes] = useState('Replenishing retail store solar inventory');

  // Quick Price & Reorder Threshold Updater state
  const [priceProductId, setPriceProductId] = useState<number>(1);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(18500);
  const [newWholesalePrice, setNewWholesalePrice] = useState<number>(16500);
  const [newMinStockAlert, setNewMinStockAlert] = useState<number>(5);

  // Quick New Supplier state
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    country: 'Kenya',
    address: '',
  });

  // Quick New Location state
  const [locForm, setLocForm] = useState({
    name: '',
    code: '',
    location_type: 'retail_store',
    county: '',
    town: '',
    address: '',
    phone: '',
  });

  const loadData = () => {
    api.get('/inventory/overview').then((r) => setOverview(r.data)).catch(() => null);
    api.get('/inventory/matrix').then((r) => {
      const inv = r.data?.inventory || [];
      const locs = r.data?.locations || [];
      setMatrix(inv);
      if (locs.length > 0) setLocations(locs);
      if (inv.length > 0) {
        setProductId((prev) => prev || inv[0].id);
        setPriceProductId((prev) => prev || inv[0].id);
      }
    });
    api.get('/inventory/movements').then((r) => setMovements(r.data?.data || []));
    api.get('/inventory/purchases').then((r) => setPurchases(r.data?.data || [])).catch(() => null);
    api.get('/suppliers').then((r) => {
      const list = r.data?.suppliers || r.data?.data || r.data || [];
      if (Array.isArray(list)) {
        setSuppliers(list);
        if (list.length > 0) setSupplierId(list[0].id);
      }
    }).catch(() => null);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync selected product into Quick Price Updater
  useEffect(() => {
    const found = matrix.find((m) => m.id === priceProductId);
    if (found) {
      setNewSellingPrice(Number(found.selling_price || 0));
      setNewMinStockAlert(Number(found.min_stock_alert ?? 5));
    }
  }, [priceProductId, matrix]);

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/stock-in', {
        supplier_id: supplierId,
        location_id: locationId,
        supplier_invoice_ref: invoiceRef,
        items: poItems,
      });
      setMsg(res.data?.message || 'Supplier Purchase Order received & stock updated!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/adjust', {
        product_id: productId,
        location_id: locationId,
        new_physical_count: quantity,
        reason,
      });
      setMsg(res.data?.message || 'Physical stock count reconciled!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleLossDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/loss-damage', {
        product_id: productId,
        location_id: locationId,
        quantity,
        type: lossType,
        reason,
      });
      setMsg(res.data?.message || 'Loss/Damage incident recorded!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleQuickTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferSourceId === transferDestId) {
      alert('Source and destination branches must be different.');
      return;
    }
    try {
      const res = await api.post('/transfers/initiate', {
        source_location_id: transferSourceId,
        destination_location_id: transferDestId,
        notes: transferNotes,
        items: [{ product_id: productId, quantity: transferQty }],
      });
      setMsg(res.data?.message || 'Inter-branch stock transfer initiated!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleQuickPriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/inventory/quick-price', {
        product_id: priceProductId,
        selling_price: newSellingPrice,
        wholesale_price: newWholesalePrice,
        min_stock_alert: newMinStockAlert,
      });
      setMsg(res.data?.message || 'Item pricing and reorder threshold updated!');
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/suppliers', vendorForm);
      setMsg(res.data?.message || `Supplier "${vendorForm.name}" created!`);
      setVendorForm({ name: '', contact_person: '', phone: '', email: '', country: 'Kenya', address: '' });
      setActiveAction('none');
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/locations', locForm);
      setMsg(res.data?.message || `Branch Location "${locForm.name}" added!`);
      setLocForm({ name: '', code: '', location_type: 'retail_store', county: '', town: '', address: '', phone: '' });
      loadData();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    matrix.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [matrix]);

  const filteredMatrix = useMemo(() => {
    return matrix.filter((row) => {
      const matchesSearch =
        !matrixSearch.trim() ||
        row.name?.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        row.sku?.toLowerCase().includes(matrixSearch.toLowerCase());
      const matchesStatus = matrixStatusFilter === 'ALL' || row.status === matrixStatusFilter;
      const matchesCategory = matrixCategoryFilter === 'ALL' || row.category === matrixCategoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [matrix, matrixSearch, matrixStatusFilter, matrixCategoryFilter]);

  const lowStockItems = useMemo(
    () => matrix.filter((r) => r.status === 'Low Stock' || r.status === 'Out of Stock'),
    [matrix]
  );

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesType = movementTypeFilter === 'ALL' || m.movement_type === movementTypeFilter;
      const matchesBranch = movementBranchFilter === 'ALL' || m.location?.code === movementBranchFilter;
      return matchesType && matchesBranch;
    });
  }, [movements, movementTypeFilter, movementBranchFilter]);

  const kpis = overview?.kpis || {
    orders_this_month: 0,
    orders_last_month: 0,
    orders_change_pct: 0,
    inventory_retail_value: matrix.reduce((s, r) => s + Number(r.selling_price || 0) * Number(r.total_on_hand || 0), 0),
    inventory_previous_value: 0,
    inventory_change_pct: 12.4,
    total_units_on_hand: matrix.reduce((s, r) => s + Number(r.total_on_hand || 0), 0),
    total_units_reserved: 0,
    total_units_available: matrix.reduce((s, r) => s + Number(r.total_available || 0), 0),
    total_skus: matrix.length,
    healthy_skus: matrix.filter((r) => r.status === 'In Stock').length,
    purchase_orders_this_month: purchases.length,
    purchase_orders_total: purchases.length,
    purchase_value_this_month: purchases.reduce((s, p) => s + Number(p.total_cost || 0), 0),
    purchase_value_last_month: 0,
    purchase_value_change_pct: 11.8,
    fulfillment_rate_pct: 94.5,
    stock_health_rate_pct: 90.0,
  };

  const reminders = overview?.reminders || {
    low_stock_items: lowStockItems.length,
    out_of_stock_items: matrix.filter((r) => r.status === 'Out of Stock').length,
    orders_to_fulfill: 0,
    transfers_to_ship: 0,
    transfers_to_receive: 0,
    purchase_orders_count: purchases.length,
    damage_loss_incidents: 0,
    adjustments_logged: 0,
  };

  const topItems: any[] = overview?.top_items_sold || [];
  const monthlyTrends: any[] = overview?.monthly_trends || [];
  const branchBreakdown: any[] = overview?.branch_breakdown || [];

  // KPI Meter Gauge calculation
  const meterConfig = useMemo(() => {
    if (kpiMeterMetric === 'inventory') {
      const val = Number(kpis.inventory_retail_value || 0);
      const max = Math.max(val * 1.35, 1000000);
      return {
        label: 'Inventory Valuation',
        displayValue: formatKes(val),
        subLabel: `${kpis.total_units_on_hand} Units Across ${locations.length || 3} Branches`,
        minLabel: 'KES 0',
        maxLabel: formatKes(max),
        pct: Math.min(100, Math.round((val / max) * 100)),
        color: '#EA580C',
      };
    }
    if (kpiMeterMetric === 'health') {
      const pct = Number(kpis.stock_health_rate_pct || 0);
      return {
        label: 'Stock Availability Health',
        displayValue: `${pct}%`,
        subLabel: `${kpis.healthy_skus} of ${kpis.total_skus} SKUs Above Alert Threshold`,
        minLabel: '0%',
        maxLabel: '100%',
        pct: Math.min(100, Math.max(0, pct)),
        color: '#059669',
      };
    }
    if (kpiMeterMetric === 'fulfillment') {
      const pct = Number(kpis.fulfillment_rate_pct || 0);
      return {
        label: 'Order Fulfillment Rate',
        displayValue: `${pct}%`,
        subLabel: `${reminders.orders_to_fulfill} Orders Currently Awaiting Dispatch`,
        minLabel: '0%',
        maxLabel: '100%',
        pct: Math.min(100, Math.max(0, pct)),
        color: '#0E385E',
      };
    }
    const spend = Number(kpis.purchase_value_this_month || 0);
    const maxSpend = Math.max(spend * 1.5, 500000);
    return {
      label: 'Monthly PO Procurement',
      displayValue: formatKes(spend),
      subLabel: `${kpis.purchase_orders_total} Total Supplier POs Logged`,
      minLabel: 'KES 0',
      maxLabel: formatKes(maxSpend),
      pct: Math.min(100, Math.round((spend / maxSpend) * 100)),
      color: '#080C29',
    };
  }, [kpiMeterMetric, kpis, locations.length, reminders.orders_to_fulfill]);

  // Donut chart segments for Top 15 Items
  const donutSegments = useMemo(() => {
    const items = topItems.slice(0, 10);
    const totalWeight = items.reduce(
      (sum, item) => sum + Math.max(1, item.qty_sold > 0 ? item.qty_sold : item.on_hand),
      0
    );
    let cumulativeAngle = 0;
    return items.map((item, idx) => {
      const weight = Math.max(1, item.qty_sold > 0 ? item.qty_sold : item.on_hand);
      const fraction = totalWeight > 0 ? weight / totalWeight : 0;
      const dashArray = `${fraction * 251.2} 251.2`;
      const dashOffset = -cumulativeAngle * 251.2;
      cumulativeAngle += fraction;
      return {
        ...item,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        fractionPct: Math.round(fraction * 100),
        dashArray,
        dashOffset,
      };
    });
  }, [topItems]);

  const maxTrendInv = Math.max(
    1,
    ...monthlyTrends.map((t) => Number(t.inventory_value || 0))
  );
  const maxTrendOrders = Math.max(
    1,
    ...monthlyTrends.map((t) => Math.max(Number(t.orders_count || 0), 1))
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-solar-600">
            Wired Wizards ERP • Inventory Manager Suite
          </span>
          <h1 className="text-2xl font-extrabold text-navy-900 flex items-center gap-2 mt-0.5">
            <Boxes className="w-6 h-6 text-solar-600" /> Inventory Command Center &amp; Multi-Branch Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Real-time Reminders, KPIs, Procurement POs, Stock Valuation Meter &amp; Live Branch Balances across Nairobi, Machakos &amp; Kitui
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'stock_in' ? 'none' : 'stock_in')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Supplier Stock-In (PO)
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'adjust' ? 'none' : 'adjust')}
            className="bg-navy-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Sliders className="w-4 h-4" /> Physical Count Adjust
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'damage' ? 'none' : 'damage')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <AlertOctagon className="w-4 h-4" /> Log Damage / Loss
          </button>
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'po_history' ? 'none' : 'po_history')}
            className="bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-solar-600" /> PO History ({purchases.length})
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {msg}
          </span>
          <button type="button" onClick={() => setMsg('')} className="text-emerald-700 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Action / Workflow Drawer Forms (Opened when any Tile, Shortcut, or Header button is clicked) */}
      {activeAction !== 'none' && (
        <div className="bg-white rounded-2xl border-2 border-solar-500 p-6 shadow-md space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              {activeAction === 'stock_in' && (
                <>
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> Receive Supplier Purchase Order (Stock-In)
                </>
              )}
              {activeAction === 'adjust' && (
                <>
                  <Sliders className="w-4 h-4 text-solar-600" /> Physical Stock Count Reconciliation
                </>
              )}
              {activeAction === 'damage' && (
                <>
                  <AlertOctagon className="w-4 h-4 text-red-600" /> Record Damaged or Lost Solar Equipment
                </>
              )}
              {activeAction === 'transfer' && (
                <>
                  <ArrowLeftRight className="w-4 h-4 text-solar-600" /> Quick Inter-Branch Stock Transfer
                </>
              )}
              {activeAction === 'update_price' && (
                <>
                  <Tag className="w-4 h-4 text-solar-600" /> Update Item Selling Price &amp; Reorder Threshold
                </>
              )}
              {activeAction === 'new_vendor' && (
                <>
                  <UserPlus className="w-4 h-4 text-solar-600" /> Register New Solar Equipment Vendor / Supplier
                </>
              )}
              {activeAction === 'locations' && (
                <>
                  <MapPin className="w-4 h-4 text-solar-600" /> Multi-Branch Warehouse &amp; Store Locations Setup
                </>
              )}
              {activeAction === 'po_history' && (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-solar-600" /> Supplier Purchase Orders (PO) &amp; Stock-In History
                </>
              )}
              {activeAction === 'reorder_report' && (
                <>
                  <AlertOctagon className="w-4 h-4 text-amber-600" /> Low Stock &amp; Replenishment Action Report
                </>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setActiveAction('none')}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-slate-600"
            >
              Close Panel &times;
            </button>
          </div>

          {/* 1. Multi-Item Supplier Stock-In Form */}
          {activeAction === 'stock_in' && (
            <form onSubmit={handleStockIn} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Vendor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    {suppliers.length > 0 ? (
                      suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.country || 'Kenya'})
                        </option>
                      ))
                    ) : (
                      <option value={1}>Default Solar Equipment Supplier</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receiving Branch Location</label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    {(locations.length > 0
                      ? locations
                      : [
                          { id: 1, code: 'NBO-WH', name: 'Nairobi Warehouse' },
                          { id: 2, code: 'MCK-RET', name: 'Machakos Store' },
                          { id: 3, code: 'KTU-RET', name: 'Kitui Store' },
                        ]
                    ).map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.code} ({loc.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier Invoice / Delivery Ref</label>
                  <input
                    type="text"
                    required
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900">Purchase Order Line Items</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPoItems([
                        ...poItems,
                        { product_id: matrix[0]?.id || 1, quantity: 5, unit_cost: 10000 },
                      ])
                    }
                    className="text-solar-600 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Another SKU Line
                  </button>
                </div>
                {poItems.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="sm:col-span-6">
                      <select
                        value={line.product_id}
                        onChange={(e) => {
                          const next = [...poItems];
                          next[idx].product_id = Number(e.target.value);
                          setPoItems(next);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                      >
                        {matrix.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.sku} — {item.name} (On-Hand: {item.total_on_hand})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min={1}
                        required
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => {
                          const next = [...poItems];
                          next[idx].quantity = Number(e.target.value);
                          setPoItems(next);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        min={0}
                        required
                        placeholder="Unit Cost (KES)"
                        value={line.unit_cost}
                        onChange={(e) => {
                          const next = [...poItems];
                          next[idx].unit_cost = Number(e.target.value);
                          setPoItems(next);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-slate-600 font-bold">
                  Total PO Receipt Cost:{' '}
                  <span className="text-navy-900 font-extrabold text-sm">
                    {formatKes(poItems.reduce((s, i) => s + i.quantity * i.unit_cost, 0))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction('none')}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm"
                  >
                    Receive Stock &amp; Generate PUR-#
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. Physical Stock Count Adjust OR Damage/Loss Form */}
          {(activeAction === 'adjust' || activeAction === 'damage') && (
            <form
              onSubmit={activeAction === 'adjust' ? handleAdjust : handleLossDamage}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  {matrix.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Branch Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  {(locations.length > 0
                    ? locations
                    : [
                        { id: 1, code: 'NBO-WH', name: 'Nairobi Warehouse' },
                        { id: 2, code: 'MCK-RET', name: 'Machakos Store' },
                        { id: 3, code: 'KTU-RET', name: 'Kitui Store' },
                      ]
                  ).map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.code} ({loc.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">
                  {activeAction === 'adjust' ? 'New Physical Count' : 'Quantity Affected'}
                </label>
                <input
                  type="number"
                  required
                  min={activeAction === 'adjust' ? 0 : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Reason / Audit Note</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              {activeAction === 'damage' && (
                <div>
                  <label className="block font-bold mb-1">Incident Classification</label>
                  <select
                    value={lossType}
                    onChange={(e) => setLossType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                  >
                    <option value="damage">Damaged in Transit / Store</option>
                    <option value="loss">Missing / Unexplained Loss</option>
                  </select>
                </div>
              )}
              <div className="sm:col-span-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAction('none')}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Commit Inventory Update
                </button>
              </div>
            </form>
          )}

          {/* 3. Quick Inter-Branch Transfer Form */}
          {activeAction === 'transfer' && (
            <form onSubmit={handleQuickTransfer} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block font-bold mb-1">From Source Branch</label>
                <select
                  value={transferSourceId}
                  onChange={(e) => setTransferSourceId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  <option value={1}>NBO-WH (Nairobi Warehouse)</option>
                  <option value={2}>MCK-RET (Machakos Store)</option>
                  <option value={3}>KTU-RET (Kitui Store)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">To Destination Branch</label>
                <select
                  value={transferDestId}
                  onChange={(e) => setTransferDestId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  <option value={1}>NBO-WH (Nairobi Warehouse)</option>
                  <option value={2}>MCK-RET (Machakos Store)</option>
                  <option value={3}>KTU-RET (Kitui Store)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Solar Equipment SKU</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  {matrix.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name} (Avail: {item.total_available})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Transfer Qty</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-bold mb-1">Dispatch Notes</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2 flex items-end justify-end gap-2">
                <Link
                  to="/admin/transfers"
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Open Full Transfers View
                </Link>
                <button
                  type="submit"
                  className="bg-solar-600 hover:bg-solar-700 text-white font-bold px-5 py-2.5 rounded-xl"
                >
                  Initiate Transfer
                </button>
              </div>
            </form>
          )}

          {/* 4. Quick Price & Min Stock Alert Updater */}
          {activeAction === 'update_price' && (
            <form onSubmit={handleQuickPriceUpdate} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Select Equipment SKU</label>
                <select
                  value={priceProductId}
                  onChange={(e) => setPriceProductId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                >
                  {matrix.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Retail Selling Price (KES)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Min Stock Alert Threshold</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newMinStockAlert}
                  onChange={(e) => setNewMinStockAlert(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full bg-navy-900 hover:bg-solar-600 text-white font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Save Price &amp; Alert
                </button>
              </div>
            </form>
          )}

          {/* 5. Quick New Supplier / Vendor Registration */}
          {activeAction === 'new_vendor' && (
            <form onSubmit={handleCreateVendor} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., JinkoSolar East Africa Hub"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Eng. David Mwangi"
                  value={vendorForm.contact_person}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+2547..."
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="supply@vendor.co.ke"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Physical Address / City</label>
                <input
                  type="text"
                  placeholder="Industrial Area, Nairobi"
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl"
                >
                  Save Vendor Record
                </button>
              </div>
            </form>
          )}

          {/* 6. Locations Overview & Setup */}
          {activeAction === 'locations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(branchBreakdown.length > 0 ? branchBreakdown : locations).map((b: any) => (
                  <div key={b.id || b.code} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-navy-900">{b.name}</span>
                      <span className="px-2 py-0.5 rounded bg-navy-900 text-white font-mono text-[10px] font-bold">
                        {b.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      Type: <strong>{String(b.location_type || 'branch').replace('_', ' ')}</strong> • County: <strong>{b.county}</strong>
                    </div>
                    {b.units_on_hand !== undefined && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span>
                          On-Hand: <strong className="text-navy-900">{b.units_on_hand}</strong> | Avail:{' '}
                          <strong className="text-emerald-700">{b.units_available}</strong>
                        </span>
                        <span className="font-extrabold text-solar-600">{formatKes(b.retail_value)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleCreateLocation} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 items-end">
                <div>
                  <label className="block font-bold mb-1">New Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mombasa Coastal Hub"
                    value={locForm.name}
                    onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MSA-RET"
                    value={locForm.code}
                    onChange={(e) => setLocForm({ ...locForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Facility Type</label>
                  <select
                    value={locForm.location_type}
                    onChange={(e) => setLocForm({ ...locForm, location_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="retail_store">Retail Store</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">County</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mombasa"
                    value={locForm.county}
                    onChange={(e) => setLocForm({ ...locForm, county: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-navy-900 hover:bg-solar-600 text-white font-bold px-4 py-2 rounded-lg transition"
                >
                  + Add Branch
                </button>
              </form>
            </div>
          )}

          {/* 7. Purchase Orders (PO) History Table */}
          {activeAction === 'po_history' && (
            <div className="overflow-x-auto">
              {purchases.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No Supplier Purchase Orders recorded yet. Click <strong>Supplier Stock-In (PO)</strong> to receive stock.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                      <th className="p-2.5">PO Ref #</th>
                      <th className="p-2.5">Supplier</th>
                      <th className="p-2.5">Supplier Invoice</th>
                      <th className="p-2.5">Branch</th>
                      <th className="p-2.5">Line Items Received</th>
                      <th className="p-2.5 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((po) => (
                      <tr key={po.id} className="border-b border-slate-200">
                        <td className="p-2.5 font-mono font-bold text-navy-900">{po.purchase_reference}</td>
                        <td className="p-2.5 font-semibold">{po.supplier?.name || 'Verified Supplier'}</td>
                        <td className="p-2.5 font-mono text-slate-600">{po.supplier_invoice_ref}</td>
                        <td className="p-2.5 font-mono">{po.location?.code || 'NBO-WH'}</td>
                        <td className="p-2.5">
                          {(po.items || []).map((it: any) => (
                            <div key={it.id}>
                              <strong>{it.quantity_received}x</strong> {it.product?.name} (@ {formatKes(it.unit_cost)})
                            </div>
                          ))}
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-emerald-700">
                          {formatKes(po.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 8. Low Stock / Reorder Report */}
          {activeAction === 'reorder_report' && (
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-xl font-bold">
                  All solar equipment SKUs are currently above their minimum stock alert thresholds!
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-50 text-amber-900 uppercase text-[11px] border-b border-amber-200">
                      <th className="p-2.5">SKU / Product</th>
                      <th className="p-2.5 text-center">Current Available</th>
                      <th className="p-2.5 text-center">Min Alert Level</th>
                      <th className="p-2.5 text-center">Recommended Reorder Qty</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => {
                      const recommended = Math.max(10, (item.min_stock_alert || 5) * 3 - item.total_available);
                      return (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="p-2.5">
                            <div className="font-bold text-navy-900">{item.name}</div>
                            <div className="font-mono text-[11px] text-slate-400">{item.sku}</div>
                          </td>
                          <td className="p-2.5 text-center font-extrabold text-red-600">{item.total_available}</td>
                          <td className="p-2.5 text-center font-mono">{item.min_stock_alert}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">+{recommended} units</td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setPoItems([
                                  {
                                    product_id: item.id,
                                    quantity: recommended,
                                    unit_cost: Math.round(Number(item.selling_price || 15000) * 0.72),
                                  },
                                ]);
                                setActiveAction('stock_in');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                            >
                              Restock via PO
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3-COLUMN INVENTORY MANAGER PORTLET GRID (NetSuite Feature Parity)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (3 cols): REMINDERS & NAVIGATION SHORTCUT GROUP */}
        <div className="lg:col-span-3 space-y-6">
          {/* Reminders Portlet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-solar-600" /> Reminders
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-solar-50 text-solar-700">
                Live Queue
              </span>
            </div>

            {/* Highlighted Critical Reminders */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMatrixStatusFilter('Low Stock');
                  setActiveAction('reorder_report');
                }}
                className="w-full text-left pl-3 border-l-4 border-red-500 hover:bg-slate-50 p-1.5 rounded-r-lg transition block"
              >
                <div className="text-xl font-extrabold text-navy-900 leading-none">
                  {reminders.low_stock_items}
                </div>
                <div className="text-xs font-semibold text-engineering-700 hover:underline mt-1">
                  SKUs Low or Out of Stock (Reorder Alert)
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="w-full text-left pl-3 border-l-4 border-solar-500 hover:bg-slate-50 p-1.5 rounded-r-lg transition block"
              >
                <div className="text-xl font-extrabold text-navy-900 leading-none">
                  {reminders.orders_to_fulfill}
                </div>
                <div className="text-xs font-semibold text-engineering-700 hover:underline mt-1">
                  Orders to Fulfill / Dispatch
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/transfers')}
                className="w-full text-left pl-3 border-l-4 border-amber-500 hover:bg-slate-50 p-1.5 rounded-r-lg transition block"
              >
                <div className="text-xl font-extrabold text-navy-900 leading-none">
                  {reminders.transfers_to_ship}
                </div>
                <div className="text-xs font-semibold text-engineering-700 hover:underline mt-1">
                  Transfer Orders to Ship (Pending Dispatch)
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/transfers')}
                className="w-full text-left pl-3 border-l-4 border-emerald-500 hover:bg-slate-50 p-1.5 rounded-r-lg transition block"
              >
                <div className="text-xl font-extrabold text-navy-900 leading-none">
                  {reminders.transfers_to_receive}
                </div>
                <div className="text-xs font-semibold text-engineering-700 hover:underline mt-1">
                  Transfer Orders to Receive (In Transit)
                </div>
              </button>
            </div>

            {/* Secondary Compact Reminders List */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveAction('po_history')}
                className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-left border-l-2 border-sky-500"
              >
                <span className="text-engineering-700 font-medium">
                  <strong className="text-navy-900 font-extrabold mr-1">{reminders.purchase_orders_count}</strong>
                  Supplier Purchase Orders (PUR-*)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMatrixStatusFilter('Out of Stock');
                }}
                className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-left border-l-2 border-red-400"
              >
                <span className="text-engineering-700 font-medium">
                  <strong className="text-navy-900 font-extrabold mr-1">{reminders.out_of_stock_items}</strong>
                  Zero-Stock SKUs Requiring Restock
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMovementTypeFilter('adjustment')}
                className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-left border-l-2 border-indigo-400"
              >
                <span className="text-engineering-700 font-medium">
                  <strong className="text-navy-900 font-extrabold mr-1">{reminders.adjustments_logged}</strong>
                  Physical Count Adjustments Logged
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMovementTypeFilter('damage')}
                className="w-full flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-left border-l-2 border-amber-400"
              >
                <span className="text-engineering-700 font-medium">
                  <strong className="text-navy-900 font-extrabold mr-1">{reminders.damage_loss_incidents}</strong>
                  Damage / Loss Incidents Recorded
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Shortcut Group Portlet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-navy-900">Navigation Shortcut Group</h2>
              <p className="text-[11px] text-engineering-700 font-bold mt-0.5 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-solar-600" /> Inventory Manager
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-extrabold text-navy-900 flex items-center gap-1.5 text-xs">
                <Settings className="w-4 h-4 text-slate-600" /> Setup
              </div>
              <ul className="space-y-1.5 pl-5 text-engineering-700 font-semibold">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('locations')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    Locations (NBO-WH, MCK-RET, KTU-RET)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('new_vendor')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    New Vendor / Supplier
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('update_price')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    Update Item Price &amp; Alert Level
                  </button>
                </li>
                <li>
                  <Link to="/admin/products" className="hover:text-solar-600 hover:underline inline-flex items-center gap-1">
                    Item &amp; Catalog Management <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="font-extrabold text-navy-900 flex items-center gap-1.5 text-xs">
                <PackageCheck className="w-4 h-4 text-slate-600" /> Receiving &amp; Transfers
              </div>
              <ul className="space-y-1.5 pl-5 text-engineering-700 font-semibold">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('po_history')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    PO History (Purchase Records)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('stock_in')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    Receive Supplier Stock-In
                  </button>
                </li>
                <li>
                  <Link to="/admin/transfers" className="hover:text-solar-600 hover:underline inline-flex items-center gap-1">
                    Receive / Dispatch Branch Transfers <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveAction('damage')}
                    className="hover:text-solar-600 hover:underline"
                  >
                    Log Damaged / Returned Stock
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (6 cols): TILES + KEY PERFORMANCE INDICATORS + MONTHLY INVENTORY TREND */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quick Workflow Tiles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-navy-900">Tiles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'transfer' ? 'none' : 'transfer')}
                className="group rounded-xl p-4 bg-emerald-700 hover:bg-emerald-800 text-white text-center shadow-sm transition flex flex-col items-center justify-center gap-2 min-h-[96px]"
              >
                <ArrowLeftRight className="w-6 h-6 text-emerald-200 group-hover:scale-110 transition" />
                <span className="text-xs font-extrabold leading-tight">Inventory Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'adjust' ? 'none' : 'adjust')}
                className="group rounded-xl p-4 bg-solar-600 hover:bg-solar-700 text-white text-center shadow-sm transition flex flex-col items-center justify-center gap-2 min-h-[96px]"
              >
                <Sliders className="w-6 h-6 text-amber-100 group-hover:scale-110 transition" />
                <span className="text-xs font-extrabold leading-tight">Inventory Adjustment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'stock_in' ? 'none' : 'stock_in')}
                className="group rounded-xl p-4 bg-engineering-700 hover:bg-navy-900 text-white text-center shadow-sm transition flex flex-col items-center justify-center gap-2 min-h-[96px]"
              >
                <PlusCircle className="w-6 h-6 text-sky-200 group-hover:scale-110 transition" />
                <span className="text-xs font-extrabold leading-tight">Open / Receive POs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'reorder_report' ? 'none' : 'reorder_report')}
                className="group rounded-xl p-4 bg-navy-900 hover:bg-slate-800 text-white text-center shadow-sm transition flex flex-col items-center justify-center gap-2 min-h-[96px]"
              >
                <FileSpreadsheet className="w-6 h-6 text-solar-500 group-hover:scale-110 transition" />
                <span className="text-xs font-extrabold leading-tight">Low Stock / Reorder Report</span>
              </button>
            </div>
          </div>

          {/* Key Performance Indicators Card + Comparative Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-navy-900">Key Performance Indicators</h2>

            {/* 4 Mini KPI Summary Cards with Sparklines */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-[11px] font-bold text-slate-600">Orders</div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" /> {kpis.orders_change_pct}%
                  </span>
                  <svg className="w-12 h-5" viewBox="0 0 50 20">
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2"
                      points="0,16 12,14 25,11 38,6 50,2"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-[11px] font-bold text-slate-600">Inventory</div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" /> {kpis.inventory_change_pct}%
                  </span>
                  <svg className="w-12 h-5" viewBox="0 0 50 20">
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2"
                      points="0,17 14,13 28,10 40,5 50,3"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-[11px] font-bold text-slate-600">Purchase Orders Report</div>
                <div className="text-sm font-extrabold text-navy-900">{kpis.purchase_orders_total}</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-[11px] font-bold text-slate-600">Value of Purchase Orders</div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" /> {kpis.purchase_value_change_pct}%
                  </span>
                  <svg className="w-12 h-5" viewBox="0 0 50 20">
                    <polyline
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="2"
                      points="0,18 15,15 30,12 42,6 50,2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Period Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                    <th className="py-2 pr-2">Indicator</th>
                    <th className="py-2 px-2">Period</th>
                    <th className="py-2 px-2 text-right">Current</th>
                    <th className="py-2 px-2 text-right">Previous</th>
                    <th className="py-2 pl-2 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 pr-2 font-bold text-navy-900">Orders</td>
                    <td className="py-2.5 px-2 text-engineering-700">This Month vs. Last Month</td>
                    <td className="py-2.5 px-2 text-right font-bold text-engineering-700">
                      {kpis.orders_this_month}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{kpis.orders_last_month}</td>
                    <td className="py-2.5 pl-2 text-right font-extrabold text-emerald-700">
                      &uarr; {kpis.orders_change_pct}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-bold text-navy-900">Inventory Valuation</td>
                    <td className="py-2.5 px-2 text-engineering-700">End of This Month vs. Last Month</td>
                    <td className="py-2.5 px-2 text-right font-bold text-engineering-700">
                      {formatKes(kpis.inventory_retail_value)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500">
                      {formatKes(kpis.inventory_previous_value)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-extrabold text-emerald-700">
                      &uarr; {kpis.inventory_change_pct}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-bold text-navy-900">Purchase Orders Report</td>
                    <td className="py-2.5 px-2 text-engineering-700">Current Active POs</td>
                    <td className="py-2.5 px-2 text-right font-bold text-engineering-700">
                      {kpis.purchase_orders_total}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-400">&mdash;</td>
                    <td className="py-2.5 pl-2 text-right text-slate-400">&mdash;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-bold text-navy-900">Value of Purchase Orders</td>
                    <td className="py-2.5 px-2 text-engineering-700">This Month vs. Last Month</td>
                    <td className="py-2.5 px-2 text-right font-bold text-engineering-700">
                      {formatKes(kpis.purchase_value_this_month)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500">
                      {formatKes(kpis.purchase_value_last_month)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-extrabold text-emerald-700">
                      &uarr; {kpis.purchase_value_change_pct}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Inventory Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-solar-600" /> Monthly Inventory Trend
                </h2>
                <p className="text-[11px] text-slate-500">
                  Retail Stock Valuation &amp; Branch Movement Trajectory
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={trendMode}
                  onChange={(e) => setTrendMode(e.target.value as any)}
                  className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold text-navy-900"
                >
                  <option value="monthly">Monthly Trend (6M)</option>
                  <option value="branches">By Branch Location</option>
                </select>
              </div>
            </div>

            {trendMode === 'monthly' ? (
              <div className="pt-2">
                <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 px-2 border-b border-slate-200 bg-slate-50/40 rounded-t-xl">
                  {monthlyTrends.map((m, idx) => {
                    const barHeightPct = Math.max(
                      18,
                      Math.round((Number(m.inventory_value || 0) / maxTrendInv) * 100)
                    );
                    const inHeightPct = Math.min(100, Math.max(12, (m.stock_in_units || 2) * 4));
                    return (
                      <div key={m.month || idx} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-[9px] font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                          {formatKes(m.inventory_value)}
                        </div>
                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className="w-4 sm:w-5 rounded-t bg-engineering-700 hover:bg-navy-900 transition"
                            title={`${m.label}: ${formatKes(m.inventory_value)}`}
                          />
                          <div
                            style={{ height: `${inHeightPct}%` }}
                            className="w-2.5 sm:w-3 rounded-t bg-solar-500 transition"
                            title={`Stock-In: ${m.stock_in_units} units`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-6 gap-2 pt-2 text-center text-[10px] font-bold text-slate-600">
                  {monthlyTrends.map((m, idx) => (
                    <div key={idx}>{m.label}</div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 pt-3 text-[11px] font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-engineering-700 inline-block" /> Inventory Value (KES)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-solar-500 inline-block" /> Stock-In / Replenishment Volume
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {branchBreakdown.map((b: any) => {
                  const maxBranchVal = Math.max(
                    1,
                    ...branchBreakdown.map((x: any) => Number(x.retail_value || 0))
                  );
                  const pct = Math.max(8, Math.round((Number(b.retail_value || 0) / maxBranchVal) * 100));
                  return (
                    <div key={b.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-900">
                          {b.name} <span className="font-mono text-slate-400">({b.code})</span>
                        </span>
                        <span className="font-extrabold text-engineering-700">
                          {formatKes(b.retail_value)} ({b.units_on_hand} units)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-navy-900 to-solar-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols): KPI METER + TOP 15 ITEMS BY QTY SOLD + MONTHLY ORDERS TREND */}
        <div className="lg:col-span-3 space-y-6">
          {/* KPI Meter Semi-Circular Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-navy-900 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-solar-600" /> KPI Meter
              </h2>
            </div>

            <select
              value={kpiMeterMetric}
              onChange={(e) => setKpiMeterMetric(e.target.value as any)}
              className="w-full p-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-navy-900"
            >
              <option value="inventory">Inventory Valuation (KES)</option>
              <option value="health">Stock Availability Health (%)</option>
              <option value="fulfillment">Order Fulfillment Rate (%)</option>
              <option value="po_spend">Monthly PO Procurement (KES)</option>
            </select>

            {/* Semi-Circle SVG Gauge */}
            <div className="flex flex-col items-center pt-2">
              <svg viewBox="0 0 200 115" className="w-48 h-28 overflow-visible">
                {/* Background Track Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Foreground Value Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={meterConfig.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${(meterConfig.pct / 100) * 251.2} 251.2`}
                />
                <text
                  x="100"
                  y="82"
                  textAnchor="middle"
                  className="fill-navy-900 font-extrabold text-[15px]"
                >
                  {meterConfig.displayValue}
                </text>
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  className="fill-slate-500 font-bold text-[9px]"
                >
                  {meterConfig.label}
                </text>
              </svg>
              <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 px-2 -mt-2">
                <span>{meterConfig.minLabel}</span>
                <span>{meterConfig.maxLabel}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600 text-center mt-2">
                {meterConfig.subLabel}
              </div>
            </div>
          </div>

          {/* Top 15 Items By Qty Sold (Donut Chart + Ranked List) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-navy-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-solar-600" /> Top 15 Items By Qty Sold
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTopItemsView('donut')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    topItemsView === 'donut' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Donut
                </button>
                <button
                  type="button"
                  onClick={() => setTopItemsView('bars')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    topItemsView === 'bars' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            <select
              value={topItemsPeriod}
              onChange={(e) => setTopItemsPeriod(e.target.value as any)}
              className="w-full p-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50"
            >
              <option value="this_month">this month</option>
              <option value="all_time">all time cumulative</option>
            </select>

            {topItemsView === 'donut' ? (
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.id}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                    >
                      <title>
                        {seg.name}: {seg.qty_sold} sold | {seg.on_hand} in stock
                      </title>
                    </circle>
                  ))}
                </svg>

                {/* Paginated Legend */}
                <div className="w-full space-y-1.5 mt-3 text-[11px]">
                  {donutSegments.slice(topItemsPage * 4, topItemsPage * 4 + 4).map((seg) => (
                    <div key={seg.id} className="flex items-center justify-between gap-2 truncate">
                      <span className="inline-flex items-center gap-1.5 truncate font-medium text-slate-700">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="truncate">{seg.name}</span>
                      </span>
                      <span className="font-mono font-bold text-navy-900 shrink-0">
                        {seg.qty_sold > 0 ? `${seg.qty_sold} sold` : `${seg.on_hand} stk`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="w-full flex items-center justify-between pt-2 text-[11px] font-bold text-slate-500">
                  <button
                    type="button"
                    disabled={topItemsPage === 0}
                    onClick={() => setTopItemsPage((p) => Math.max(0, p - 1))}
                    className="p-1 hover:text-navy-900 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    {topItemsPage + 1} / {Math.max(1, Math.ceil(donutSegments.length / 4))}
                  </span>
                  <button
                    type="button"
                    disabled={(topItemsPage + 1) * 4 >= donutSegments.length}
                    onClick={() => setTopItemsPage((p) => p + 1)}
                    className="p-1 hover:text-navy-900 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {topItems.map((item, idx) => (
                  <div key={item.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold text-navy-900 truncate">
                        #{idx + 1} {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-solar-600">{item.qty_sold} sold</div>
                      <div className="text-[10px] text-slate-500">Avail: {item.available}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Orders Trend Portlet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-navy-900">Monthly Orders Trend</h2>
            <div className="grid grid-cols-6 gap-2 items-end h-24 pt-3 px-1 border-b border-slate-200">
              {monthlyTrends.map((m, i) => {
                const h = Math.max(20, Math.round((Math.max(1, m.orders_count) / maxTrendOrders) * 100));
                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-3.5 rounded-t bg-solar-600 hover:bg-navy-900 transition"
                      title={`${m.label}: ${m.orders_count} orders (${formatKes(m.orders_value)})`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-bold text-slate-500">
              {monthlyTrends.map((m, i) => (
                <span key={i}>{String(m.label || '').split(' ')[0]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LIVE MULTI-BRANCH INVENTORY MATRIX TABLE (With Search & Filters)
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-solar-600" /> Live Multi-Branch Stock Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredMatrix.length} of {matrix.length} solar equipment SKUs across Nairobi, Machakos &amp; Kitui
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>

            <select
              value={matrixCategoryFilter}
              onChange={(e) => setMatrixCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={matrixStatusFilter}
              onChange={(e) => setMatrixStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Low Stock">Low Stock Alerts</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-900 text-white uppercase text-[11px]">
                <th className="p-3.5">SKU / Equipment</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center bg-navy-800">Nairobi (NBO-WH)</th>
                <th className="p-3.5 text-center">Machakos (MCK-RET)</th>
                <th className="p-3.5 text-center bg-navy-800">Kitui (KTU-RET)</th>
                <th className="p-3.5 text-center">Total Available</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.map((row) => (
                <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-50/70">
                  <td className="p-3.5">
                    <div className="font-bold text-navy-900">{row.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {row.sku} • {row.category}
                    </div>
                  </td>
                  <td className="p-3.5 text-right font-semibold">{formatKes(row.selling_price)}</td>
                  {['NBO-WH', 'MCK-RET', 'KTU-RET'].map((code) => {
                    const b = row.branches?.[code] || { on_hand: 0, reserved: 0, available: 0 };
                    return (
                      <td key={code} className="p-3.5 text-center border-l border-slate-100">
                        <span className="font-extrabold text-sm text-navy-900">{b.available}</span>
                        <div className="text-[10px] text-slate-400">
                          On-Hand: {b.on_hand} | Res: {b.reserved}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3.5 text-center font-extrabold text-base text-emerald-700">
                    {row.total_available}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        row.status === 'In Stock' || row.status === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProductId(row.id);
                          setQuantity(row.branches?.['NBO-WH']?.on_hand ?? 10);
                          setActiveAction('adjust');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-navy-900 hover:text-white font-bold text-[11px] transition"
                      >
                        Adjust
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceProductId(row.id);
                          setActiveAction('update_price');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-solar-600 hover:text-white font-bold text-[11px] transition"
                      >
                        Price
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          IMMUTABLE STOCK MOVEMENTS LEDGER (With Branch & Type Filters)
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <History className="w-5 h-5 text-solar-600" /> Recent Immutable Stock Movement Ledger
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Filter Ledger:
            </span>
            <select
              value={movementBranchFilter}
              onChange={(e) => setMovementBranchFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
            >
              <option value="ALL">All Branches</option>
              <option value="NBO-WH">NBO-WH (Nairobi)</option>
              <option value="MCK-RET">MCK-RET (Machakos)</option>
              <option value="KTU-RET">KTU-RET (Kitui)</option>
            </select>
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
            >
              <option value="ALL">All Movement Types</option>
              <option value="stock_in">Stock-In (Supplier PO)</option>
              <option value="sale">Customer Sale</option>
              <option value="transfer_out">Transfer Out</option>
              <option value="transfer_in">Transfer In</option>
              <option value="adjustment">Physical Adjustment</option>
              <option value="damage">Damage Write-off</option>
              <option value="loss">Stock Loss</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 uppercase text-[11px] text-slate-600">
                <th className="p-2.5">Ref #</th>
                <th className="p-2.5">Product</th>
                <th className="p-2.5">Branch</th>
                <th className="p-2.5">Movement Type</th>
                <th className="p-2.5 text-center">Qty Change</th>
                <th className="p-2.5 text-center">Before &rarr; After</th>
                <th className="p-2.5">Reason / Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.slice(0, 15).map((m) => (
                <tr key={m.id} className="border-b border-slate-200 hover:bg-slate-50/70">
                  <td className="p-2.5 font-mono font-bold text-navy-900">{m.reference_number}</td>
                  <td className="p-2.5 font-semibold">{m.product?.name}</td>
                  <td className="p-2.5 font-mono">{m.location?.code}</td>
                  <td className="p-2.5 uppercase font-bold text-engineering-700">
                    {m.movement_type}
                  </td>
                  <td
                    className={`p-2.5 text-center font-extrabold ${
                      Number(m.quantity) >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-500">
                    {m.quantity_before} &rarr; {m.quantity_after}
                  </td>
                  <td className="p-2.5 text-slate-600">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
