import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Code2, Search, Wrench, X } from 'lucide-react';
import { CODE_GUIDES } from '../data/guides';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuide: (guideId: string) => void;
  onJumpSection: (sectionId: string) => void;
}

const TOOL_ITEMS = [
  {
    id: 'architect',
    title: 'Payment Flow & Architecture Generator',
    description: 'Checkout, Subscriptions, Usage Metering, Connect, Webhooks in Node/Python/Go/Next.js',
  },
  {
    id: 'webhook-lab',
    title: 'Webhook HMAC-SHA256 Simulator & Verifier',
    description: 'Sign and verify Stripe-Signature headers locally using Web Crypto API',
  },
  {
    id: 'fee-calc',
    title: 'Stripe Processing Fee & Net Margin Calculator',
    description: 'Cards, international FX, ACH $5 cap, Billing/Tax add-ons, reverse net gross-up',
  },
  {
    id: 'checklist',
    title: 'Idempotency & Go-Live Checklist',
    description: 'Interactive launch checklist + Idempotency-Key generator',
  },
];

export function SearchModal({
  isOpen,
  onClose,
  onSelectGuide,
  onJumpSection,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const matchingTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOL_ITEMS;
    return TOOL_ITEMS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [query]);

  const matchingGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CODE_GUIDES.slice(0, 5);
    return CODE_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/60 p-4 pt-16 backdrop-blur-xs sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search tools and Stripe guides"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, HMAC webhooks, fee calculator, Connect, subscriptions..."
            className="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bg hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {matchingTools.length > 0 && (
            <div className="mb-4">
              <p className="px-2 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                Interactive Utilities
              </p>
              <div className="space-y-1">
                {matchingTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      onJumpSection(tool.id);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-bg"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Wrench size={15} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{tool.title}</p>
                      <p className="truncate text-xs text-muted">{tool.description}</p>
                    </div>
                    <ChevronRight size={15} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingGuides.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                Code Recipes
              </p>
              <div className="space-y-1">
                {matchingGuides.map((guide) => (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => {
                      onSelectGuide(guide.id);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-bg"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg text-ink">
                      <Code2 size={15} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{guide.title}</p>
                      <p className="truncate text-xs text-muted">{guide.description}</p>
                    </div>
                    <ChevronRight size={15} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingTools.length === 0 && matchingGuides.length === 0 && (
            <div className="py-12 text-center text-sm text-muted">
              No tools or guides matched &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-bg px-4 py-2.5 font-mono text-[11px] text-muted">
          <span>Press ESC to close</span>
          <span>Stripe Mastery Hub</span>
        </div>
      </div>
    </div>
  );
}
