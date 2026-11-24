import React, { useState } from 'react';
import { Check, Coffee, Copy, CreditCard, ExternalLink } from 'lucide-react';

const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_TIP_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

export function Footer() {
  const [copiedSol, setCopiedSol] = useState(false);

  const handleCopySol = async () => {
    await navigator.clipboard.writeText(SOLANA_TIP_ADDRESS);
    setCopiedSol(true);
    setTimeout(() => setCopiedSol(false), 1800);
  };

  return (
    <footer className="bg-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Non-intrusive Open-Access Support Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-white p-5 md:flex-row md:items-center">
          <div>
            <p className="font-display text-base font-bold text-ink">
              100% Free &amp; Open-Access Developer Workbench
            </p>
            <p className="mt-1 text-xs text-muted">
              Every simulator, code generator, and fee calculator runs unlocked in your browser. If this saved you integration hours, consider buying a coffee.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={STRIPE_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
            >
              <Coffee size={15} aria-hidden="true" />
              Buy Us a Coffee (Stripe)
              <ExternalLink size={12} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={handleCopySol}
              title={`Solana tip address: ${SOLANA_TIP_ADDRESS}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-bg px-3.5 font-mono text-xs font-medium text-ink transition-colors hover:border-accent"
            >
              {copiedSol ? (
                <Check size={14} className="text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy size={14} className="text-muted" aria-hidden="true" />
              )}
              <span>{copiedSol ? 'Solana Address Copied' : 'SOL Tip: GG2eQb...dXoK'}</span>
            </button>
          </div>
        </div>

        {/* Clean Attribution Row */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
              <CreditCard size={13} aria-hidden="true" />
            </span>
            <span className="font-display font-bold">Stripe Mastery Hub</span>
            <span className="text-muted">•</span>
            <span className="text-muted">
              Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://github.com/1nc0gn30/stripe-mastery-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted transition-colors hover:text-ink"
            >
              GitHub Repo
            </a>
            <a
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted transition-colors hover:text-ink"
            >
              NullAI Platform
            </a>
            <a
              href={`solana:${SOLANA_TIP_ADDRESS}`}
              className="font-mono text-[11px] text-muted transition-colors hover:text-ink"
            >
              Solana URI
            </a>
            <a
              href="https://docs.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted transition-colors hover:text-ink"
            >
              Stripe Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
