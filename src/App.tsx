/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  CreditCard, 
  Zap, 
  Database, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  Info, 
  Sparkles,
  ChevronRight,
  Code2,
  ExternalLink,
  Loader2,
  Webhook,
  Link,
  Settings,
  Cpu,
  Smartphone,
  Server,
  Cloud,
  ShieldCheck,
  X,
  Copy,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import { generateStripeFlow } from "./services/geminiService";

// --- Constants ---

const FRAMEWORKS = [
  "React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "SvelteKit", "Remix", "Astro", "SolidJS", "Qwik",
  "Node.js", "Express", "Fastify", "NestJS", "Hono", "Bun", "Deno",
  "Python", "Django", "Flask", "FastAPI", "Pyramid", "Tornado",
  "Ruby", "Rails", "Sinatra", "Hanami",
  "Go", "Gin", "Echo", "Fiber", "Buffalo",
  "PHP", "Laravel", "Symfony", "WordPress", "Magento", "Drupal", "Joomla",
  "Java", "Spring Boot", "Kotlin", "Quarkus", "Micronaut",
  "C#", ".NET Core", "ASP.NET", "Blazor",
  "Rust", "Actix", "Rocket", "Warp", "Axum",
  "Swift", "iOS", "SwiftUI", "Vapor",
  "Kotlin", "Android", "Jetpack Compose", "Ktor",
  "Flutter", "React Native", "Ionic", "Capacitor", "NativeScript",
  "Supabase", "Firebase", "Appwrite", "PocketBase", "Hasura",
  "Vercel", "Netlify", "AWS Lambda", "Google Cloud Functions", "Azure Functions", "Cloudflare Workers",
  "Bubble", "Webflow", "Framer", "Wix", "Shopify", "Squarespace", "Carrd", "Retool"
];

