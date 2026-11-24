import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Check,
  Copy,
  KeyRound,
  Layers,
  Loader2,
  Play,
  Server,
  ShieldAlert,
  Terminal,
  Webhook,
} from 'lucide-react';
import {
  CodeLanguage,
  FLOW_BLUEPRINTS,
  FlowCategory,
  LANGUAGE_LABELS,
} from '../lib/flowEngine';
import {
  FlowGenerationOutput,
  generateFlowArchitecture,
} from '../services/flowArchitectService';
import { cn } from '../lib/utils';

const SCENARIO_PRESETS: Array<{
  id: FlowCategory;
  label: string;
  samplePrompt: string;
}> = [
  {
    id: 'checkout',
    label: 'Hosted Checkout',
    samplePrompt:
      'One-time digital purchase in Next.js with Stripe Tax, idempotent order creation, and webhook fulfillment.',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    samplePrompt:
      'B2B SaaS with monthly/annual tiers, 14-day free trial, and self-service Customer Portal in Node/TypeScript.',
  },
  {
    id: 'usage',
    label: 'Usage-Based Billing',
    samplePrompt:
      'Pay-as-you-go API metered billing charged per 1,000 requests using Stripe Billing Meters in Python FastAPI.',
  },
  {
    id: 'connect',
    label: 'Connect Marketplace',
    samplePrompt:
      'Multi-vendor marketplace with Express seller onboarding and 10% platform application_fee_amount in Go.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks & Sync',
    samplePrompt:
      'Idempotent raw-body Stripe webhook receiver syncing subscription state to Supabase Postgres.',
  },
];

const LANGUAGES: CodeLanguage[] = ['node', 'python', 'go', 'nextjs'];

