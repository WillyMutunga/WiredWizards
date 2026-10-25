import React from 'react';
import { ShieldCheck, Receipt } from 'lucide-react';

interface Props {
  isVatable?: boolean;
  vatRate?: number;
  vatStatus?: string;
  size?: 'sm' | 'md';
}

export const VatStatusBadge: React.FC<Props> = ({
  isVatable,
  vatRate = 16,
  vatStatus,
  size = 'sm',
}) => {
  const taxable = Boolean(isVatable);
  const label = vatStatus || (taxable ? `VATable (${vatRate}%)` : 'VAT Exempt (Non-VAT)');
  const padding = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  if (taxable) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${padding}`}
        title="Standard 16% VAT applies to this item and will be itemized on your tax invoice and receipt"
      >
        <Receipt className="w-3 h-3 text-amber-600 shrink-0" />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 ${padding}`}
      title="Zero/Exempt VAT solar equipment — 0% VAT charged at checkout and receipting"
    >
      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
      {label}
    </span>
  );
};
