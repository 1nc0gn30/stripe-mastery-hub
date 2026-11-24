import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  FLOW_BLUEPRINTS,
  detectFlowCategory,
  detectPreferredLanguage,
  generateDeterministicBlueprint,
} from '../src/lib/flowEngine';
import {
  WEBHOOK_TEMPLATES,
  buildWebhookCurlCommand,
  constantTimeEqual,
  generateStripeSignatureHeader,
  parseStripeSignatureHeader,
  verifyStripeSignature,
} from '../src/lib/webhookCrypto';
import { calculateStripeFees } from '../src/lib/feeCalculator';

const ROOT = path.resolve(process.cwd());

test('flowEngine detects Stripe architecture categories & runtimes accurately', () => {
  assert.equal(detectFlowCategory('Marketplace with Connect Express and 10% platform fee'), 'connect');
  assert.equal(detectFlowCategory('API usage billing per 1,000 requests with meter events'), 'usage');
  assert.equal(detectFlowCategory('Sync Stripe webhooks to Supabase Postgres with HMAC'), 'webhooks');
  assert.equal(detectFlowCategory('SaaS subscriptions with 14-day trial and portal'), 'subscriptions');
  assert.equal(detectFlowCategory('Simple one-time hosted checkout payment'), 'checkout');

  assert.equal(detectPreferredLanguage('Build this in Next.js App Router'), 'nextjs');
  assert.equal(detectPreferredLanguage('Use Python FastAPI backend'), 'python');
  assert.equal(detectPreferredLanguage('Implement in Go with Gin'), 'go');
  assert.equal(detectPreferredLanguage('Node Express server'), 'node');
});

test('flowEngine produces complete blueprints across all 5 flows and 4 runtimes', () => {
  const categories = Object.keys(FLOW_BLUEPRINTS) as Array<keyof typeof FLOW_BLUEPRINTS>;
  assert.equal(categories.length, 5);

  for (const cat of categories) {
    const bp = FLOW_BLUEPRINTS[cat];
    assert.ok(bp.requiredEvents.length > 0, `${cat} has requiredEvents`);
    assert.ok(bp.envVars.length > 0, `${cat} has envVars`);
    for (const lang of ['node', 'python', 'go', 'nextjs'] as const) {
      assert.ok(bp.code[lang].snippet.length > 100, `${cat}/${lang} has real snippet`);
    }
  }

  const custom = generateDeterministicBlueprint(
    'Next.js SaaS with 14-day free trial, Stripe Tax, and Supabase webhook sync'
  );
  assert.equal(custom.recommendedLanguage, 'nextjs');
  assert.ok(custom.blueprint.notes.some((n) => n.includes('Supabase')));
  assert.ok(custom.blueprint.notes.some((n) => n.includes('Tax')));
  assert.ok(custom.blueprint.notes.some((n) => n.includes('trial')));
});

