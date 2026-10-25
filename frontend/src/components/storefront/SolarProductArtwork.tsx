import React from 'react';

interface Props {
  product: any;
  className?: string;
}

/**
 * Renders a crisp, realistic engineering illustration for each solar product category
 * when an uploaded photo is not present, or renders the uploaded photo.
 */
export const SolarProductArtwork: React.FC<Props> = ({ product, className = 'w-full h-full' }) => {
  if (product?.primary_image) {
    return (
      <img
        src={product.primary_image}
        alt={product.name}
        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  const slug = (product?.category?.slug || product?.slug || '').toLowerCase();
  const sku = (product?.sku || '').toUpperCase();

  // 1. Solar Panel Illustration
  if (slug.includes('panel') || sku.includes('PNL')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 220 160" className="w-40 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
          <defs>
            <linearGradient id="pvCell" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f2942" />
              <stop offset="50%" stopColor="#081a2e" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
            <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          {/* Sun Orb */}
          <circle cx="182" cy="30" r="18" fill="url(#sunGlow)" opacity="0.9" />
          {/* Tilted Monocrystalline Solar Module */}
          <polygon
            points="45,25 165,25 190,140 20,140"
            fill="url(#pvCell)"
            stroke="#cbd5e1"
            strokeWidth="4"
          />
          {/* Cell Grid Lines */}
          <line x1="75" y1="25" x2="62" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
          <line x1="105" y1="25" x2="105" y2="140" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
          <line x1="135" y1="25" x2="148" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
          <line x1="39" y1="53" x2="171" y2="53" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
          <line x1="33" y1="82" x2="177" y2="82" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
          <line x1="27" y1="111" x2="183" y2="111" stroke="#38bdf8" strokeWidth="1" opacity="0.45" />
          {/* Glossy Reflection */}
          <polygon points="50,29 95,29 60,136 25,136" fill="#ffffff" opacity="0.07" />
        </svg>
      </div>
    );
  }

  // 2. Solar Hybrid Inverter Illustration
  if (slug.includes('inverter') || sku.includes('INV')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 160" className="w-36 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
          {/* Chassis */}
          <rect x="45" y="14" width="110" height="132" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
          <rect x="45" y="14" width="110" height="26" rx="8" fill="#080c29" />
          <text x="100" y="31" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            HYBRID MPPT
          </text>
          {/* LCD Display Panel */}
          <rect x="65" y="50" width="70" height="44" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <rect x="72" y="57" width="56" height="24" rx="3" fill="#0284c7" opacity="0.9" />
          <text x="100" y="73" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold" fontFamily="monospace">
            230V 5.0kW
          </text>
          {/* Status LEDs */}
          <circle cx="82" cy="88" r="2.5" fill="#22c55e" />
          <circle cx="100" cy="88" r="2.5" fill="#38bdf8" />
          <circle cx="118" cy="88" r="2.5" fill="#f97316" />
          {/* Bottom Ports */}
          <rect x="62" y="138" width="14" height="8" rx="2" fill="#1e293b" />
          <rect x="93" y="138" width="14" height="8" rx="2" fill="#1e293b" />
          <rect x="124" y="138" width="14" height="8" rx="2" fill="#1e293b" />
        </svg>
      </div>
    );
  }

  // 3. Lithium Battery (LiFePO4) Illustration
  if (slug.includes('batter') || sku.includes('BAT')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 160" className="w-36 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
          <rect x="38" y="18" width="124" height="124" rx="10" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <rect x="46" y="26" width="108" height="108" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          {/* SOC Bar Indicators */}
          <rect x="68" y="42" width="64" height="8" rx="4" fill="#22c55e" />
          <rect x="76" y="56" width="48" height="22" rx="4" fill="#0284c7" />
          <text x="100" y="71" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
            LiFePO4
          </text>
          <text x="100" y="102" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            51.2V 200Ah
          </text>
          <text x="100" y="118" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
            6000+ DEEP CYCLES
          </text>
        </svg>
      </div>
    );
  }

  // 4. Submersible Solar Water Pump Illustration
  if (slug.includes('pump') || sku.includes('PMP')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 160" className="w-36 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
          {/* Stainless Steel Borehole Pump Cylinder */}
          <rect x="55" y="16" width="32" height="128" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <rect x="55" y="45" width="32" height="18" fill="#64748b" />
          <rect x="55" y="95" width="32" height="12" fill="#94a3b8" />
          {/* MPPT Controller Box */}
          <rect x="105" y="46" width="52" height="68" rx="6" fill="#080c29" stroke="#ea580c" strokeWidth="2" />
          <rect x="115" y="58" width="32" height="16" rx="2" fill="#0284c7" />
          <text x="131" y="92" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="bold">
            MPPT DC
          </text>
          <circle cx="131" cy="103" r="4" fill="#22c55e" />
        </svg>
      </div>
    );
  }

  // 5. Solar Streetlight / Floodlight Illustration
  if (slug.includes('light') || sku.includes('LGT')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 220 160" className="w-40 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
          {/* Mounting Arm */}
          <path d="M25,130 L75,85" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          {/* All-In-One Streetlight Body */}
          <polygon points="60,75 185,40 195,62 70,97" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
          {/* LED Array Glow */}
          <polygon points="95,88 185,63 175,125 75,135" fill="#fef08a" opacity="0.35" />
          <rect x="105" y="66" width="65" height="10" rx="3" transform="rotate(-15 105 66)" fill="#facc15" />
        </svg>
      </div>
    );
  }

  // 6. Default / Solar PV Cables & Accessories
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 160" className="w-36 h-32 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
        {/* Red DC Roll */}
        <circle cx="82" cy="82" r="42" fill="none" stroke="#dc2626" strokeWidth="14" />
        <circle cx="82" cy="82" r="20" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
        {/* Black DC Roll */}
        <circle cx="124" cy="82" r="42" fill="none" stroke="#1e293b" strokeWidth="14" />
        <circle cx="124" cy="82" r="20" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />
        <text x="124" y="85" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">
          6mm² PV
        </text>
      </svg>
    </div>
  );
};
