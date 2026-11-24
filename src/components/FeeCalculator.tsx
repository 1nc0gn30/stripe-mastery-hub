import React, { useMemo, useState } from 'react';
import { Calculator, ArrowLeftRight, TrendingUp } from 'lucide-react';
import {
  PAYMENT_RAILS,
  PaymentRailId,
  calculateStripeFees,
} from '../lib/feeCalculator';
import { cn } from '../lib/utils';

const fmtUsd = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function FeeCalculator() {
  const [mode, setMode] = useState<'standard' | 'target_net'>('standard');
  const [amount, setAmount] = useState<number>(100);
  const [railId, setRailId] = useState<PaymentRailId>('us_card');
  const [customPercent, setCustomPercent] = useState<number>(2.4);
  const [customFixed, setCustomFixed] = useState<number>(0.25);
  const [includeBilling, setIncludeBilling] = useState(false);
  const [includeTax, setIncludeTax] = useState(false);
  const [includeInvoicing, setIncludeInvoicing] = useState(false);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(0);
  const [monthlyTransactions, setMonthlyTransactions] = useState<number>(250);

  const selectedRail = PAYMENT_RAILS.find((r) => r.id === railId) ?? PAYMENT_RAILS[0];

  const calc = useMemo(
    () =>
      calculateStripeFees({
        amount,
        mode,
        railId,
        customPercentFee: customPercent,
        customFixedFee: customFixed,
        includeBilling,
        includeTax,
        includeInvoicing,
        platformFeePercent,
        monthlyTransactions,
      }),
    [
      amount,
      mode,
      railId,
      customPercent,
      customFixed,
      includeBilling,
      includeTax,
      includeInvoicing,
      platformFeePercent,
      monthlyTransactions,
    ]
  );

  const achComparison = useMemo(
    () =>
      calculateStripeFees({
        amount: calc.grossAmount,
        mode: 'standard',
        railId: 'ach_debit',
        includeBilling,
        includeTax,
        includeInvoicing,
        platformFeePercent,
        monthlyTransactions,
      }),
    [calc.grossAmount, includeBilling, includeTax, includeInvoicing, platformFeePercent, monthlyTransactions]
  );

  const achSavingsPerTx = Math.max(0, calc.totalStripeFee - achComparison.totalStripeFee);

  return (
    <section id="fee-calc" className="border-b border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              03 / UNIT ECONOMICS
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Stripe Processing Fee &amp; Net Margin Calculator
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Model domestic cards, international FX surcharges, ACH $5 caps, Billing/Tax add-ons, Connect platform splits, and exact reverse gross-up pricing.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-bg p-1" role="group" aria-label="Calculation mode">
            <button
              type="button"
              onClick={() => setMode('standard')}
              className={cn(
                'min-h-[40px] rounded-lg px-3.5 text-xs font-semibold transition-colors',
                mode === 'standard' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              )}
            >
              Charge → Net Payout
            </button>
            <button
              type="button"
              onClick={() => setMode('target_net')}
              className={cn(
                'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors',
                mode === 'target_net' ? 'bg-white text-ink shadow-xs' : 'text-muted hover:text-ink'
              )}
            >
              <ArrowLeftRight size={13} aria-hidden="true" />
              Target Net → Gross Price
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Controls */}
          <div className="rounded-2xl border border-border bg-bg p-5 sm:p-6 lg:col-span-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fee-amount" className="block text-xs font-semibold text-ink">
                  {mode === 'standard' ? 'Gross Charge Amount (USD)' : 'Desired Net Payout (USD)'}
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
                    $
                  </span>
                  <input
                    id="fee-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="h-11 w-full rounded-lg border border-border bg-white pl-7 pr-3 font-mono text-sm font-semibold text-ink focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[19, 49, 100, 500, 2500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className="rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-ink"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="fee-volume" className="block text-xs font-semibold text-ink">
                  Monthly Transactions
                </label>
                <input
                  id="fee-volume"
                  type="number"
                  min={1}
                  value={monthlyTransactions}
                  onChange={(e) => setMonthlyTransactions(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 font-mono text-sm font-semibold text-ink focus:border-accent focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[50, 250, 1000, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMonthlyTransactions(v)}
                      className="rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-ink"
                    >
                      {v}/mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Rail Selector */}
            <div className="mt-5">
              <span className="block text-xs font-semibold text-ink">Payment Rail</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PAYMENT_RAILS.map((rail) => (
                  <button
                    key={rail.id}
                    type="button"
                    onClick={() => setRailId(rail.id)}
                    className={cn(
                      'flex min-h-[44px] flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors',
                      railId === rail.id
                        ? 'border-accent bg-accent/5 text-ink'
                        : 'border-border bg-white text-muted hover:border-accent/40 hover:text-ink'
                    )}
                  >
                    <span className="text-xs font-semibold text-ink">{rail.shortLabel}</span>
                    <span className="font-mono text-[11px] text-muted">
                      {rail.percentFee}%{rail.fixedFee > 0 ? ` + $${rail.fixedFee.toFixed(2)}` : ''}
                      {rail.feeCap ? ` (cap $${rail.feeCap})` : ''}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{selectedRail.notes}</p>
            </div>

            {railId === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-accent/25 bg-white p-3.5">
                <div>
                  <label htmlFor="custom-pct" className="block text-xs font-semibold text-ink">
                    Custom Rate (%)
                  </label>
                  <input
                    id="custom-pct"
                    type="number"
                    step="0.05"
                    min={0}
                    value={customPercent}
                    onChange={(e) => setCustomPercent(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="custom-fixed" className="block text-xs font-semibold text-ink">
                    Fixed Fee ($)
                  </label>
                  <input
                    id="custom-fixed"
                    type="number"
                    step="0.01"
                    min={0}
                    value={customFixed}
                    onChange={(e) => setCustomFixed(Math.max(0, Number(e.target.value) || 0))}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink"
                  />
                </div>
              </div>
            )}

            {/* Stripe Product Add-ons & Connect Fee */}
            <div className="mt-5 border-t border-border pt-4">
              <span className="block text-xs font-semibold text-ink">
                Optional Stripe Add-Ons &amp; Connect Application Fee
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  {
                    label: 'Stripe Billing (+0.7%)',
                    checked: includeBilling,
                    toggle: () => setIncludeBilling((v) => !v),
                  },
                  {
                    label: 'Stripe Tax (+0.5%)',
                    checked: includeTax,
                    toggle: () => setIncludeTax((v) => !v),
                  },
                  {
                    label: 'Invoicing Plus (+0.4%)',
                    checked: includeInvoicing,
                    toggle: () => setIncludeInvoicing((v) => !v),
                  },
                ].map((addon) => (
                  <button
                    key={addon.label}
                    type="button"
                    aria-pressed={addon.checked}
                    onClick={addon.toggle}
                    className={cn(
                      'min-h-[40px] rounded-lg border px-3 text-xs font-semibold transition-colors',
                      addon.checked
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-white text-muted hover:text-ink'
                    )}
                  >
                    {addon.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="connect-fee-range" className="font-semibold text-ink">
                    Connect Platform Fee (Marketplace split)
                  </label>
                  <span className="font-mono font-semibold text-accent">
                    {platformFeePercent.toFixed(1)}%
                  </span>
                </div>
                <input
                  id="connect-fee-range"
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                  className="mt-2 w-full accent-accent"
                />
              </div>
            </div>
          </div>

          {/* Right Live Breakdown */}
          <div className="flex flex-col gap-5 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-console p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Calculator size={14} className="text-accent" aria-hidden="true" />
                  Per-Transaction Settlement
                </span>
                {calc.capApplied && (
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
                    $5.00 ACH Cap Applied
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="font-mono text-[11px] uppercase text-slate-400">
                    {mode === 'target_net' ? 'Charge Customer' : 'Gross Charge'}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                    {fmtUsd(calc.grossAmount)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="font-mono text-[11px] uppercase text-slate-400">Total Fees</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-rose-300 tabular-nums">
                    -{fmtUsd(calc.totalFees)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {calc.effectiveFeePercent.toFixed(2)}% effective
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="font-mono text-[11px] uppercase text-emerald-300">Net Payout</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                    {fmtUsd(calc.netPayout)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-emerald-200/80">
                    {calc.netMarginPercent.toFixed(2)}% retained
                  </p>
                </div>
              </div>

              {/* Margin Split Bar */}
              <div className="mt-5">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="bg-emerald-400 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, calc.netMarginPercent))}%` }}
                  />
                  <div
                    className="bg-accent transition-all"
                    style={{
                      width: `${
                        calc.grossAmount > 0
                          ? Math.min(100, (calc.totalStripeFee / calc.grossAmount) * 100)
                          : 0
                      }%`,
                    }}
                  />
                  {calc.platformFee > 0 && (
                    <div
                      className="bg-amber-400 transition-all"
                      style={{
                        width: `${
                          calc.grossAmount > 0
                            ? Math.min(100, (calc.platformFee / calc.grossAmount) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  )}
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Stripe base rail fee</span>
                    <span className="tabular-nums">{fmtUsd(calc.stripeBaseFee)}</span>
                  </div>
                  {calc.addOnFee > 0 && (
                    <div className="flex justify-between">
                      <span>Stripe Billing / Tax / Invoicing</span>
                      <span className="tabular-nums">{fmtUsd(calc.addOnFee)}</span>
                    </div>
                  )}
                  {calc.platformFee > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Connect platform application fee</span>
                      <span className="tabular-nums">{fmtUsd(calc.platformFee)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Volume & ACH Optimization Callout */}
            <div className="rounded-2xl border border-border bg-bg p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                <TrendingUp size={15} className="text-accent" aria-hidden="true" />
                Volume Projection ({monthlyTransactions.toLocaleString()} tx / month)
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white p-3.5">
                  <p className="text-xs text-muted">Monthly Gross</p>
                  <p className="mt-1 font-mono text-base font-bold text-ink tabular-nums">
                    {fmtUsd(calc.monthlyGross)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-3.5">
                  <p className="text-xs text-muted">Monthly Fees</p>
                  <p className="mt-1 font-mono text-base font-bold text-rose-700 tabular-nums">
                    {fmtUsd(calc.monthlyTotalFees)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-3.5">
                  <p className="text-xs text-muted">Annual Fee Cost</p>
                  <p className="mt-1 font-mono text-base font-bold text-ink tabular-nums">
                    {fmtUsd(calc.annualTotalFees)}
                  </p>
                </div>
              </div>

              {railId !== 'ach_debit' && achSavingsPerTx > 0.5 && (
                <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 p-3.5 text-xs text-ink">
                  <strong>B2B Rail Tip:</strong> Offering ACH Direct Debit on a{' '}
                  <span className="font-mono font-semibold">{fmtUsd(calc.grossAmount)}</span> invoice saves{' '}
                  <span className="font-mono font-semibold text-accent">{fmtUsd(achSavingsPerTx)}</span> per transaction (
                  <span className="font-mono font-semibold">
                    {fmtUsd(achSavingsPerTx * monthlyTransactions * 12)}/yr
                  </span>
                  ) due to the $5.00 ACH cap.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