test('webhookCrypto generates and verifies genuine HMAC-SHA256 Stripe signatures', async () => {
  const secret = 'whsec_test_unit_secret_1234567890';
  const payload = WEBHOOK_TEMPLATES[0].payload;
  const now = 1732480500;

  const signed = await generateStripeSignatureHeader(secret, payload, now);
  assert.match(signed.header, /^t=1732480500,v1=[0-9a-f]{64}$/);

  const parsed = parseStripeSignatureHeader(signed.header);
  assert.equal(parsed.timestamp, now);
  assert.equal(parsed.v1Signatures.length, 1);

  const ok = await verifyStripeSignature({
    secret,
    rawPayload: payload,
    signatureHeader: signed.header,
    toleranceSeconds: 300,
    nowSeconds: now + 45,
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.signatureMatched, true);
  assert.equal(ok.timestampValid, true);
  assert.equal(ok.ageSeconds, 45);
});

test('webhookCrypto detects 1-byte tampering, wrong secret, and replay expiration', async () => {
  const secret = 'whsec_test_unit_secret_1234567890';
  const payload = '{"id":"evt_123","amount":4900}';
  const now = 1732480500;
  const signed = await generateStripeSignatureHeader(secret, payload, now);

  // 1-byte tamper
  const tampered = await verifyStripeSignature({
    secret,
    rawPayload: '{"id":"evt_123","amount":4901}',
    signatureHeader: signed.header,
    toleranceSeconds: 300,
    nowSeconds: now + 10,
  });
  assert.equal(tampered.valid, false);
  assert.equal(tampered.signatureMatched, false);

  // Stale replay beyond 300s window
  const stale = await verifyStripeSignature({
    secret,
    rawPayload: payload,
    signatureHeader: signed.header,
    toleranceSeconds: 300,
    nowSeconds: now + 601,
  });
  assert.equal(stale.valid, false);
  assert.equal(stale.signatureMatched, true);
  assert.equal(stale.timestampValid, false);

  // Constant-time helper & curl builder
  assert.equal(constantTimeEqual('abcdef', 'abcdef'), true);
  assert.equal(constantTimeEqual('abcdef', 'abcdeg'), false);
  assert.equal(constantTimeEqual('abc', 'abcd'), false);

  const curl = buildWebhookCurlCommand('http://localhost:3000/webhook', signed.header, payload);
  assert.ok(curl.includes('Stripe-Signature: t=1732480500,v1='));
  assert.ok(curl.includes('--data-raw'));
});

test('feeCalculator accurately computes domestic, international FX, ACH $5 cap, and reverse net gross-up', () => {
  // Standard US card: $100 -> $2.90 + $0.30 = $3.20 fee -> $96.80 net
  const usCard = calculateStripeFees({
    amount: 100,
    mode: 'standard',
    railId: 'us_card',
    monthlyTransactions: 100,
  });
  assert.equal(usCard.totalStripeFee, 3.2);
  assert.equal(usCard.netPayout, 96.8);
  assert.equal(usCard.monthlyGross, 10000);
  assert.equal(usCard.monthlyTotalFees, 320);

  // ACH $5 cap on $1,000 charge: 0.8% = $8 -> capped at $5.00
  const ach = calculateStripeFees({
    amount: 1000,
    mode: 'standard',
    railId: 'ach_debit',
  });
  assert.equal(ach.capApplied, true);
  assert.equal(ach.stripeBaseFee, 5.0);
  assert.equal(ach.netPayout, 995.0);

  // International + FX + Stripe Tax + Connect 10% platform fee on $200
  const intlConnect = calculateStripeFees({
    amount: 200,
    mode: 'standard',
    railId: 'intl_fx_card',
    includeTax: true,
    platformFeePercent: 10,
  });
  // Base: 5.4% of 200 + 0.30 = 11.10; Tax: 0.5% of 200 = 1.00; Platform: 10% of 200 = 20.00
  assert.equal(intlConnect.stripeBaseFee, 11.1);
  assert.equal(intlConnect.addOnFee, 1.0);
  assert.equal(intlConnect.platformFee, 20.0);
  assert.equal(intlConnect.netPayout, 167.9);

  // Target Net reverse gross-up: want $100 net on US card (2.9% + $0.30) -> charge $103.30
  const reverseUs = calculateStripeFees({
    amount: 100,
    mode: 'target_net',
    railId: 'us_card',
  });
  assert.equal(reverseUs.grossAmount, 103.3);
  assert.equal(reverseUs.netPayout, 100.0);

  // Target Net reverse gross-up on ACH above cap: want $1,000 net -> charge $1,005.00
  const reverseAch = calculateStripeFees({
    amount: 1000,
    mode: 'target_net',
    railId: 'ach_debit',
  });
  assert.equal(reverseAch.capApplied, true);
  assert.equal(reverseAch.grossAmount, 1005.0);
  assert.equal(reverseAch.netPayout, 1000.0);
});

test('production SEO, AEO JSON-LD, Netlify, and open-access guardrails pass', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
  const netlify = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  const footer = fs.readFileSync(path.join(ROOT, 'src/components/Footer.tsx'), 'utf8');

  // HTML meta & JSON-LD @graph
  assert.ok(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0"'));
  assert.ok(html.includes('property="og:image"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('name="twitter:site" content="@1nc0gn30"'));
  assert.ok(!html.includes('form-name" value="waitlist"'), 'No legacy waitlist form');

  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'JSON-LD script exists');
  const ld = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(ld['@graph']), 'JSON-LD has @graph');
  assert.ok(ld['@graph'].some((n: { '@type': string }) => n['@type'] === 'WebApplication'));
  assert.ok(ld['@graph'].some((n: { '@type': string }) => n['@type'] === 'FAQPage'));

  // Robots & Sitemap
  for (const bot of ['Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
    assert.ok(robots.includes(bot), `robots.txt allows ${bot}`);
  }
  assert.ok(robots.includes('Sitemap: https://stripe-mastery-hub.nealfrazier.tech/sitemap.xml'));
  assert.ok(sitemap.includes('<lastmod>'));

  // Netlify security headers & SPA redirect
  assert.ok(netlify.includes('publish = "dist"'));
  assert.ok(netlify.includes('X-Frame-Options = "SAMEORIGIN"'));
  assert.ok(netlify.includes('X-Content-Type-Options = "nosniff"'));
  assert.ok(netlify.includes('from = "/*"'));

  // Open-access & Buy Us a Coffee support invariant (zero DePay / paywall)
  assert.ok(footer.includes('https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X'));
  assert.ok(footer.includes('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'));
  assert.ok(footer.includes('Neal Frazier Tech (@1nc0gn30)'));
  assert.ok(!/depay/i.test(footer), 'Zero DePay links');

  // Verify local og-image.png exists and is valid PNG (1200x630 header check)
  const pngBuf = fs.readFileSync(path.join(ROOT, 'public/og-image.png'));
  assert.equal(pngBuf.readUInt32BE(0), 0x89504e47, 'Valid PNG signature');
  assert.equal(pngBuf.readUInt32BE(16), 1200, 'og-image.png width is 1200');
  assert.equal(pngBuf.readUInt32BE(20), 630, 'og-image.png height is 630');
});
