# Stripe Mastery Hub

Open-access, client-side Stripe developer workbench built with React, TypeScript, Tailwind CSS, and the Web Crypto API.

## Included In-Browser Utilities

1. **Payment Flow & Architecture Generator** (`src/lib/flowEngine.ts`, `src/components/FlowArchitect.tsx`)
   - Deterministic local engine covering 5 core Stripe architectures: **Hosted Checkout**, **SaaS Subscriptions & Billing Portal**, **Usage-Based Metered Billing**, **Stripe Connect Marketplace Splits**, and **Idempotent Webhooks**.
   - Generates copy-ready implementation code for **Node/TypeScript**, **Python (FastAPI)**, **Go**, and **Next.js App Router**, along with required webhook events, environment variables, and Dashboard/Backend/Frontend checklists.
   - Optional BYOK Gemini support (browser memory only) with automatic fallback to the deterministic engine.

2. **Webhook HMAC-SHA256 (`Stripe-Signature`) Simulator & Verifier** (`src/lib/webhookCrypto.ts`, `src/components/WebhookSimulator.tsx`)
   - Computes real `t=<timestamp>,v1=<hex_hmac_sha256>` signatures locally via `crypto.subtle` (`HMAC` + `SHA-256`).
   - Verifies incoming `Stripe-Signature` headers using constant-time hex comparison and configurable replay tolerance (default `300s`).
   - Includes 1-byte payload tamper simulation, stale replay simulation, realistic Stripe event payload presets, and copyable `curl` commands for local endpoint testing.

3. **Stripe Processing Fee & Net Margin Calculator** (`src/lib/feeCalculator.ts`, `src/components/FeeCalculator.tsx`)
   - Models US Domestic Cards (`2.9% + $0.30`), International Cards (`+1.5%`), International + FX (`+2.5%`), Manually Keyed / MOTO (`3.4% + $0.30`), ACH Direct Debit (`0.8%`, `$5.00` cap), AMEX, and custom IC+ rates.
   - Supports optional Stripe Billing (`+0.7%`), Stripe Tax (`+0.5%`), Invoicing Plus (`+0.4%`), and Connect platform fee splits.
   - Includes forward (`Charge -> Net Payout`) and reverse (`Target Net -> Gross Price`) gross-up modes plus monthly/annual volume projections.

4. **Idempotency, Webhook & Go-Live Checklist** (`src/components/ReadinessChecklist.tsx`)
   - Interactive 12-point launch checklist persisted to `localStorage` across Idempotency, Webhooks, Security, and Go-Live categories.
   - Built-in scoped `Idempotency-Key` generator using `crypto.randomUUID()`.

5. **Copy-Ready API Recipes & Command Palette (`⌘K`)** (`src/data/guides.ts`, `src/components/CodeGuides.tsx`, `src/components/SearchModal.tsx`)

## Local Development

```bash
npm install
npm run dev
```

## Verification & Tests

```bash
npm run lint   # TypeScript type-check (tsc --noEmit)
npm test       # Unit tests (flow engine, Web Crypto HMAC-SHA256, fee math) + SEO/production guardrail suite
npm run build  # Production Vite bundle -> dist/
```

## Attribution & Support

- Engineered by **Neal Frazier Tech** ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech)
- Repository: [https://github.com/1nc0gn30/stripe-mastery-hub](https://github.com/1nc0gn30/stripe-mastery-hub)
- 100% free and open-access. Optional support: [Buy Us a Coffee (Stripe)](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X) or Solana `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`.