const NoCodeSection = () => (
  <section id="nocode" className="py-24 bg-white border-b border-border">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4">No-Code & Low-Code Power</h2>
          <p className="text-muted max-w-xl mx-auto">You don't always need a backend. Stripe's no-code tools are incredibly powerful for rapid launches.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent text-white rounded-lg">
                <Link size={20} />
              </div>
              <h3 className="text-xl font-bold">Payment Links</h3>
            </div>
            <p className="text-sm text-muted mb-6">Create a full checkout page in seconds without writing a single line of code. Perfect for social media, email, or simple landing pages.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-accent" /> Custom branding & domains
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-accent" /> Collect taxes & shipping
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-accent" /> Automatic mobile optimization
              </li>
            </ul>
            <a 
              href="https://stripe.com/payments/payment-links" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-all text-center"
            >
              Create a Link
            </a>
          </div>

          <div className="glass-card p-8 border-ink/10 bg-ink/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-ink text-white rounded-lg">
                <Settings size={20} />
              </div>
              <h3 className="text-xl font-bold">Customer Portal</h3>
            </div>
            <p className="text-sm text-muted mb-6">Let your customers manage their own subscriptions, update payment methods, and view invoices with zero maintenance.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-ink" /> Self-service cancellations
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-ink" /> Secure billing history
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 size={14} className="text-ink" /> One-click plan upgrades
              </li>
            </ul>
            <a 
              href="https://stripe.com/billing/customer-portal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl bg-ink text-white font-bold text-sm hover:bg-ink/90 transition-all text-center"
            >
              Configure Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CODE_SNIPPETS = {
  checkout: {
    title: "Checkout (Client-Side)",
    description: "The simplest way to accept payments. Redirect users to a Stripe-hosted page.",
    code: `// 1. Create a Checkout Session on your server
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_123', // Your Product Price ID
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://your-site.com/success',
  cancel_url: 'https://your-site.com/cancel',
});

// 2. Redirect the user to the session URL
window.location.href = session.url;`
  },
  elements: {
    title: "Stripe Elements (Custom UI)",
    description: "Build a custom payment form directly on your site using pre-built UI components.",
    code: `// 1. Initialize Elements
const stripe = await loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
const elements = stripe.elements({ mode: 'payment', amount: 1099, currency: 'usd' });

// 2. Create and mount the Payment Element
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// 3. Handle submission
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: 'https://example.com/order/123/complete' },
});`
  },
  webhooks: {
    title: "Webhooks (Node.js)",
    description: "Listen for events from Stripe to update your database (e.g., fulfilling an order).",
    code: `app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Fulfill the purchase...
      break;
    case 'invoice.paid':
      // Handle subscription payment success
      break;
    case 'invoice.payment_failed':
      // Notify user about failed payment
      break;
  }

  res.json({received: true});
});`
  },
  cli: {
    title: "Stripe CLI (Testing)",
    description: "Test webhooks locally without deploying your server.",
    code: `# 1. Login to your account
stripe login

# 2. Forward webhooks to your local server
stripe listen --forward-to localhost:3000/webhook

# 3. Trigger a test event
stripe trigger checkout.session.completed`
  },
  paymentLinks: {
    title: "Payment Links (No-Code)",
    description: "Create a URL in the Stripe Dashboard and share it anywhere. No code needed.",
    code: `// No code required! 
// Just create a link in the Dashboard:
// 1. Go to More > Payment Links
// 2. Click "+ New"
// 3. Select your product
// 4. Copy the URL: https://buy.stripe.com/test_123

// Pro tip: Add metadata via URL params
// https://buy.stripe.com/test_123?client_reference_id=USER_123`
  },
  secrets: {
    title: "Managing Secrets",
    description: "Keep your API keys safe. Never expose secret keys in client-side code.",
    code: `# .env file (Server-side only)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Accessing in code:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
  },
  subscriptions: {
    title: "Subscriptions (SaaS)",
    description: "Create recurring payments with multiple tiers and grace periods.",
    code: `// 1. Create a subscription
const subscription = await stripe.subscriptions.create({
  customer: 'cus_123',
  items: [{ price: 'price_H5ggY9' }],
  payment_behavior: 'default_incomplete',
  payment_settings: { save_default_payment_method: 'on_subscription' },
  expand: ['latest_invoice.payment_intent'],
});

// 2. Handle the first payment on the client
const { error } = await stripe.confirmCardPayment(
  subscription.latest_invoice.payment_intent.client_secret
);`
  },
  connect: {
    title: "Stripe Connect (Marketplace)",
    description: "Onboard sellers and split payments between your platform and vendors.",
    code: `// 1. Create a connected account
const account = await stripe.accounts.create({ type: 'express' });

// 2. Create an Account Link for onboarding
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://example.com/reauth',
  return_url: 'https://example.com/return',
  type: 'account_onboarding',
});

// 3. Create a transfer (splitting the sale)
const transfer = await stripe.transfers.create({
  amount: 7000, // $70.00
  currency: 'usd',
  destination: 'acct_123',
  transfer_group: 'ORDER_95',
});`
  },
  errors: {
    title: "Error Handling",
    description: "Robustly handle card declines, network issues, and API errors.",
    code: `try {
  const charge = await stripe.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_chargeDeclined',
  });
} catch (err) {
  switch (err.type) {
    case 'StripeCardError':
      // A declined card error
      console.log(\`Message: \${err.message}\`);
      break;
    case 'StripeRateLimitError':
      // Too many requests made to the API too quickly
      break;
    case 'StripeInvalidRequestError':
      // Invalid parameters were supplied to Stripe's API
      break;
    case 'StripeAPIError':
      // An error occurred internally with Stripe's API
      break;
    case 'StripeConnectionError':
      // Some kind of error occurred during the HTTPS communication
      break;
    case 'StripeAuthenticationError':
      // You probably used an incorrect API key
      break;
    default:
      // Handle any other types of unexpected errors
      break;
  }
}`
  },
  testing: {
    title: "Testing (Test Clocks)",
    description: "Simulate time passing to test subscription lifecycles.",
    code: `// 1. Create a Test Clock
const testClock = await stripe.testHelpers.testClocks.create({
  frozen_time: Math.floor(Date.now() / 1000),
  name: 'Monthly Subscription Test',
});

// 2. Create a Customer with the Test Clock
const customer = await stripe.customers.create({
  test_clock: testClock.id,
  email: 'test@example.com',
});

// 3. Advance the clock (e.g., by 31 days)
await stripe.testHelpers.testClocks.advance(testClock.id, {
  frozen_time: Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60),
});

// Now check if the subscription renewed or webhooks fired!`
  },
  tax: {
    title: "Stripe Tax",
    description: "Automatically calculate and collect sales tax, VAT, and GST.",
    code: `// 1. Create a Checkout Session with Tax
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_123',
    quantity: 1,
  }],
  mode: 'payment',
  automatic_tax: { enabled: true }, // Enable automatic tax
  customer_update: { address: 'auto' }, // Collect address for tax
  success_url: 'https://example.com/success',
});

// 2. Retrieve tax calculation
const taxCalculation = await stripe.tax.calculations.create({
  currency: 'usd',
  line_items: [{
    amount: 1000,
    reference: 'L1',
  }],
  customer_details: {
    address: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
    address_source: 'shipping',
  },
});`
  },
  shipping: {
    title: "Shipping Rates",
    description: "Offer multiple shipping options and collect addresses during checkout.",
    code: `// 1. Create a Checkout Session with Shipping
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  shipping_address_collection: {
    allowed_countries: ['US', 'CA', 'GB'],
  },
  shipping_options: [
    {
      shipping_rate: 'shr_123', // Standard shipping
    },
    {
      shipping_rate: 'shr_456', // Express shipping
    },
  ],
  line_items: [{
    price: 'price_123',
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://example.com/success',
});`
  },
  disputes: {
    title: "Handling Disputes",
    description: "Manage chargebacks and submit evidence via the API.",
    code: `// 1. Retrieve a dispute
const dispute = await stripe.disputes.retrieve('dp_123');

// 2. Submit evidence to counter a dispute
const updatedDispute = await stripe.disputes.update('dp_123', {
  evidence: {
    customer_email_address: 'customer@example.com',
    customer_purchase_ip: '1.2.3.4',
    shipping_documentation: 'file_123', // File ID from Stripe
    uncategorized_text: 'The customer received the item on Jan 15th.',
  },
});

// 3. Close a dispute (if you accept it)
// await stripe.disputes.close('dp_123');`
  },
  identity: {
    title: "Identity Verification",
    description: "Verify the identity of your users using government-issued IDs and biometrics.",
    code: `// 1. Create a VerificationSession
const session = await stripe.identity.verificationSessions.create({
  type: 'document',
  options: {
    document: {
      require_id_number: true,
      require_matching_selfie: true,
    },
  },
});

// 2. Return the client secret to your frontend
const clientSecret = session.client_secret;

// 3. (Frontend) Use Stripe.js to open the modal
// stripe.verifyIdentity(clientSecret);`
  },
  issuing: {
    title: "Stripe Issuing",
    description: "Create and manage virtual and physical cards for your business or users.",
    code: `// 1. Create a Cardholder
const cardholder = await stripe.issuing.cardholders.create({
  name: 'Jenny Rosen',
  email: 'jenny.rosen@example.com',
  phone_number: '+18008675309',
  status: 'active',
  type: 'individual',
  billing: {
    address: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
  },
});

// 2. Create a virtual card
const card = await stripe.issuing.cards.create({
  cardholder: cardholder.id,
  currency: 'usd',
  type: 'virtual',
});`
  },
  terminal: {
    title: "Stripe Terminal",
    description: "Accept in-person payments with pre-certified readers and a unified API.",
    code: `// 1. Create a ConnectionToken (Server-side)
const token = await stripe.terminal.connectionTokens.create();

// 2. (Frontend) Initialize the SDK
// const terminal = StripeTerminal.create({
//   onFetchConnectionToken: () => token.secret,
// });

// 3. Create a PaymentIntent for Terminal
const intent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card_present'],
  capture_method: 'manual',
});`
  },
  treasury: {
    title: "Stripe Treasury",
    description: "Embed financial services like bank accounts and transfers into your platform.",
    code: `// 1. Create a FinancialAccount
const financialAccount = await stripe.treasury.financialAccounts.create({
  supported_currencies: ['usd'],
  features: {
    card_issuing: { requested: true },
    deposit_insurance: { requested: true },
    financial_addresses: { aba: { requested: true } },
  },
});

// 2. Retrieve account details
const abaDetails = financialAccount.financial_addresses[0].aba;`
  },
  billingSchedules: {
    title: "Subscription Schedules",
    description: "Automate complex subscription changes over time (e.g., trials then paid).",
    code: `// 1. Create a schedule for an existing subscription
const schedule = await stripe.subscriptionSchedules.create({
  from_subscription: 'sub_123',
});

// 2. Update the schedule with phases
await stripe.subscriptionSchedules.update(schedule.id, {
  phases: [
    {
      items: [{ price: 'price_trial', quantity: 1 }],
      iterations: 1,
    },
    {
      items: [{ price: 'price_paid', quantity: 1 }],
      iterations: 12,
    },
  ],
});`
  }
};

// --- Components ---

const Header = ({ onSearchOpen }: { onSearchOpen: () => void }) => (
  <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-md">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <div className="flex items-center gap-2 font-bold tracking-tight text-ink">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-lg shadow-accent/20">
          <CreditCard size={18} />
        </div>
        <span className="hidden sm:inline">Stripe Mastery Hub</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
        <button onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Generator</button>
        <button onClick={() => document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Recipes</button>
        <button onClick={() => document.getElementById('nocode')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">No-Code</button>
        <button onClick={() => document.getElementById('frameworks')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Frameworks</button>
        <button onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Guides</button>
        <button onClick={() => document.getElementById('best-practices')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Best Practices</button>
        <button onClick={() => document.getElementById('go-live')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Go-Live</button>
        <button onClick={() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Security</button>
      </nav>

      <div className="flex items-center gap-3">
        <button 
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg text-xs text-muted hover:border-accent hover:text-accent transition-all"
        >
          <Search size={14} />
          <span className="hidden lg:inline">Search documentation...</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-white px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        <a 
          href="https://stripe.com/docs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink/90 transition-all"
        >
          Official Docs <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </header>
);

const SearchModal = ({ isOpen, onClose, onSelectResult }: { isOpen: boolean, onClose: () => void, onSelectResult: (tab: keyof typeof CODE_SNIPPETS) => void }) => {
  const [query, setQuery] = useState("");
  
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (Object.keys(CODE_SNIPPETS) as Array<keyof typeof CODE_SNIPPETS>)
      .filter(key => 
        CODE_SNIPPETS[key].title.toLowerCase().includes(q) || 
        CODE_SNIPPETS[key].description.toLowerCase().includes(q) ||
        CODE_SNIPPETS[key].code.toLowerCase().includes(q)
      )
      .map(key => ({ key, ...CODE_SNIPPETS[key] }));
  }, [query]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-20 bg-ink/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="text-muted" size={20} />
          <input 
            autoFocus
            type="text" 
            placeholder="Search for snippets, guides, or keywords..."
            className="flex-grow bg-transparent outline-none text-lg py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={res.key}
                  onClick={() => {
                    onSelectResult(res.key);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-bg text-left transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                    <Code2 size={20} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-ink">{res.title}</h4>
                    <p className="text-xs text-muted line-clamp-1">{res.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg mb-4">
                <Search size={24} className="text-muted" />
              </div>
              <p className="text-muted">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-4">Quick Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['checkout', 'webhooks', 'subscriptions', 'connect'] as Array<keyof typeof CODE_SNIPPETS>).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      onSelectResult(key);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
                  >
                    <div className="h-8 w-8 rounded-lg bg-bg flex items-center justify-center">
                      <Zap size={16} className="text-accent" />
                    </div>
                    <span className="text-sm font-medium">{CODE_SNIPPETS[key].title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-bg/50 flex items-center justify-between text-[10px] text-muted font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-white px-1">↵</kbd> to select</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-white px-1">esc</kbd> to close</span>
          </div>
          <span>Stripe Mastery Search</span>
        </div>
      </motion.div>
    </div>
  );
};

const Hero = () => (
  <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
    <div className="data-grid absolute inset-0 -z-10 opacity-40" />
    <div className="container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={12} />
          The Ultimate Stripe Resource
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-ink max-w-4xl mx-auto leading-[1.1]">
          Master Stripe integrations <br />
          <span className="text-accent">with confidence.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          From no-code payment links to complex webhook architectures. Architect, implement, and scale your payment flows with ease.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
          >
            Start Building <ArrowRight size={16} />
          </button>
          <button
            onClick={() => document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-bg transition-all"
          >
            View Recipes
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const RecipeCard = ({ title, description, icon: Icon, steps, targetTab, onSelectGuide }: { title: string, description: string, icon: any, steps: string[], targetTab: keyof typeof CODE_SNIPPETS, onSelectGuide: (tab: keyof typeof CODE_SNIPPETS) => void }) => (
  <div className="glass-card p-6 flex flex-col h-full">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
      <Icon size={20} />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-muted mb-6 flex-grow">{description}</p>
    <ul className="space-y-2 mb-6">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted">
          <CheckCircle2 size={14} className="mt-0.5 text-accent shrink-0" />
          {step}
        </li>
      ))}
    </ul>
    <button 
      onClick={() => {
        onSelectGuide(targetTab);
        document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
    >
      Learn more <ChevronRight size={14} />
    </button>
  </div>
);

const FrameworksSection = () => (
  <section id="frameworks" className="py-24 bg-white border-y border-border">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Endless Tech Support</h2>
        <p className="text-muted max-w-xl mx-auto">Stripe works with virtually every modern (and legacy) stack. Here are just a few we support.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
        {FRAMEWORKS.map((fw, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.01 }}
            className="px-4 py-2 rounded-full border border-border bg-bg text-xs font-medium text-muted hover:border-accent hover:text-accent transition-all cursor-default"
          >
            {fw}
          </motion.span>
        ))}
      </div>
    </div>
  </section>
);

const CodeGuides = ({ activeTab, onTabChange }: { activeTab: keyof typeof CODE_SNIPPETS, onTabChange: (tab: keyof typeof CODE_SNIPPETS) => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="guides" className="py-24 bg-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Implementation Guides</h2>
            <p className="text-muted">Real-world code for the most common integration patterns.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-2">
              {(Object.keys(CODE_SNIPPETS) as Array<keyof typeof CODE_SNIPPETS>).map((key) => (
                <button
                  key={key}
                  onClick={() => onTabChange(key)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                    activeTab === key 
                      ? "bg-white border-accent shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-white/50"
                  )}
                >
                  <div>
                    <h4 className={cn("font-bold text-sm", activeTab === key ? "text-accent" : "text-ink")}>
                      {CODE_SNIPPETS[key].title}
                    </h4>
                    <p className="text-xs text-muted mt-1 line-clamp-1">{CODE_SNIPPETS[key].description}</p>
                  </div>
                  <ChevronRight size={16} className={activeTab === key ? "text-accent" : "text-muted"} />
                </button>
              ))}
            </div>

            <div className="lg:col-span-8">
              <div className="glass-card overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-border bg-white">
                  <h3 className="text-xl font-bold mb-2">{CODE_SNIPPETS[activeTab].title}</h3>
                  <p className="text-sm text-muted">{CODE_SNIPPETS[activeTab].description}</p>
                </div>
                <div className="flex-grow bg-ink p-6 font-mono text-xs overflow-x-auto">
                  <pre className="text-white leading-relaxed">
                    <code>{CODE_SNIPPETS[activeTab].code}</code>
                  </pre>
                </div>
                <div className="p-4 bg-bg/50 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted">Example Implementation</span>
                  <button 
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    {copied ? "Copied!" : "Copy Code"} {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Terminal size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PROMPT_LIBRARY = [
  {
    icon: Zap,
    title: "SaaS Starter",
    prompt: "I want to build a SaaS with 3 pricing tiers (Basic, Pro, Enterprise) and a 14-day free trial using Stripe Checkout.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Globe,
    title: "Marketplace",
    prompt: "I'm building a marketplace where sellers get 90% of the sale and I take a 10% platform fee using Stripe Connect.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: CreditCard,
    title: "E-commerce",
    prompt: "I need an e-commerce flow with dynamic shipping rates based on the customer's location and Stripe Tax enabled.",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: Sparkles,
    title: "Usage Billing",
    prompt: "I want to implement usage-based billing for an API service where users are charged per 1,000 requests at the end of the month.",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    prompt: "I'm building a mobile app and want to support Apple Pay and Google Pay for one-click digital product purchases.",
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  },
  {
    icon: Database,
    title: "Supabase Sync",
    prompt: "I need to sync Stripe subscription status to my Supabase 'profiles' table using webhooks and edge functions.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
];

const FlowGenerator = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      const result = await generateStripeFlow(input);
      setResponse(result);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error(error);
      setResponse(error instanceof Error ? error.message : "Failed to generate flow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="generator" className="py-20 bg-white border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI Flow Architect</h2>
            <p className="text-muted">Describe your specific integration needs and get a custom blueprint. If AI is not configured on this deployment, this section will stay in coming-soon mode.</p>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Sparkles size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Inspiration Library</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {PROMPT_LIBRARY.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInput(item.prompt)}
                  className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-white hover:border-accent hover:shadow-md transition-all text-center"
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-ink leading-tight">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-bg p-2 shadow-xl focus-within:border-accent/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I want to build a marketplace using Next.js and Stripe Connect, where sellers get 80% of the sale.'"
                className="w-full min-h-[120px] bg-transparent p-4 text-lg outline-none resize-none"
              />
              <div className="flex items-center justify-between p-2 border-t border-border/50">
                <div className="flex items-center gap-4 px-2 text-xs text-muted">
                  <span className="flex items-center gap-1"><Zap size={12} /> Fast</span>
                  <span className="flex items-center gap-1"><Terminal size={12} /> Code-ready</span>
                </div>
                <button
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Architect Flow
                </button>
              </div>
            </div>
          </form>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
                ref={resultRef}
              >
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-border bg-bg/50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted">
                      <Code2 size={14} />
                      CUSTOM_BLUEPRINT.md
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                    </div>
                  </div>
                  <div className="p-8 prose prose-sm max-w-none prose-headings:text-ink prose-p:text-muted prose-strong:text-ink prose-code:text-accent prose-pre:bg-ink prose-pre:text-white">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Recipes = ({ onSelectGuide }: { onSelectGuide: (tab: keyof typeof CODE_SNIPPETS) => void }) => (
  <section id="recipes" className="py-24 bg-bg">
    <div className="container mx-auto px-4">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Common Blueprints</h2>
        <p className="text-muted max-w-xl mx-auto">Battle-tested flows for common integration scenarios.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RecipeCard
          title="Simple Checkout"
          description="Perfect for one-off sales or donations. No backend required."
          icon={Globe}
          targetTab="paymentLinks"
          onSelectGuide={onSelectGuide}
          steps={[
            "Create Product in Stripe",
            "Generate Payment Link",
            "Add Link to your Website",
            "Track manually in Dashboard"
          ]}
        />
        <RecipeCard
          title="Supabase Sync"
          description="Capture user IDs and sync payment status to your database automatically."
          icon={Database}
          targetTab="webhooks"
          onSelectGuide={onSelectGuide}
          steps={[
            "Add ?client_reference_id={uid} to URL",
            "Set up Stripe Webhook",
            "Create Supabase Edge Function",
            "Update user status on 'checkout.session.completed'"
          ]}
        />
        <RecipeCard
          title="SaaS Subscriptions"
          description="Full recurring billing flow with customer portal for management."
          icon={Zap}
          targetTab="subscriptions"
          onSelectGuide={onSelectGuide}
          steps={[
            "Define Pricing Tiers",
            "Implement Customer Portal",
            "Handle Subscription Webhooks",
            "Manage Grace Periods & Retries"
          ]}
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border bg-white py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-white">
            <CreditCard size={14} />
          </div>
          <span className="font-bold tracking-tight">Stripe Mastery Hub</span>
        </div>
        <div className="flex gap-8 text-sm text-muted">
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">Privacy</a>
          <a href="https://stripe.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">Terms</a>
          <a href="https://twitter.com/stripe" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">Twitter</a>
          <a href="https://github.com/stripe" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">GitHub</a>
        </div>
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} Stripe Mastery Hub. Built for the modern web.
        </p>
      </div>
    </div>
  </footer>
);

const BestPractices = () => (
  <section id="best-practices" className="py-24 bg-white border-b border-border">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Best Practices</h2>
          <p className="text-muted max-w-xl mx-auto">Follow these industry standards to ensure a robust and scalable integration.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-bg border border-border">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="font-bold mb-2">Idempotency</h3>
            <p className="text-sm text-muted">Always use idempotency keys for POST requests to prevent duplicate charges in case of network retries.</p>
          </div>
          <div className="p-6 rounded-2xl bg-bg border border-border">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Database size={20} />
            </div>
            <h3 className="font-bold mb-2">Metadata</h3>
            <p className="text-sm text-muted">Store your internal IDs (User ID, Order ID) in Stripe metadata to easily link records during webhooks.</p>
          </div>
          <div className="p-6 rounded-2xl bg-bg border border-border">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold mb-2">Version Management</h3>
            <p className="text-sm text-muted">Pin your API version in your code to avoid breaking changes when Stripe updates their API.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CommonPitfalls = () => (
  <section id="pitfalls" className="py-24 bg-bg">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-500">Common Pitfalls</h2>
          <p className="text-muted max-w-xl mx-auto">Avoid these frequent mistakes that can lead to lost revenue or security issues.</p>
        </div>
        
        <div className="space-y-4">
          {[
            {
              title: "Hardcoding Price IDs",
              solution: "Use environment variables or fetch prices dynamically to avoid code changes when updating products."
            },
            {
              title: "Ignoring Webhook Failures",
              solution: "Implement a retry mechanism and log all webhook errors. Use Stripe's 'Events' dashboard to debug."
            },
            {
              title: "Mixing Test & Live Keys",
              solution: "Strictly separate your environments. Never use live keys in your development or staging environments."
            },
            {
              title: "Not Handling Card Declines",
              solution: "Provide clear feedback to users when a payment fails. Use Stripe's decline codes to explain why."
            }
          ].map((pitfall, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-border flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <X size={20} />
              </div>
              <div>
                <h4 className="font-bold mb-1">{pitfall.title}</h4>
                <p className="text-sm text-muted">{pitfall.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const GoLiveChecklist = () => (
  <section id="go-live" className="py-24 bg-white border-b border-border">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Go-Live Checklist</h2>
          <p className="text-muted max-w-xl mx-auto">Don't flip the switch until you've checked these boxes. A smooth launch is a successful launch.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Switch to Live Keys",
              desc: "Replace all pk_test and sk_test keys with pk_live and sk_live keys in your production environment variables."
            },
            {
              title: "Configure Live Webhooks",
              desc: "Create a new webhook endpoint in the Stripe Dashboard for your production URL and update the signing secret."
            },
            {
              title: "Verify Bank Account",
              desc: "Ensure your bank account is verified in the Stripe Dashboard to receive payouts."
            },
            {
              title: "Check Branding",
              desc: "Upload your logo and set your brand colors in the Stripe Dashboard for a consistent customer experience."
            },
            {
              title: "Test Real Transactions",
              desc: "Perform a small real transaction in live mode to ensure everything (including webhooks) works as expected."
            },
            {
              title: "Review Tax Settings",
              desc: "Confirm your tax registrations and settings are correct for the jurisdictions where you operate."
            }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-bg/30 flex items-start gap-4">
              <div className="mt-1 h-5 w-5 rounded-full border-2 border-accent flex items-center justify-center shrink-0">
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 rounded-3xl bg-accent text-white text-center">
          <h3 className="text-xl font-bold mb-4">Ready to scale?</h3>
          <p className="text-accent-foreground/80 mb-8 max-w-lg mx-auto">Once you're live, monitor your dashboard for successful payments and any webhook delivery failures.</p>
          <a 
            href="https://dashboard.stripe.com/login" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-accent font-bold hover:bg-bg transition-all"
          >
            Go to Stripe Dashboard <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  </section>
);

const DeveloperFAQ = () => (
  <section id="faq" className="py-24 bg-white border-t border-border">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Developer FAQ</h2>
          <p className="text-muted">Quick answers to common technical questions.</p>
        </div>
        
        <div className="space-y-6">
          {[
            {
              q: "How do I handle SCA (Strong Customer Authentication)?",
              a: "Stripe Checkout and Payment Element handle SCA automatically. If you're using the API directly, use PaymentIntents which support the 'requires_action' status for 3D Secure."
            },
            {
              q: "What's the difference between a 'Price' and a 'Product'?",
              a: "A Product represents what you're selling (e.g., 'Gold Plan'). A Price represents how much and how often you charge (e.g., '$20/month'). One Product can have multiple Prices."
            },
            {
              q: "Can I use Stripe for crypto payments?",
              a: "Stripe supports USDC via the 'crypto' payment method in certain regions. Check the documentation for the latest availability."
            },
            {
              q: "How do I test webhooks locally?",
              a: "Use the Stripe CLI: 'stripe listen --forward-to localhost:3000/webhook'. This creates a secure tunnel to your local server."
            },
            {
              q: "Is there a limit to metadata?",
              a: "Yes, you can store up to 50 keys, and both keys and values must be strings. Total metadata size is limited to 40KB per object."
            }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-bg/10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Info size={16} className="text-accent" /> {item.q}
              </h4>
              <p className="text-sm text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const SecuritySection = () => {
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <section id="security" className="py-24 bg-bg relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto glass-card p-10 md:p-16 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-8 text-red-500">
            <ShieldCheck size={24} />
            <h2 className="text-2xl font-bold text-ink">Security & Secrets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Server size={18} className="text-red-500" /> Server-Side Only
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Never expose your <code className="text-red-500 font-bold">Secret Key (sk_...)</code> in client-side code. This key gives full access to your Stripe account. Always use environment variables on your server.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Webhook size={18} className="text-red-500" /> Webhook Verification
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Always verify webhook signatures using your <code className="text-red-500 font-bold">Webhook Secret (whsec_...)</code>. This ensures the request actually came from Stripe and hasn't been tampered with.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono text-muted">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> PCI Compliant</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> TLS 1.2+</span>
            </div>
            <button 
              onClick={() => setShowChecklist(true)}
              className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:underline"
            >
              Security Checklist <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showChecklist && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowChecklist(false)}
                className="absolute top-6 right-6 p-2 hover:bg-bg rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-red-500" /> Security Checklist
              </h3>
              <ul className="space-y-4 mb-8">
                {[
                  "Use environment variables for all sk_ keys",
                  "Verify webhook signatures in production",
                  "Never log raw request bodies or secrets",
                  "Use restricted keys for specific integrations",
                  "Enable 2FA on your Stripe Dashboard",
                  "Monitor your account for unusual activity"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted">
                    <div className="mt-1 h-4 w-4 rounded border border-border flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowChecklist(false)}
                className="w-full py-3 rounded-xl bg-ink text-white font-bold text-sm hover:bg-ink/90 transition-all"
              >
                Got it, stay safe!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default function App() {
  const [activeGuideTab, setActiveGuideTab] = useState<keyof typeof CODE_SNIPPETS>("checkout");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectResult = (tab: keyof typeof CODE_SNIPPETS) => {
    setActiveGuideTab(tab);
    setTimeout(() => {
      document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen selection:bg-accent/20 selection:text-accent">
      <Header onSearchOpen={() => setIsSearchOpen(true)} />
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectResult={handleSelectResult}
      />
      <main>
        <Hero />
        <FlowGenerator />
        <Recipes onSelectGuide={setActiveGuideTab} />
        <NoCodeSection />
        <FrameworksSection />
        <CodeGuides activeTab={activeGuideTab} onTabChange={setActiveGuideTab} />
        <BestPractices />
        <CommonPitfalls />
        <GoLiveChecklist />
        <DeveloperFAQ />
        <SecuritySection />
        
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass-card p-10 md:p-16">
              <div className="flex items-center gap-3 mb-8 text-accent">
                <Info size={24} />
                <h2 className="text-2xl font-bold text-ink">The 3-Step Integration Secret</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                  <div className="mb-4 text-4xl font-black text-accent/20">01</div>
                  <h4 className="font-bold mb-2">Stripe Dashboard</h4>
                  <p className="text-sm text-muted">Create your products and set up webhooks. This is where the money happens.</p>
                </div>
                <div>
                  <div className="mb-4 text-4xl font-black text-accent/20">02</div>
                  <h4 className="font-bold mb-2">Your Website</h4>
                  <p className="text-sm text-muted">Direct users to checkout. Use metadata to keep track of who is buying what.</p>
                </div>
                <div>
                  <div className="mb-4 text-4xl font-black text-accent/20">03</div>
                  <h4 className="font-bold mb-2">Your Database</h4>
                  <p className="text-sm text-muted">Listen for webhooks and update your records. This is where the magic happens.</p>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted italic">"It's technically only three places, but everything must be straightforward."</p>
                <button 
                  onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 text-sm font-bold text-accent"
                >
                  Read Full Guide <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
