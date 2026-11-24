import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  CheckSquare,
  Code2,
  ShieldCheck,
  Terminal,
  Webhook,
} from 'lucide-react';
import { Header } from './components/Header';
import { FlowArchitect } from './components/FlowArchitect';
import { WebhookSimulator } from './components/WebhookSimulator';
import { FeeCalculator } from './components/FeeCalculator';
import { ReadinessChecklist } from './components/ReadinessChecklist';
import { CodeGuides } from './components/CodeGuides';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';

const WORKBENCH_CARDS = [
  {
    id: 'architect',
    eyebrow: '01 · FLOW ARCHITECT',
    title: 'Multi-Runtime Code Generator',
    description: 'Checkout, Subscriptions, Usage Meters, Connect & Webhooks across Node, Python, Go, and Next.js.',
    icon: Code2,
  },
  {
    id: 'webhook-lab',
    eyebrow: '02 · WEB CRYPTO',
    title: 'HMAC-SHA256 Webhook Lab',
    description: 'Sign & verify real Stripe-Signature headers, test 1-byte tampering, and export local curl commands.',
    icon: Webhook,
  },
  {
    id: 'fee-calc',
    eyebrow: '03 · ECONOMICS',
    title: 'Fee & Net Margin Calculator',
    description: 'Model cards, international FX, ACH $5 caps, Billing/Tax add-ons, and reverse net gross-up.',
    icon: Calculator,
  },
  {
    id: 'checklist',
    eyebrow: '04 · LAUNCH GATE',
    title: 'Idempotency & Go-Live Gate',
    description: 'Track production readiness invariants and generate scoped Idempotency-Key headers.',
    icon: CheckSquare,
  },
];

export default function App() {
  const [activeGuideId, setActiveGuideId] = useState<string>('checkout');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const jumpToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectGuide = (guideId: string) => {
    setActiveGuideId(guideId);
    setTimeout(() => jumpToSection('guides'), 60);
  };

  return (
    <div id="top" className="min-h-screen bg-bg text-ink selection:bg-accent/20 selection:text-accent">
      <Header onSearchOpen={() => setIsSearchOpen(true)} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGuide={handleSelectGuide}
        onJumpSection={jumpToSection}
      />

      <main>
        {/* Focused Technical Spec Ledger Hero */}
        <section className="relative border-b border-border bg-bg py-14 sm:py-20">
          <div className="data-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-border bg-white px-3 py-1.5 font-mono text-[11px] font-medium text-muted shadow-2xs sm:rounded-full sm:py-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>100% IN-BROWSER</span>
                </span>
                <span className="hidden text-border sm:inline">•</span>
                <span>WEB CRYPTO HMAC-SHA256</span>
                <span className="hidden text-border sm:inline">•</span>
                <span>ZERO PAYWALLS</span>
              </div>

              <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Architect, sign, and price{' '}
                <span className="text-accent">Stripe integrations.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                An open-access engineering workbench for Stripe developers: generate multi-runtime payment flows, verify raw-body webhook signatures with Web Crypto, calculate exact settlement margins, and audit go-live readiness.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => jumpToSection('architect')}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent/90"
                >
                  Open Flow Architect
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => jumpToSection('webhook-lab')}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-accent/50"
                >
                  <ShieldCheck size={15} className="text-accent" aria-hidden="true" />
                  Test Webhook Signature
                </button>
                <button
                  type="button"
                  onClick={() => jumpToSection('fee-calc')}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-accent/50"
                >
                  <Terminal size={15} className="text-muted" aria-hidden="true" />
                  Calculate Fees
                </button>
              </div>
            </div>

            {/* 4-Tool Quick Workbench Strip */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WORKBENCH_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => jumpToSection(card.id)}
                    className="group flex flex-col items-start rounded-2xl border border-border bg-white p-5 text-left transition-all hover:border-accent/60 hover:shadow-sm"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {card.eyebrow}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-base font-bold text-ink">
                      {card.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <FlowArchitect />
        <WebhookSimulator />
        <FeeCalculator />
        <ReadinessChecklist />
        <CodeGuides activeGuideId={activeGuideId} onSelectGuide={setActiveGuideId} />
      </main>

      <Footer />
    </div>
  );
}
