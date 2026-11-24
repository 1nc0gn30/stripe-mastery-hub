import React, { useEffect, useState } from 'react';
import { Check, CheckSquare, Copy, KeyRound, RotateCcw, Square } from 'lucide-react';
import { ChecklistItem, READINESS_CHECKLIST } from '../data/guides';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'stripe-mastery-hub:checklist:v2';
const CATEGORIES: Array<'All' | ChecklistItem['category']> = [
  'All',
  'Idempotency',
  'Webhooks',
  'Security',
  'Go-Live',
];

function createIdempotencyKey(scope: string): string {
  const randomPart =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  const cleanScope = scope.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'charge';
  return `idem_${cleanScope}_${randomPart}`;
}

export function ReadinessChecklist() {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState<'All' | ChecklistItem['category']>('All');
  const [idemScope, setIdemScope] = useState('checkout_ord_481');
  const [idemKey, setIdemKey] = useState(() => createIdempotencyKey('checkout_ord_481'));
  const [copiedIdem, setCopiedIdem] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filtered =
    activeCategory === 'All'
      ? READINESS_CHECKLIST
      : READINESS_CHECKLIST.filter((item) => item.category === activeCategory);

  const completedCount = checkedIds.length;
  const totalCount = READINESS_CHECKLIST.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const handleRegenerateIdem = () => {
    setIdemKey(createIdempotencyKey(idemScope));
  };

  const handleCopyIdem = async () => {
    await navigator.clipboard.writeText(idemKey);
    setCopiedIdem(true);
    setTimeout(() => setCopiedIdem(false), 1800);
  };

  return (
    <section id="checklist" className="border-b border-border bg-bg py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              04 / PRODUCTION READINESS
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Idempotency, Webhook &amp; Go-Live Checklist
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Track launch invariants locally in your browser before flipping from <code className="font-mono text-xs text-ink">sk_test_</code> to <code className="font-mono text-xs text-ink">sk_live_</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-white px-4 py-2 text-right">
              <p className="font-mono text-xs font-bold text-ink tabular-nums">
                {completedCount} / {totalCount} ({progressPct}%)
              </p>
              <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => setCheckedIds([])}
                className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-muted hover:text-ink"
              >
                <RotateCcw size={14} aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Live Idempotency Key Generator Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent">
              <KeyRound size={14} aria-hidden="true" />
              Idempotency-Key Builder
            </span>
            <label htmlFor="idem-scope" className="sr-only">
              Idempotency key scope
            </label>
            <input
              id="idem-scope"
              type="text"
              value={idemScope}
              onChange={(e) => {
                setIdemScope(e.target.value);
                setIdemKey(createIdempotencyKey(e.target.value));
              }}
              className="h-9 w-44 rounded-lg border border-border bg-bg px-2.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
            />
            <code className="rounded-lg border border-border bg-bg px-3 py-1.5 font-mono text-xs text-ink">
              {idemKey}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateIdem}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-bg px-3 text-xs font-semibold text-ink hover:border-accent"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleCopyIdem}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-xs font-semibold text-white hover:bg-ink/90"
            >
              {copiedIdem ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copiedIdem ? 'Copied' : 'Copy Key'}
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'min-h-[40px] rounded-lg border px-3.5 text-xs font-semibold transition-colors',
                activeCategory === cat
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-white text-muted hover:text-ink'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((item) => {
            const done = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={done}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all',
                  done
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-border bg-white hover:border-accent/40'
                )}
              >
                <span className="mt-0.5 shrink-0 text-accent">
                  {done ? (
                    <CheckSquare size={18} className="text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Square size={18} className="text-muted" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        done ? 'text-emerald-950 line-through' : 'text-ink'
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="rounded bg-bg px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-muted">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
