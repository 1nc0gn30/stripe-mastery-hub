export interface CodeGuide {
  id: string;
  title: string;
  category: 'Core' | 'Billing' | 'Connect' | 'Reliability' | 'Compliance';
  description: string;
  code: string;
}

export const CODE_GUIDES: CodeGuide[] = [
  {
    id: 'checkout',
    title: 'Checkout Session + Idempotency',
    category: 'Core',
    description: 'Create a server-side Stripe Checkout session with an idempotency key and order metadata.',
    code: `const session = await stripe.checkout.sessions.create(
  {
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { orderId: order.id },
    success_url: \`\${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.APP_URL}/cancel\`,
  },
  { idempotencyKey: \`checkout_\${order.id}\` }
);`,
  },
  {
    id: 'elements',
    title: 'Payment Element (Embedded UI)',
    category: 'Core',
    description: 'Mount Stripe Payment Element with automatic wallet and local payment method rendering.',
    code: `const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });

const paymentElement = elements.create('payment', { layout: 'tabs' });
paymentElement.mount('#payment-element');

const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: \`\${window.location.origin}/order/complete\` },
});`,
  },
  {
    id: 'webhooks',
    title: 'Raw-Body Webhook Verification',
    category: 'Reliability',
    description: 'Verify Stripe-Signature headers on raw request bytes and deduplicate events by event.id.',
    code: `app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${(err as Error).message}\`);
  }

  // Insert event.id with UNIQUE constraint to guard against redeliveries
  const inserted = await db.markEventProcessed(event.id);
  if (!inserted) return res.json({ received: true, duplicate: true });

  if (event.type === 'checkout.session.completed') {
    await fulfillOrder(event.data.object as Stripe.Checkout.Session);
  }
  return res.json({ received: true });
});`,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & Billing Portal',
    category: 'Billing',
    description: 'Launch recurring billing and delegate plan changes, card updates, and cancellations to Stripe Portal.',
    code: `const subSession = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: org.stripeCustomerId,
  line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
  subscription_data: { trial_period_days: 14, metadata: { orgId: org.id } },
  success_url: \`\${process.env.APP_URL}/billing?upgraded=1\`,
  cancel_url: \`\${process.env.APP_URL}/pricing\`,
});

const portal = await stripe.billingPortal.sessions.create({
  customer: org.stripeCustomerId,
  return_url: \`\${process.env.APP_URL}/settings/billing\`,
});`,
  },
  {
    id: 'usage-meters',
    title: 'Billing Meter Events',
    category: 'Billing',
    description: 'Ingest deduplicated usage metrics for pay-as-you-go API and AI token billing.',
    code: `await stripe.billing.meterEvents.create({
  event_name: 'api_requests',
  identifier: \`usage_\${org.id}_\${bucketTimestamp}\`,
  timestamp: Math.floor(Date.now() / 1000),
  payload: {
    stripe_customer_id: org.stripeCustomerId,
    value: String(requestCount),
  },
});`,
  },
  {
    id: 'connect',
    title: 'Connect Express & Destination Charges',
    category: 'Connect',
    description: 'Onboard marketplace sellers and collect a platform fee automatically per PaymentIntent.',
    code: `const account = await stripe.accounts.create({
  type: 'express',
  capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
});

const intent = await stripe.paymentIntents.create({
  amount: 10000, // $100.00
  currency: 'usd',
  application_fee_amount: 1000, // $10.00 platform fee
  transfer_data: { destination: account.id },
});`,
  },
  {
    id: 'cli-test-clocks',
    title: 'Stripe CLI & Test Clocks',
    category: 'Reliability',
    description: 'Forward live webhook traffic locally and fast-forward subscription renewals in seconds.',
    code: `# Forward signed webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger a realistic event payload
stripe trigger checkout.session.completed

# Fast-forward subscription renewals via Test Clocks
const clock = await stripe.testHelpers.testClocks.create({
  frozen_time: Math.floor(Date.now() / 1000),
  name: 'Renewal Verification',
});`,
  },
  {
    id: 'error-handling',
    title: 'Typed Stripe Error Handling',
    category: 'Reliability',
    description: 'Distinguish card declines from retryable network/rate-limit errors.',
    code: `try {
  await stripe.paymentIntents.confirm(intentId, { payment_method: pmId });
} catch (err) {
  if (err instanceof Stripe.errors.StripeCardError) {
    // Decline code safe to surface to customer (e.g., insufficient_funds)
    return { ok: false, declineCode: err.decline_code, message: err.message };
  }
  if (err instanceof Stripe.errors.StripeRateLimitError || err instanceof Stripe.errors.StripeConnectionError) {
    // Safe to retry with the same Idempotency-Key
    return { ok: false, retryable: true };
  }
  throw err;
}`,
  },
  {
    id: 'tax-disputes',
    title: 'Stripe Tax & Dispute Evidence',
    category: 'Compliance',
    description: 'Calculate automatic sales tax/VAT and respond to chargebacks programmatically.',
    code: `// Automatic tax calculation inside Checkout
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
  automatic_tax: { enabled: true },
  customer_update: { address: 'auto' },
  success_url: \`\${process.env.APP_URL}/success\`,
  cancel_url: \`\${process.env.APP_URL}/cancel\`,
});

// Submit dispute evidence
await stripe.disputes.update(disputeId, {
  evidence: {
    customer_email_address: order.email,
    access_activity_log: order.auditLogSummary,
  },
});`,
  },
];

