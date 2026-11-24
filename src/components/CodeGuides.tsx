import React, { useState } from 'react';
import { Check, ChevronRight, Copy, Terminal } from 'lucide-react';
import { CODE_GUIDES, DEVELOPER_FAQ, SUPPORTED_STACKS } from '../data/guides';
import { cn } from '../lib/utils';

export function CodeGuides({
  activeGuideId,
  onSelectGuide,
}: {
  activeGuideId: string;
  onSelectGuide: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const current = CODE_GUIDES.find((g) => g.id === activeGuideId) ?? CODE_GUIDES[0];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="guides" className="border-b border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            05 / IMPLEMENTATION RECIPES
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Copy-ready Stripe API snippets
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Focused reference patterns for Checkout, Payment Element, raw-body webhooks, Billing Meters, Connect, and typed error handling.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-1.5 lg:col-span-4">
            {CODE_GUIDES.map((guide) => {
              const active = guide.id === current.id;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => onSelectGuide(guide.id)}
                  className={cn(
                    'flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-accent bg-accent/5 text-ink'
                      : 'border-transparent bg-bg/60 text-muted hover:border-border hover:bg-bg hover:text-ink'
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{guide.title}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {guide.category}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={active ? 'shrink-0 text-accent' : 'shrink-0 text-muted'}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <div className="min-w-0 lg:col-span-8">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-console">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 bg-slate-900/90 p-5">
                <div>
                  <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-indigo-300">
                    {current.category}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">
                    {current.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">{current.description}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 font-mono text-xs font-medium text-white transition-colors hover:border-accent"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy size={14} aria-hidden="true" />
                  )}
                  {copied ? 'Copied' : 'Copy Snippet'}
                </button>
              </div>
              <div className="flex-1 overflow-x-auto p-5">
                <pre className="font-mono text-xs leading-relaxed text-slate-100">
                  <code>{current.code}</code>
                </pre>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/70 px-5 py-3 font-mono text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal size={12} aria-hidden="true" />
                  Dummy IDs only — never commit live keys
                </span>
                <span>100% Open Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Stacks Strip */}
        <div className="mt-14 rounded-2xl border border-border bg-bg p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            Compatible Runtimes &amp; Frameworks
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUPPORTED_STACKS.map((stack) => (
              <span
                key={stack}
                className="rounded-md border border-border bg-white px-2.5 py-1 font-mono text-xs text-ink"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>

        {/* Developer FAQ */}
        <div id="faq" className="mt-14">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            06 / DEVELOPER FAQ
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-ink">
            Common integration questions
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {DEVELOPER_FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-border bg-bg p-5">
                <h4 className="font-display text-base font-bold text-ink">{item.q}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
