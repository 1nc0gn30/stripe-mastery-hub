export type PaymentRailId =
  | 'us_card'
  | 'intl_card'
  | 'intl_fx_card'
  | 'manual_keyed'
  | 'ach_debit'
  | 'amex_commercial'
  | 'custom';

export interface PaymentRailPreset {
  id: PaymentRailId;
  label: string;
  shortLabel: string;
  percentFee: number; // e.g. 2.9 means 2.9%
  fixedFee: number; // in USD
  feeCap: number | null; // e.g. 5.00 for ACH
  notes: string;
}

export const PAYMENT_RAILS: PaymentRailPreset[] = [
  {
    id: 'us_card',
    label: 'US Domestic Cards & Wallets (Apple/Google Pay, Link)',
    shortLabel: 'US Card',
    percentFee: 2.9,
    fixedFee: 0.3,
    feeCap: null,
    notes: 'Standard US online card pricing: 2.9% + $0.30 per successful charge.',
  },
  {
    id: 'intl_card',
    label: 'International Card (+1.5% cross-border)',
    shortLabel: 'Intl Card',
    percentFee: 4.4,
    fixedFee: 0.3,
    feeCap: null,
    notes: '2.9% + $0.30 base plus +1.5% for cards issued outside the US.',
  },
  {
    id: 'intl_fx_card',
    label: 'International Card + Currency Conversion (+2.5%)',
    shortLabel: 'Intl + FX',
    percentFee: 5.4,
    fixedFee: 0.3,
    feeCap: null,
    notes: '2.9% + $0.30 base plus +1.5% international and +1.0% FX conversion.',
  },
  {
    id: 'manual_keyed',
    label: 'Manually Entered / MOTO Card (+0.5%)',
    shortLabel: 'MOTO',
    percentFee: 3.4,
    fixedFee: 0.3,
    feeCap: null,
    notes: 'Card details entered manually in Dashboard or via Virtual Terminal.',
  },
  {
    id: 'ach_debit',
    label: 'ACH Direct Debit (0.8%, $5.00 cap)',
    shortLabel: 'ACH Debit',
    percentFee: 0.8,
    fixedFee: 0,
    feeCap: 5.0,
    notes: 'US bank debits capped at $5.00 per transaction—ideal for B2B invoices > $625.',
  },
  {
    id: 'amex_commercial',
    label: 'Amex / Corporate Card (Standard US)',
    shortLabel: 'AMEX',
    percentFee: 2.9,
    fixedFee: 0.3,
    feeCap: null,
    notes: 'Flat-rate Stripe US accounts process Amex at standard 2.9% + $0.30 (IC+ varies).',
  },
  {
    id: 'custom',
    label: 'Custom Negotiated Rate (IC+ / Enterprise)',
    shortLabel: 'Custom',
    percentFee: 2.4,
    fixedFee: 0.25,
    feeCap: null,
    notes: 'Enter your negotiated custom volume rate and fixed per-transaction fee.',
  },
];

export interface FeeCalculationInput {
  amount: number; // Either Gross Charge (standard) or Desired Net Payout (reverse)
  mode: 'standard' | 'target_net';
  railId: PaymentRailId;
  customPercentFee?: number;
  customFixedFee?: number;
  includeBilling?: boolean; // +0.7%
  includeTax?: boolean; // +0.5%
  includeInvoicing?: boolean; // +0.4%
  platformFeePercent?: number; // Connect application fee %
  monthlyTransactions?: number;
}

export interface FeeCalculationResult {
  grossAmount: number;
  stripeBaseFee: number;
  addOnFee: number;
  totalStripeFee: number;
  platformFee: number;
  totalFees: number;
  netPayout: number;
  effectiveFeePercent: number;
  netMarginPercent: number;
  capApplied: boolean;
  monthlyGross: number;
  monthlyTotalFees: number;
  monthlyNet: number;
  annualTotalFees: number;
}

