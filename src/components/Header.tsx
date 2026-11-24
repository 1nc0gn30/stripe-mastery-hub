import React, { useState } from 'react';
import { CreditCard, Search, ExternalLink, Menu, X, Coffee } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'architect', label: 'Flow Architect' },
  { id: 'webhook-lab', label: 'Webhook Crypto' },
  { id: 'fee-calc', label: 'Fee Calculator' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'guides', label: 'Guides' },
];

export function Header({ onSearchOpen }: { onSearchOpen: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex min-h-[44px] items-center gap-2.5 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-xs">
            <CreditCard size={17} aria-hidden="true" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Stripe Mastery Hub
          </span>
          <span className="hidden rounded-md border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted sm:inline-block">
            v2.0
          </span>
        </a>

        <nav aria-label="Primary sections" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-ink"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearchOpen}
            aria-label="Search guides and tools"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-ink"
          >
            <Search size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline-block">
              ⌘K
            </kbd>
          </button>

          <a
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-accent/40 hover:bg-bg sm:inline-flex"
          >
            <Coffee size={14} className="text-accent" aria-hidden="true" />
            <span>Buy Us a Coffee</span>
          </a>

          <a
            href="https://docs.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-xs font-semibold text-white transition-colors hover:bg-ink/90 xl:inline-flex"
          >
            <span>Stripe Docs</span>
            <ExternalLink size={13} aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white text-ink lg:hidden"
          >
            {mobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-medium text-ink hover:bg-bg"
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-3">
              <a
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-xs font-semibold text-ink"
              >
                <Coffee size={14} className="text-accent" aria-hidden="true" />
                Buy Us a Coffee
              </a>
              <a
                href="https://docs.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-semibold text-white"
              >
                Stripe Docs
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
