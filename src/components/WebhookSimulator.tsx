import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Terminal,
} from 'lucide-react';
import {
  WEBHOOK_TEMPLATES,
  SignatureVerificationResult,
  buildWebhookCurlCommand,
  generateStripeSignatureHeader,
  verifyStripeSignature,
} from '../lib/webhookCrypto';
import { cn } from '../lib/utils';

const DEFAULT_SECRET = 'whsec_test_51Q9xK2LkdIwHu7ix9P4bM1vZ0a8c7e6f';

export function WebhookSimulator() {
  const [templateId, setTemplateId] = useState(WEBHOOK_TEMPLATES[0].id);
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [rawPayload, setRawPayload] = useState(WEBHOOK_TEMPLATES[0].payload);
  const [timestamp, setTimestamp] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [toleranceSeconds, setToleranceSeconds] = useState<number>(300);
  const [endpointUrl, setEndpointUrl] = useState('http://localhost:3000/api/webhooks/stripe');

  const [generatedHeader, setGeneratedHeader] = useState('');
  const [verifyHeaderInput, setVerifyHeaderInput] = useState('');
  const [verification, setVerification] = useState<SignatureVerificationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<'header' | 'curl' | null>(null);

  // Auto-sign whenever secret, payload, or timestamp changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await generateStripeSignatureHeader(secret, rawPayload, timestamp);
        if (!cancelled) {
          setGeneratedHeader(res.header);
          setVerifyHeaderInput((prev) => (prev ? prev : res.header));
        }
      } catch {
        // Web Crypto error handled gracefully
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [secret, rawPayload, timestamp]);

  // Auto-verify whenever verification inputs change
  useEffect(() => {
    if (!verifyHeaderInput) return;
    let cancelled = false;
    (async () => {
      const res = await verifyStripeSignature({
        secret,
        rawPayload,
        signatureHeader: verifyHeaderInput,
        toleranceSeconds,
      });
      if (!cancelled) {
        setVerification(res);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [secret, rawPayload, verifyHeaderInput, toleranceSeconds]);

  const handleTemplateChange = async (id: string) => {
    const found = WEBHOOK_TEMPLATES.find((t) => t.id === id);
    if (!found) return;
    const now = Math.floor(Date.now() / 1000);
    setTemplateId(id);
    setRawPayload(found.payload);
    setTimestamp(now);
    const signed = await generateStripeSignatureHeader(secret, found.payload, now);
    setGeneratedHeader(signed.header);
    setVerifyHeaderInput(signed.header);
  };

  const handleFreshTimestamp = async () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now);
    const signed = await generateStripeSignatureHeader(secret, rawPayload, now);
    setGeneratedHeader(signed.header);
    setVerifyHeaderInput(signed.header);
  };

  const handleSyncSignedToVerifier = () => {
    setVerifyHeaderInput(generatedHeader);
  };

  const handleSimulateTamper = () => {
    // Modify one byte in rawPayload without updating verifyHeaderInput
    if (rawPayload.includes('4900')) {
      setRawPayload(rawPayload.replace('4900', '4901'));
    } else if (rawPayload.includes('false')) {
      setRawPayload(rawPayload.replace('false', 'true'));
    } else {
      setRawPayload(`${rawPayload} `);
    }
  };

  const handleSimulateReplay = async () => {
    const staleTs = Math.floor(Date.now() / 1000) - 900; // 15 minutes old
    const signed = await generateStripeSignatureHeader(secret, rawPayload, staleTs);
    setVerifyHeaderInput(signed.header);
  };

  const curlCommand = buildWebhookCurlCommand(endpointUrl, generatedHeader, rawPayload);

  const copyText = async (value: string, key: 'header' | 'curl') => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <section id="webhook-lab" className="border-b border-border bg-bg py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              02 / WEBHOOK CRYPTO LAB
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              HMAC-SHA256 Stripe-Signature Simulator &amp; Verifier
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Real browser Web Crypto API (<code className="font-mono text-xs text-ink">crypto.subtle</code>) signing and constant-time verification over raw payload bytes. Test payload tampering and replay tolerance locally.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFreshTimestamp}
            className="inline-flex h-11 items-center gap-2 self-start rounded-lg border border-border bg-white px-4 text-xs font-semibold text-ink transition-colors hover:border-accent md:self-auto"
          >
            <RefreshCw size={14} className="text-accent" aria-hidden="true" />
            Re-Sign with Now (t={timestamp})
          </button>
        </div>

        {/* Event Template Pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            Payload Preset:
          </span>
          {WEBHOOK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleTemplateChange(tpl.id)}
              className={cn(
                'min-h-[40px] rounded-lg border px-3 font-mono text-xs font-medium transition-colors',
                templateId === tpl.id
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-white text-ink hover:border-accent/40'
              )}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Raw Payload & Signing Controls */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="wh-secret" className="block text-xs font-semibold text-ink">
                    Webhook Signing Secret (<code className="font-mono">whsec_...</code>)
                  </label>
                  <input
                    id="wh-secret"
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="wh-ts" className="block text-xs font-semibold text-ink">
                      Timestamp (<code className="font-mono">t</code>)
                    </label>
                    <input
                      id="wh-ts"
                      type="number"
                      value={timestamp}
                      onChange={(e) => setTimestamp(Number(e.target.value) || 0)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="wh-tolerance" className="block text-xs font-semibold text-ink">
                      Tolerance (sec)
                    </label>
                    <input
                      id="wh-tolerance"
                      type="number"
                      min={0}
                      value={toleranceSeconds}
                      onChange={(e) => setToleranceSeconds(Math.max(0, Number(e.target.value) || 0))}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="wh-payload" className="text-xs font-semibold text-ink">
                    Raw Request Body Bytes
                  </label>
                  <span className="font-mono text-[11px] text-muted">
                    {new TextEncoder().encode(rawPayload).byteLength} bytes
                  </span>
                </div>
                <textarea
                  id="wh-payload"
                  rows={12}
                  value={rawPayload}
                  onChange={(e) => setRawPayload(e.target.value)}
                  spellCheck={false}
                  className="mt-1.5 w-full rounded-xl border border-border bg-console p-3.5 font-mono text-xs leading-relaxed text-slate-100 focus:border-accent focus:outline-none"
                />
              </div>

              <div className="mt-4 rounded-xl border border-border bg-bg p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Computed Stripe-Signature Header
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncSignedToVerifier}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Use in Verifier
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(generatedHeader, 'header')}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent"
                    >
                      {copiedKey === 'header' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedKey === 'header' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <code className="mt-2 block break-all rounded-lg bg-white p-2.5 font-mono text-[11px] text-ink">
                  {generatedHeader || 'Computing HMAC-SHA256...'}
                </code>
              </div>
            </div>
          </div>

          {/* Right: Live Verifier & Local curl Generator */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">
                  Signature Verifier Diagnostics
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateTamper}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-100"
                  >
                    <AlertTriangle size={13} aria-hidden="true" />
                    Tamper 1 Byte
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateReplay}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                  >
                    Simulate Stale Replay
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="verify-header-input" className="block text-xs font-semibold text-ink">
                  Incoming <code className="font-mono">Stripe-Signature</code> Header to Verify
                </label>
                <input
                  id="verify-header-input"
                  type="text"
                  value={verifyHeaderInput}
                  onChange={(e) => setVerifyHeaderInput(e.target.value)}
                  placeholder="t=1732480000,v1=..."
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              {/* Verification Status Banner */}
              {verification && (
                <div
                  role="status"
                  className={cn(
                    'mt-4 rounded-xl border p-4',
                    verification.valid
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-rose-300 bg-rose-50 text-rose-950'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {verification.valid ? (
                      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <ShieldX size={20} className="mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold">
                        {verification.valid
                          ? 'VALID SIGNATURE — constructEvent() PASSES'
                          : 'VERIFICATION FAILED — REJECT WITH HTTP 400'}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed opacity-90">{verification.reason}</p>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-current/15 pt-3 font-mono text-[11px] sm:grid-cols-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        size={13}
                        className={verification.signatureMatched ? 'text-emerald-700' : 'text-rose-700'}
                        aria-hidden="true"
                      />
                      <span>HMAC Match: {verification.signatureMatched ? 'YES' : 'NO'}</span>
                    </div>
                    <div>
                      Replay Drift:{' '}
                      {verification.ageSeconds !== null ? `${verification.ageSeconds}s` : 'N/A'} (max{' '}
                      {verification.toleranceSeconds}s)
                    </div>
                    <div>Signed Bytes: {verification.signedPayloadByteLength} B</div>
                  </div>

                  {verification.expectedSignature && (
                    <div className="mt-3 space-y-1.5 rounded-lg bg-white/80 p-2.5 font-mono text-[11px] text-ink">
                      <div className="break-all">
                        <span className="font-semibold text-muted">Expected v1: </span>
                        {verification.expectedSignature}
                      </div>
                      <div className="break-all">
                        <span className="font-semibold text-muted">Provided v1: </span>
                        {verification.providedSignatures[0] || '(none)'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Local curl Dispatch Box */}
            <div className="overflow-hidden rounded-2xl border border-border bg-console">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-200">
                  <Terminal size={13} className="text-accent" aria-hidden="true" />
                  Local Endpoint Test (curl)
                </span>
                <button
                  type="button"
                  onClick={() => copyText(curlCommand, 'curl')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 font-mono text-xs text-slate-100 hover:border-accent"
                >
                  {copiedKey === 'curl' ? (
                    <Check size={12} className="text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy size={12} aria-hidden="true" />
                  )}
                  {copiedKey === 'curl' ? 'Copied curl' : 'Copy curl'}
                </button>
              </div>
              <div className="border-b border-slate-800/80 px-4 py-2.5">
                <label htmlFor="curl-url" className="sr-only">
                  Target webhook URL
                </label>
                <input
                  id="curl-url"
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 font-mono text-xs text-slate-100 focus:border-accent focus:outline-none"
                />
              </div>
              <pre className="max-h-56 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-200">
                <code>{curlCommand}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