function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateStripeFees(input: FeeCalculationInput): FeeCalculationResult {
  const rail = PAYMENT_RAILS.find((r) => r.id === input.railId) ?? PAYMENT_RAILS[0];
  const basePercent =
    input.railId === 'custom' && typeof input.customPercentFee === 'number'
      ? Math.max(0, input.customPercentFee)
      : rail.percentFee;
  const fixedFee =
    input.railId === 'custom' && typeof input.customFixedFee === 'number'
      ? Math.max(0, input.customFixedFee)
      : rail.fixedFee;

  const addOnPercent =
    (input.includeBilling ? 0.7 : 0) +
    (input.includeTax ? 0.5 : 0) +
    (input.includeInvoicing ? 0.4 : 0);

  const platformPercent = Math.max(0, input.platformFeePercent ?? 0);
  const safeAmount = Math.max(0, Number.isFinite(input.amount) ? input.amount : 0);
  const txCount = Math.max(1, Math.round(input.monthlyTransactions ?? 100));

  if (safeAmount === 0) {
    return {
      grossAmount: 0,
      stripeBaseFee: 0,
      addOnFee: 0,
      totalStripeFee: 0,
      platformFee: 0,
      totalFees: 0,
      netPayout: 0,
      effectiveFeePercent: 0,
      netMarginPercent: 0,
      capApplied: false,
      monthlyGross: 0,
      monthlyTotalFees: 0,
      monthlyNet: 0,
      annualTotalFees: 0,
    };
  }

  const baseRate = basePercent / 100;
  const addOnRate = addOnPercent / 100;
  const platformRate = platformPercent / 100;

  let grossAmount = safeAmount;

  if (input.mode === 'target_net') {
    const combinedRate = baseRate + addOnRate + platformRate;
    const denom = Math.max(0.01, 1 - combinedRate);
    const uncappedGross = (safeAmount + fixedFee) / denom;

    if (rail.feeCap !== null) {
      const baseFeeAtUncapped = uncappedGross * baseRate + fixedFee;
      if (baseFeeAtUncapped > rail.feeCap) {
        const denomCapped = Math.max(0.01, 1 - addOnRate - platformRate);
        grossAmount = (safeAmount + rail.feeCap) / denomCapped;
      } else {
        grossAmount = uncappedGross;
      }
    } else {
      grossAmount = uncappedGross;
    }
    grossAmount = roundCents(grossAmount);
  }

  const rawBaseFee = grossAmount * baseRate + fixedFee;
  const capApplied = rail.feeCap !== null && rawBaseFee > rail.feeCap;
  const stripeBaseFee = roundCents(capApplied && rail.feeCap !== null ? rail.feeCap : rawBaseFee);
  const addOnFee = roundCents(grossAmount * addOnRate);
  const totalStripeFee = roundCents(stripeBaseFee + addOnFee);
  const platformFee = roundCents(grossAmount * platformRate);
  const totalFees = roundCents(totalStripeFee + platformFee);
  const netPayout = roundCents(Math.max(0, grossAmount - totalFees));

  const effectiveFeePercent = grossAmount > 0 ? roundCents((totalFees / grossAmount) * 100) : 0;
  const netMarginPercent = grossAmount > 0 ? roundCents((netPayout / grossAmount) * 100) : 0;

  const monthlyGross = roundCents(grossAmount * txCount);
  const monthlyTotalFees = roundCents(totalFees * txCount);
  const monthlyNet = roundCents(netPayout * txCount);
  const annualTotalFees = roundCents(monthlyTotalFees * 12);

  return {
    grossAmount,
    stripeBaseFee,
    addOnFee,
    totalStripeFee,
    platformFee,
    totalFees,
    netPayout,
    effectiveFeePercent,
    netMarginPercent,
    capApplied,
    monthlyGross,
    monthlyTotalFees,
    monthlyNet,
    annualTotalFees,
  };
}