export interface ChecklistItem {
  id: string;
  category: 'Idempotency' | 'Webhooks' | 'Security' | 'Go-Live';
  title: string;
  detail: string;
}

export const READINESS_CHECKLIST: ChecklistItem[] = [
  {
    id: 'idem-keys',
    category: 'Idempotency',
    title: 'Attach Idempotency-Key to every mutating POST',
    detail: 'Use deterministic per-intent keys (e.g., checkout_{orderId}) so network retries never double-charge.',
  },
  {
    id: 'idem-event-table',
    category: 'Idempotency',
    title: 'Deduplicate webhooks via UNIQUE(stripe_event_id)',
    detail: 'Store processed event.id rows inside the same DB transaction as order fulfillment.',
  },
  {
    id: 'idem-out-of-order',
    category: 'Idempotency',
    title: 'Handle out-of-order event delivery',
    detail: 'Compare event.created or fetch canonical resource state when subscription events arrive out of sequence.',
  },
  {
    id: 'wh-raw-body',
    category: 'Webhooks',
    title: 'Verify Stripe-Signature against raw request bytes',
    detail: 'Parse JSON only after constructEvent() passes; body re-serialization breaks HMAC-SHA256 verification.',
  },
  {
    id: 'wh-fast-ack',
    category: 'Webhooks',
    title: 'Return HTTP 200 within 5 seconds',
    detail: 'Enqueue slow email, PDF invoice, or warehouse calls to a background worker after recording the event.',
  },
  {
    id: 'wh-replay-window',
    category: 'Webhooks',
    title: 'Enforce 300-second timestamp replay tolerance',
    detail: 'Reject stale signed headers to prevent replay attacks against fulfillment endpoints.',
  },
  {
    id: 'sec-server-keys',
    category: 'Security',
    title: 'Keep sk_live_ and whsec_ strictly server-side',
    detail: 'Use restricted API keys (rk_live_) with least-privilege permissions per microservice.',
  },
  {
    id: 'sec-price-server',
    category: 'Security',
    title: 'Resolve prices and amounts on the server',
    detail: 'Never accept unit_amount or discount percentages directly from untrusted browser payloads.',
  },
  {
    id: 'sec-api-version',
    category: 'Security',
    title: 'Pin explicit Stripe API version in SDK init',
    detail: 'Prevent unexpected webhook payload schema drift across account upgrades.',
  },
  {
    id: 'live-keys-webhooks',
    category: 'Go-Live',
    title: 'Swap pk_test / sk_test and register live webhook URL',
    detail: 'Live mode requires its own webhook endpoint and separate whsec_ signing secret.',
  },
  {
    id: 'live-payout-tax',
    category: 'Go-Live',
    title: 'Verify payout bank account, statement descriptor & tax settings',
    detail: 'Set a recognizable statement descriptor to reduce friendly-fraud chargebacks.',
  },
  {
    id: 'live-canary',
    category: 'Go-Live',
    title: 'Run a $1.00 live canary payment and refund',
    detail: 'Confirm live checkout, webhook 200 log, database fulfillment row, and refund flow end to end.',
  },
];

export const DEVELOPER_FAQ = [
  {
    q: 'Do any tools in Stripe Mastery Hub send my webhook secrets or payloads to a server?',
    a: 'No. The Flow Architect, HMAC-SHA256 Webhook Simulator, Fee Calculator, and Readiness Checklist all execute locally in your browser using deterministic TypeScript and the Web Crypto API. Optional BYOK Gemini requests are only made if you explicitly paste your own API key.',
  },
  {
    q: 'Why does Stripe webhook signature verification fail even when my whsec_ secret is right?',
    a: 'The most frequent cause is body parsing middleware modifying the payload before verification. Stripe computes HMAC-SHA256 over "${timestamp}.${rawBodyBytes}". Re-serializing parsed JSON changes whitespace or key order and invalidates the v1 signature.',
  },
  {
    q: 'When should I use ACH Direct Debit instead of cards?',
    a: 'US cards cost 2.9% + $0.30 uncapped ($29.30 on a $1,000 invoice). ACH Direct Debit costs 0.8% capped at $5.00—saving $24.30 on a $1,000 B2B payment. The break-even point is under $15, and savings accelerate sharply above $625.',
  },
  {
    q: 'How should I handle Strong Customer Authentication (3DS / SCA)?',
    a: 'Stripe Checkout and Payment Element manage 3DS challenges automatically. When orchestrating PaymentIntents manually, handle the requires_action status on the client via stripe.handleNextAction().',
  },
];

export const SUPPORTED_STACKS = [
  'Node.js', 'TypeScript', 'Next.js', 'Express', 'Fastify', 'Hono', 'NestJS', 'Bun',
  'Python', 'FastAPI', 'Django', 'Flask', 'Go', 'Gin', 'Fiber', 'Rust', 'Axum',
  'Ruby on Rails', 'PHP / Laravel', 'Java / Spring Boot', 'C# / .NET',
  'React', 'Vue', 'SvelteKit', 'Astro', 'Remix', 'React Native', 'Swift / iOS', 'Kotlin / Android',
  'Supabase', 'Cloudflare Workers', 'Netlify Functions', 'AWS Lambda',
];