export function FlowArchitect() {
  const [selectedCategory, setSelectedCategory] = useState<FlowCategory>('checkout');
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('node');
  const [prompt, setPrompt] = useState('');
  const [showByok, setShowByok] = useState(false);
  const [byokKey, setByokKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const [result, setResult] = useState<FlowGenerationOutput>({
    blueprint: FLOW_BLUEPRINTS.checkout,
    recommendedLanguage: 'node',
    source: 'local-engine',
  });

  const handleSelectScenario = (category: FlowCategory) => {
    setSelectedCategory(category);
    setResult({
      blueprint: FLOW_BLUEPRINTS[category],
      recommendedLanguage: selectedLanguage,
      source: 'local-engine',
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const output = await generateFlowArchitecture({
        prompt,
        explicitCategory: prompt.trim() ? undefined : selectedCategory,
        byokApiKey: showByok ? byokKey : undefined,
      });
      setResult(output);
      setSelectedCategory(output.blueprint.id);
      if (prompt.trim()) {
        setSelectedLanguage(output.recommendedLanguage);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeCode = result.blueprint.code[selectedLanguage];

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(activeCode.snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyEnv = async () => {
    await navigator.clipboard.writeText(result.blueprint.envVars.join('\n'));
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 1800);
  };

  return (
    <section id="architect" className="border-b border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              01 / PAYMENT FLOW ARCHITECT
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Generate production Stripe flows in 4 runtimes
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Pick an architecture or describe your stack below. Runs 100% deterministically in-browser with zero backend keys required.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowByok((prev) => !prev)}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-xs font-semibold transition-colors',
                showByok
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border bg-bg text-muted hover:text-ink'
              )}
            >
              <KeyRound size={14} aria-hidden="true" />
              {showByok ? 'BYOK Gemini: On' : 'Optional BYOK AI'}
            </button>
          </div>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Stripe architecture scenarios">
          {SCENARIO_PRESETS.map((preset) => {
            const active = selectedCategory === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectScenario(preset.id)}
                className={cn(
                  'inline-flex min-h-[44px] items-center rounded-lg border px-4 text-sm font-semibold transition-all',
                  active
                    ? 'border-accent bg-accent text-white shadow-xs'
                    : 'border-border bg-bg text-ink hover:border-accent/40 hover:bg-white'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerate} className="mb-8 rounded-2xl border border-border bg-bg p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="flow-prompt" className="text-xs font-semibold uppercase tracking-wider text-muted">
              Custom Requirement (auto-detects Checkout, Subscriptions, Usage Metering, Connect, Webhooks + Runtime)
            </label>
            <textarea
              id="flow-prompt"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Next.js SaaS with 14-day free trial, Stripe Tax, and Supabase webhook sync'"
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
            />

            {showByok && (
              <div className="rounded-xl border border-accent/25 bg-white p-3">
                <label htmlFor="byok-gemini-key" className="block text-xs font-semibold text-ink">
                  Optional Gemini API Key (stays in browser memory only — never stored or proxied)
                </label>
                <input
                  id="byok-gemini-key"
                  type="password"
                  autoComplete="off"
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  placeholder="AIza... (leave blank to use deterministic local engine)"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted">Try sample:</span>
                {SCENARIO_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPrompt(preset.samplePrompt)}
                    className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-ink"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Play size={15} aria-hidden="true" />
                )}
                Build Architecture
              </button>
            </div>
          </div>
        </form>

        {result.warning && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
            <span>{result.warning}</span>
          </div>
        )}

        {/* Output Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Blueprint Spec */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-bg p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {result.blueprint.eyebrow}
                </span>
                <span className="rounded-md border border-border bg-white px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-muted">
                  {result.source === 'byok-gemini' ? 'BYOK + Spec' : 'Local Engine'}
                </span>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-ink">
                {result.blueprint.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {result.blueprint.summary}
              </p>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
                  <Webhook size={14} className="text-accent" aria-hidden="true" />
                  Required Webhook Events
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.blueprint.requiredEvents.map((evt) => (
                    <code
                      key={evt}
                      className="rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink"
                    >
                      {evt}
                    </code>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
                    <Server size={14} className="text-accent" aria-hidden="true" />
                    Server Environment Variables
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEnv}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    {copiedEnv ? <Check size={12} /> : <Copy size={12} />}
                    {copiedEnv ? 'Copied' : 'Copy .env'}
                  </button>
                </div>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-console p-3 font-mono text-[11px] leading-relaxed text-slate-200">
                  <code>{result.blueprint.envVars.join('\n')}</code>
                </pre>
              </div>
            </div>

            {/* 3-Layer Implementation Checklist */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                <Layers size={14} className="text-accent" aria-hidden="true" />
                Architecture Steps
              </div>
              <div className="mt-4 space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-mono font-semibold uppercase tracking-wider text-accent">
                    1. Stripe Dashboard
                  </h4>
                  <ul className="mt-1.5 space-y-1.5 text-muted">
                    {result.blueprint.dashboardSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-mono text-ink/60">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-mono font-semibold uppercase tracking-wider text-accent">
                    2. Backend &amp; Database
                  </h4>
                  <ul className="mt-1.5 space-y-1.5 text-muted">
                    {result.blueprint.backendSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-mono text-ink/60">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-mono font-semibold uppercase tracking-wider text-accent">
                    3. Frontend UX
                  </h4>
                  <ul className="mt-1.5 space-y-1.5 text-muted">
                    {result.blueprint.frontendSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-mono text-ink/60">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Language Production Code */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-console shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Target runtime language">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      role="tab"
                      aria-selected={selectedLanguage === lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={cn(
                        'min-h-[36px] rounded-md px-3 font-mono text-xs font-medium transition-colors',
                        selectedLanguage === lang
                          ? 'bg-accent text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 font-mono text-xs font-medium text-slate-100 transition-colors hover:border-accent hover:text-white"
                >
                  {copiedCode ? (
                    <Check size={13} className="text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy size={13} aria-hidden="true" />
                  )}
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 font-mono text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal size={12} aria-hidden="true" />
                  {activeCode.filename}
                </span>
                <span>Pinned API: 2025-02-24.acacia</span>
              </div>

              <div className="flex-1 overflow-x-auto p-5">
                <pre className="font-mono text-xs leading-relaxed text-slate-100">
                  <code>{activeCode.snippet}</code>
                </pre>
              </div>

              <div className="border-t border-slate-800 bg-slate-900/70 px-5 py-3.5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Production Guardrails
                </p>
                <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                  {result.blueprint.notes.map((note, idx) => (
                    <li key={idx}>• {note}</li>
                  ))}
                </ul>
              </div>
            </div>

            {result.customMarkdown && (
              <div className="rounded-2xl border border-accent/30 bg-white p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
                  BYOK GEMINI CUSTOM ADDENDUM
                </p>
                <div className="prose prose-sm mt-3 max-w-none text-ink">
                  <ReactMarkdown>{result.customMarkdown}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
