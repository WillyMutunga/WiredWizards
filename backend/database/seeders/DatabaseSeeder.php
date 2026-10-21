<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Models\Location;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\SystemSetting;
use App\Models\Supplier;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. System Settings
        $settings = [
            'company_name' => 'Wired Wizards Engineering and General Supplies Ltd',
            'company_tagline' => 'Powering the Future with Reliable Solar Energy',
            'kra_pin' => 'P051982736Z',
            'vat_rate' => '16',
            'mpesa_till' => '543210',
            'bank_name' => 'KCB Bank Kenya',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Wired Wizards Engineering Ltd',
            'contact_phone' => '+254 712 345 678',
            'contact_email' => 'info@wiredwizards.co.ke',
            'office_address' => 'Machakos Town & Nairobi CBD, Kenya',
        ];

        foreach ($settings as $key => $val) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 2. Locations
        $nairobiWh = Location::create([
            'name' => 'Nairobi Warehouse',
            'code' => 'NBO-WH',
            'location_type' => 'warehouse',
            'county' => 'Nairobi',
            'town' => 'Industrial Area',
            'address' => 'Enterprise Road, Nairobi',
            'phone' => '+254 711 000 001',
            'is_active' => true,
        ]);

        $machakosStore = Location::create([
            'name' => 'Machakos Store',
            'code' => 'MCK-RET',
            'location_type' => 'retail_store',
            'county' => 'Machakos',
            'town' => 'Machakos Town',
            'address' => 'Mwatu Wa Ngoma Street, Machakos',
            'phone' => '+254 711 000 002',
            'is_active' => true,
        ]);

        $kituiStore = Location::create([
            'name' => 'Kitui Store',
            'code' => 'KTU-RET',
            'location_type' => 'retail_store',
            'county' => 'Kitui',
            'town' => 'Kitui Town',
            'address' => 'Commercial Street, Kitui',
            'phone' => '+254 711 000 003',
            'is_active' => true,
        ]);

        // 3. User Accounts (Super Admin, Inventory Manager, Sales Agent, Customer)
        $superAdmin = User::create([
            'name' => 'Willy Mutunga (Director)',
            'email' => 'admin@wiredwizards.co.ke',
            'phone' => '+254700000001',
            'password' => Hash::make('Admin@2026'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $invManager = User::create([
            'name' => 'Kennedy M. (Inventory Lead)',
            'email' => 'inventory@wiredwizards.co.ke',
            'phone' => '+254700000002',
            'password' => Hash::make('Inventory@2026'),
            'role' => 'inventory_manager',
            'is_active' => true,
        ]);

        $salesAgent = User::create([
            'name' => 'Mary Ndunge (Sales Executive)',
            'email' => 'sales@wiredwizards.co.ke',
            'phone' => '+254700000003',
            'password' => Hash::make('Sales@2026'),
            'role' => 'sales_agent',
            'is_active' => true,
        ]);

        $customer = User::create([
            'name' => 'Peter Kioko',
            'email' => 'peter@example.com',
            'phone' => '+254722334455',
            'password' => Hash::make('Customer@2026'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        CustomerProfile::create([
            'user_id' => $customer->id,
            'company_name' => 'Kioko Farms Ltd',
            'kra_pin' => 'A009876543M',
            'customer_type' => 'business',
            'loyalty_points' => 150,
        ]);

        CustomerAddress::create([
            'user_id' => $customer->id,
            'label' => 'Farm Installation Site',
            'county' => 'Machakos',
            'town' => 'Kathiani',
            'physical_details' => 'Opposite AIC Church, Farm Gate 3',
            'is_default' => true,
        ]);

        // 4. Suppliers
        $supplier = Supplier::create([
            'name' => 'Solar Master Distribution Ltd',
            'contact_person' => 'David Kimani',
            'phone' => '+254 720 123 456',
            'email' => 'orders@solarmaster.co.ke',
            'address' => 'Mombasa Road, Nairobi',
            'payment_terms' => '30 Days Net',
        ]);

        // 5. Brands
        $brands = [
            'Jinko Solar' => Brand::create(['name' => 'Jinko Solar', 'slug' => 'jinko-solar']),
            'Growatt' => Brand::create(['name' => 'Growatt', 'slug' => 'growatt']),
            'Felicity Solar' => Brand::create(['name' => 'Felicity Solar', 'slug' => 'felicity-solar']),
            'Deye' => Brand::create(['name' => 'Deye', 'slug' => 'deye']),
            'Must Energy' => Brand::create(['name' => 'Must Energy', 'slug' => 'must-energy']),
        ];

        // 6. Categories
        $catPanels = Category::create(['name' => 'Solar Panels', 'slug' => 'solar-panels', 'description' => 'High-efficiency Monocrystalline & Polycrystalline PV panels']);
        $catInverters = Category::create(['name' => 'Solar Inverters', 'slug' => 'solar-inverters', 'description' => 'Pure Sine Wave Off-Grid and Hybrid Inverters']);
        $catBatteries = Category::create(['name' => 'Solar Batteries', 'slug' => 'solar-batteries', 'description' => 'Long-life Lithium-ion (LiFePO4) & Gel Deep Cycle Batteries']);
        $catPumps = Category::create(['name' => 'Solar Water Pumps', 'slug' => 'solar-water-pumps', 'description' => 'Submersible and surface solar pumps for irrigation & domestic use']);
        $catLights = Category::create(['name' => 'Solar Lighting & Floodlights', 'slug' => 'solar-lighting', 'description' => 'All-in-one solar streetlights and security lighting']);
        $catAccessories = Category::create(['name' => 'Accessories & Cables', 'slug' => 'accessories-and-cables', 'description' => 'MC4 connectors, 4mm-16mm PV cables, breakers & mounting brackets']);

        // 7. Core Solar Products (with JSONB technical specs)
        $productsData = [
            [
                'category_id' => $catPanels->id,
                'brand_id' => $brands['Jinko Solar']->id,
                'sku' => 'SOL-PNL-550-MONO-01',
                'barcode' => '789123456001',
                'name' => 'Jinko 550W Tiger Neo N-Type Monocrystalline Solar Panel',
                'slug' => 'jinko-550w-tiger-neo-solar-panel',
                'short_description' => 'Tier 1 high-efficiency solar panel with multi-busbar technology.',
                'description' => 'The Jinko 550W N-type panel offers up to 22.3% module efficiency with superior low-light performance. Designed to withstand extreme wind and snow loads with a 12-year product warranty and 30-year linear power warranty.',
                'buying_price' => 12500.00,
                'selling_price' => 16500.00,
                'discount_price' => 15500.00,
                'warranty_period' => '12 Years',
                'min_stock_alert' => 10,
                'is_featured' => true,
                'technical_specs' => [
                    'rated_power' => '550W',
                    'cell_type' => 'Monocrystalline N-Type',
                    'max_power_voltage_vmp' => '42.22V',
                    'max_power_current_imp' => '13.03A',
                    'open_circuit_voltage_voc' => '50.42V',
                    'efficiency' => '22.3%',
                    'dimensions' => '2278 x 1134 x 35 mm',
                    'weight' => '28.0 kg',
                ],
                'stock' => ['nbo' => 80, 'mck' => 25, 'ktu' => 15],
            ],
            [
                'category_id' => $catInverters->id,
                'brand_id' => $brands['Growatt']->id,
                'sku' => 'SOL-INV-5KW-SPF-01',
                'barcode' => '789123456002',
                'name' => 'Growatt 5kW 48V Off-Grid Solar Inverter SPF 5000 ES',
                'slug' => 'growatt-5kw-48v-off-grid-solar-inverter',
                'short_description' => 'Multifunctional pure sine wave inverter with integrated MPPT charge controller.',
                'description' => 'The Growatt SPF 5000 ES can operate with or without batteries. Maximum PV input voltage up to 450VDC. Supports parallel operation up to 6 units for large capacity.',
                'buying_price' => 68000.00,
                'selling_price' => 88000.00,
                'discount_price' => 84000.00,
                'warranty_period' => '2 Years',
                'min_stock_alert' => 4,
                'is_featured' => true,
                'technical_specs' => [
                    'rated_power' => '5000W / 5kVA',
                    'battery_voltage' => '48VDC',
                    'mppt_tracker_voltage' => '120VDC - 430VDC',
                    'max_pv_power' => '6000W',
                    'surge_power' => '10000VA',
                    'waveform' => 'Pure Sine Wave',
                    'parallel_capability' => 'Yes, up to 6 units',
                ],
                'stock' => ['nbo' => 15, 'mck' => 6, 'ktu' => 3],
            ],
            [
                'category_id' => $catBatteries->id,
                'brand_id' => $brands['Felicity Solar']->id,
                'sku' => 'SOL-BAT-10KWH-LITH-01',
                'barcode' => '789123456003',
                'name' => 'Felicity Solar 10kWh 48V 200Ah Wall-Mounted Lithium Battery (LiFePO4)',
                'slug' => 'felicity-10kwh-48v-lithium-battery',
                'short_description' => 'Grade A LiFePO4 cells with built-in smart BMS and LCD screen.',
                'description' => 'Engineered for over 6,000 cycles at 80% DoD. Compatible with top inverter brands including Growatt, Deye, and Must. Wall-mounted space saving form factor.',
                'buying_price' => 195000.00,
                'selling_price' => 245000.00,
                'discount_price' => 235000.00,
                'warranty_period' => '5 Years',
                'min_stock_alert' => 2,
                'is_featured' => true,
                'technical_specs' => [
                    'usable_capacity' => '10.24 kWh',
                    'nominal_voltage' => '51.2V',
                    'rated_capacity' => '200Ah',
                    'cell_technology' => 'Lithium Iron Phosphate (LiFePO4)',
                    'cycle_life' => '> 6000 cycles @ 25°C',
                    'bms_communication' => 'CAN / RS485',
                    'weight' => '85 kg',
                ],
                'stock' => ['nbo' => 8, 'mck' => 3, 'ktu' => 2],
            ],
            [
                'category_id' => $catPumps->id,
                'brand_id' => $brands['Must Energy']->id,
                'sku' => 'SOL-PMP-1.5HP-SUB-01',
                'barcode' => '789123456004',
                'name' => '1.5HP DC Brushless Solar Submersible Water Pump Set',
                'slug' => '1-5hp-dc-brushless-solar-submersible-pump',
                'short_description' => 'Complete borehole pumping kit with MPPT solar pump controller.',
                'description' => 'High-head DC brushless submersible pump with stainless steel housing. Max head 110m, maximum discharge 4.5 cubic meters per hour.',
                'buying_price' => 42000.00,
                'selling_price' => 58000.00,
                'discount_price' => 55000.00,
                'warranty_period' => '2 Years',
                'min_stock_alert' => 3,
                'is_featured' => false,
                'technical_specs' => [
                    'power_rating' => '1.5 HP (1100W)',
                    'voltage' => '110V DC',
                    'max_head' => '110 meters',
                    'max_flow' => '4,500 L/hour',
                    'outlet_size' => '1.25 inch',
                    'controller' => 'Smart MPPT Controller with water level sensors',
                ],
                'stock' => ['nbo' => 12, 'mck' => 5, 'ktu' => 2],
            ],
            [
                'category_id' => $catLights->id,
                'brand_id' => $brands['Felicity Solar']->id,
                'sku' => 'SOL-LGT-300W-STREET-01',
                'barcode' => '789123456005',
                'name' => '300W All-In-One Solar Street Light with Motion Sensor & Remote',
                'slug' => '300w-all-in-one-solar-street-light',
                'short_description' => 'High-lumen outdoor security streetlight with radar motion sensor.',
                'description' => 'IP67 waterproof aluminum alloy body, high brightness 5730 LED beads, dusk-to-dawn operation with remote control and pole mounting hardware.',
                'buying_price' => 5500.00,
                'selling_price' => 8500.00,
                'discount_price' => 7800.00,
                'warranty_period' => '2 Years',
                'min_stock_alert' => 15,
                'is_featured' => true,
                'technical_specs' => [
                    'lumens' => '3000 LM',
                    'battery' => '3.2V 36Ah LiFePO4',
                    'solar_panel' => '6V 35W Monocrystalline',
                    'charging_time' => '6-8 hours sunlight',
                    'lighting_time' => '12-14 hours (continuous)',
                    'sensor_range' => '8-12 meters radar',
                ],
                'stock' => ['nbo' => 100, 'mck' => 40, 'ktu' => 20],
            ],
            [
                'category_id' => $catAccessories->id,
                'brand_id' => $brands['Must Energy']->id,
                'sku' => 'SOL-ACC-6MM-CBL-100M',
                'barcode' => '789123456006',
                'name' => 'Solar PV Double-Insulated Copper Cable 6mm² (100 Meter Roll)',
                'slug' => 'solar-pv-cable-6mm-100m-roll',
                'short_description' => 'TUV certified red & black double insulated solar wire.',
                'description' => 'Flame retardant, UV resistant, halogen-free cross-linked polyethylene insulation specifically formulated for rooftop solar arrays and outdoor DC strings.',
                'buying_price' => 7800.00,
                'selling_price' => 11000.00,
                'discount_price' => 10500.00,
                'warranty_period' => '5 Years',
                'min_stock_alert' => 20,
                'is_featured' => false,
                'technical_specs' => [
                    'cross_section' => '6.0 mm²',
                    'conductor' => 'Tinned Copper Multi-strand',
                    'voltage_rating' => '1500V DC',
                    'temperature_range' => '-40°C to +90°C',
                    'roll_length' => '100 meters',
                ],
                'stock' => ['nbo' => 50, 'mck' => 15, 'ktu' => 10],
            ],
        ];

        foreach ($productsData as $data) {
            $stockData = $data['stock'];
            unset($data['stock']);

            $product = Product::create($data);

            // Seed inventory records per location
            $locationsMap = [
                $nairobiWh->id => $stockData['nbo'],
                $machakosStore->id => $stockData['mck'],
                $kituiStore->id => $stockData['ktu'],
            ];

            foreach ($locationsMap as $locId => $qty) {
                Inventory::create([
                    'product_id' => $product->id,
                    'location_id' => $locId,
                    'quantity_on_hand' => $qty,
                    'quantity_reserved' => 0,
                ]);

                // Initial Stock In Movement Record
                StockMovement::create([
                    'product_id' => $product->id,
                    'location_id' => $locId,
                    'user_id' => $superAdmin->id,
                    'movement_type' => 'stock_in',
                    'quantity' => $qty,
                    'quantity_before' => 0,
                    'quantity_after' => $qty,
                    'reference_number' => 'INIT-2026-STOCK',
                    'reason' => 'Initial Inventory Setup',
                ]);
            }
        }
    }
}
