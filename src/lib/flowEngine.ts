export type FlowCategory =
  | 'checkout'
  | 'subscriptions'
  | 'usage'
  | 'connect'
  | 'webhooks';

export type CodeLanguage = 'node' | 'python' | 'go' | 'nextjs';

export interface FlowBlueprint {
  id: FlowCategory;
  title: string;
  eyebrow: string;
  summary: string;
  detectedPrompt?: string;
  apiPrimitives: string[];
  requiredEvents: string[];
  envVars: string[];
  dashboardSteps: string[];
  backendSteps: string[];
  frontendSteps: string[];
  code: Record<CodeLanguage, { filename: string; snippet: string }>;
  notes: string[];
}

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  node: 'Node / TypeScript',
  python: 'Python',
  go: 'Go',
  nextjs: 'Next.js (App Router)',
};

export const FLOW_BLUEPRINTS: Record<FlowCategory, FlowBlueprint> = {
  checkout: {
    id: 'checkout',
    title: 'Hosted Checkout & Fulfillment',
    eyebrow: '01 · ONE-TIME PAYMENTS',
    summary:
      'Redirect customers to a Stripe-hosted Checkout Session with automatic SCA/3DS, Apple Pay, Google Pay, and idempotent webhook fulfillment.',
    apiPrimitives: ['checkout.sessions', 'prices', 'events', 'payment_intents'],
    requiredEvents: [
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'checkout.session.expired',
    ],
    envVars: [
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_WEBHOOK_SECRET=whsec_...',
      'STRIPE_PRICE_ID=price_123',
      'APP_BASE_URL=https://app.example.com',
    ],
    dashboardSteps: [
      'Create a Product and Price in Stripe Dashboard and copy the price_... ID into environment variables.',
      'Configure Branding (icon, accent color, return URL) under Settings > Branding.',
      'Register your production webhook endpoint for checkout.session.completed and async payment events.',
      'Enable desired payment methods (Cards, Link, Apple Pay, Google Pay) in Payment Methods settings.',
    ],
    backendSteps: [
      'Create POST /api/checkout on your server; never trust client-supplied prices—look up price IDs server-side.',
      'Attach client_reference_id and metadata (orderId, userId) plus an Idempotency-Key header.',
      'Verify Stripe-Signature on POST /api/webhooks/stripe using the raw request body buffer.',
      'Fulfill orders inside an idempotent database transaction keyed by event.id or session.id.',
    ],
    frontendSteps: [
      'POST the selected SKU/quantity to your backend endpoint and show a disabled loading state.',
      'Redirect the browser to session.url returned by your backend.',
      'Render a confirmation state on /checkout/success?session_id={CHECKOUT_SESSION_ID} while polling or reading fulfillment status from your DB.',
      'Preserve cart state if the user returns to cancel_url.',
    ],
    notes: [
      'Fulfill orders from checkout.session.completed (checking payment_status === "paid"), never solely from the success_url redirect.',
      'Pass automatic_tax: { enabled: true } when Stripe Tax registrations are active.',
    ],
    code: {
      node: {
        filename: 'server/checkout.ts',
        snippet: `import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const app = express();

app.post('/api/checkout', express.json(), async (req, res) => {
  const { userId, orderId, quantity = 1 } = req.body;

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity }],
      client_reference_id: userId,
      metadata: { orderId, userId },
      automatic_tax: { enabled: true },
      success_url: \`\${process.env.APP_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.APP_BASE_URL}/checkout/cancel\`,
    },
    { idempotencyKey: \`checkout_\${orderId}\` }
  );

  res.json({ url: session.url, id: session.id });
});`,
      },
      python: {
        filename: 'checkout.py',
        snippet: `import os
import stripe
from fastapi import FastAPI
from pydantic import BaseModel

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
app = FastAPI()

class CheckoutRequest(BaseModel):
    user_id: str
    order_id: str
    quantity: int = 1

@app.post("/api/checkout")
def create_checkout(payload: CheckoutRequest):
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": os.environ["STRIPE_PRICE_ID"], "quantity": payload.quantity}],
        client_reference_id=payload.user_id,
        metadata={"order_id": payload.order_id, "user_id": payload.user_id},
        automatic_tax={"enabled": True},
        success_url=f"{os.environ['APP_BASE_URL']}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{os.environ['APP_BASE_URL']}/checkout/cancel",
        idempotency_key=f"checkout_{payload.order_id}",
    )
    return {"url": session.url, "id": session.id}`,
      },
      go: {
        filename: 'checkout.go',
        snippet: `package payments

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

func CreateCheckoutHandler(w http.ResponseWriter, r *http.Request) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	var body struct {
		UserID   string \`json:"userId"\`
		OrderID  string \`json:"orderId"\`
		Quantity int64  \`json:"quantity"\`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	params := &stripe.CheckoutSessionParams{
		Mode:              stripe.String(string(stripe.CheckoutSessionModePayment)),
		ClientReferenceID: stripe.String(body.UserID),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(os.Getenv("STRIPE_PRICE_ID")), Quantity: stripe.Int64(max(body.Quantity, 1))},
		},
		SuccessURL: stripe.String(os.Getenv("APP_BASE_URL") + "/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(os.Getenv("APP_BASE_URL") + "/checkout/cancel"),
	}
	params.AddMetadata("orderId", body.OrderID)
	params.SetIdempotencyKey("checkout_" + body.OrderID)

	sess, err := session.New(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"url": sess.URL, "id": sess.ID})
}`,
      },
      nextjs: {
        filename: 'app/api/checkout/route.ts',
        snippet: `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { userId, orderId, quantity = 1 } = await request.json();

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity }],
      client_reference_id: userId,
      metadata: { orderId, userId },
      success_url: \`\${process.env.APP_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.APP_BASE_URL}/checkout/cancel\`,
    },
    { idempotencyKey: \`checkout_\${orderId}\` }
  );

  return NextResponse.json({ url: session.url, id: session.id });
}`,
      },
    },
  },

  subscriptions: {
    id: 'subscriptions',
    title: 'SaaS Subscriptions & Customer Portal',
    eyebrow: '02 · RECURRING BILLING',
    summary:
      'Tiered recurring billing with trials, proration, self-service Stripe Customer Portal, and webhook-driven entitlement sync.',
    apiPrimitives: [
      'customers',
      'checkout.sessions (mode=subscription)',
      'billingPortal.sessions',
      'subscriptions',
    ],
    requiredEvents: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
    ],
    envVars: [
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_WEBHOOK_SECRET=whsec_...',
      'STRIPE_PRICE_PRO_MONTHLY=price_pro_mo',
      'STRIPE_PRICE_PRO_YEARLY=price_pro_yr',
    ],
    dashboardSteps: [
      'Create recurring Products & Prices (monthly/annual) and store price IDs in server configuration.',
      'Configure Billing > Customer Portal (allowed plan switches, cancellation timing, invoice history).',
      'Configure Billing > Revenue Recovery (Smart Retries and past-due grace period emails).',
      'Subscribe your webhook endpoint to subscription and invoice lifecycle events.',
    ],
    backendSteps: [
      'Persist stripe_customer_id, stripe_subscription_id, plan_price_id, status, and current_period_end on your user/org table.',
      'Reuse an existing stripe_customer_id when opening Checkout or Customer Portal to prevent duplicate Customer objects.',
      'Upsert entitlement state exclusively from webhook handlers (active, trialing, past_due, canceled).',
      'Expose POST /api/billing/portal to redirect authenticated users to Stripe Billing Portal.',
    ],
    frontendSteps: [
      'Display monthly/annual pricing cards backed by server-validated plan slugs (not raw Stripe price IDs).',
      'Provide a "Manage Billing" button in account settings that opens the Customer Portal URL.',
      'Show a clear past-due banner when subscription.status === "past_due" with a one-click portal link to update the card.',
    ],
    notes: [
      'Treat trialing and active as entitled; decide explicitly whether past_due gets a read-only grace window.',
      'Test renewals and dunning flows quickly using Stripe Test Clocks.',
    ],
    code: {
      node: {
        filename: 'server/subscriptions.ts',
        snippet: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function createSubscriptionCheckout(params: {
  orgId: string;
  customerId: string;
  priceId: string;
  trialDays?: number;
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: params.trialDays,
      metadata: { orgId: params.orgId },
    },
    success_url: \`\${process.env.APP_BASE_URL}/billing?status=active\`,
    cancel_url: \`\${process.env.APP_BASE_URL}/pricing\`,
  });
}

export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: \`\${process.env.APP_BASE_URL}/settings/billing\`,
  });
}`,
      },
      python: {
        filename: 'subscriptions.py',
        snippet: `import os
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

def create_subscription_checkout(org_id: str, customer_id: str, price_id: str, trial_days: int = 14):
    return stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        allow_promotion_codes=True,
        subscription_data={
            "trial_period_days": trial_days,
            "metadata": {"org_id": org_id},
        },
        success_url=f"{os.environ['APP_BASE_URL']}/billing?status=active",
        cancel_url=f"{os.environ['APP_BASE_URL']}/pricing",
    )

def create_billing_portal_session(customer_id: str):
    return stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{os.environ['APP_BASE_URL']}/settings/billing",
    )`,
      },
      go: {
        filename: 'subscriptions.go',
        snippet: `package billing

import (
	"os"

	"github.com/stripe/stripe-go/v81"
	portalSession "github.com/stripe/stripe-go/v81/billingportal/session"
	checkoutSession "github.com/stripe/stripe-go/v81/checkout/session"
)

func CreateSubscriptionCheckout(orgID, customerID, priceID string, trialDays int64) (*stripe.CheckoutSession, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	params := &stripe.CheckoutSessionParams{
		Mode:                stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		Customer:            stripe.String(customerID),
		AllowPromotionCodes: stripe.Bool(true),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(priceID), Quantity: stripe.Int64(1)},
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			TrialPeriodDays: stripe.Int64(trialDays),
			Metadata:        map[string]string{"orgId": orgID},
		},
		SuccessURL: stripe.String(os.Getenv("APP_BASE_URL") + "/billing?status=active"),
		CancelURL:  stripe.String(os.Getenv("APP_BASE_URL") + "/pricing"),
	}
	return checkoutSession.New(params)
}

func CreateBillingPortal(customerID string) (*stripe.BillingPortalSession, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return portalSession.New(&stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(os.Getenv("APP_BASE_URL") + "/settings/billing"),
	})
}`,
      },
      nextjs: {
        filename: 'app/api/billing/portal/route.ts',
        snippet: `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { customerId } = await request.json();
  if (!customerId) {
    return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: \`\${process.env.APP_BASE_URL}/settings/billing\`,
  });

  return NextResponse.json({ url: portal.url });
}`,
      },
    },
  },

  usage: {
    id: 'usage',
    title: 'Usage-Based Metered Billing',
    eyebrow: '03 · METERED API BILLING',
    summary:
      'Report high-throughput API calls, tokens, or compute units to Stripe Billing Meters with deduplicated identifiers and period-end invoicing.',
    apiPrimitives: [
      'billing.meters',
      'billing.meterEvents',
      'subscriptions',
      'invoices.createPreview',
    ],
    requiredEvents: [
      'invoice.created',
      'invoice.finalized',
      'invoice.paid',
      'invoice.payment_failed',
      'billing.alert.triggered',
    ],
    envVars: [
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_METER_EVENT_NAME=api_requests',
      'STRIPE_METERED_PRICE_ID=price_metered_123',
    ],
    dashboardSteps: [
      'Create a Billing Meter (e.g., event_name: "api_requests", aggregation: "sum") in Stripe Billing > Meters.',
      'Attach a usage-based Price (per-unit or graduated tiers) linked to that Meter.',
      'Optionally configure Usage Alerts to notify customers before spend crosses thresholds.',
    ],
    backendSteps: [
      'Emit meter events asynchronously from a worker/queue rather than blocking hot API paths.',
      'Provide a deterministic identifier per event (e.g., reqId or hourly bucket key) to guarantee exactly-once metering.',
      'Query stripe.invoices.createPreview({ customer }) to show live accrued charges in your dashboard.',
      'Listen to invoice.created if you need to inspect or append line items before finalization.',
    ],
    frontendSteps: [
      'Render a live usage bar comparing current billing cycle consumption against soft spend alerts.',
      'Display upcoming invoice previews broken down by metered unit volume and base seat fee.',
    ],
    notes: [
      'Use Stripe Billing Meters (billing.meterEvents.create) instead of deprecated SubscriptionItem usage records.',
      'Batch or aggregate high-frequency events (e.g., per minute per customer) to stay well within API rate limits.',
    ],
    code: {
      node: {
        filename: 'server/metering.ts',
        snippet: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function recordApiUsage(params: {
  stripeCustomerId: string;
  units: number;
  idempotencyId: string;
  timestamp?: number;
}) {
  return stripe.billing.meterEvents.create({
    event_name: process.env.STRIPE_METER_EVENT_NAME || 'api_requests',
    identifier: params.idempotencyId,
    timestamp: params.timestamp ?? Math.floor(Date.now() / 1000),
    payload: {
      stripe_customer_id: params.stripeCustomerId,
      value: String(params.units),
    },
  });
}

export async function previewUpcomingInvoice(customerId: string) {
  return stripe.invoices.createPreview({ customer: customerId });
}`,
      },
      python: {
        filename: 'metering.py',
        snippet: `import os
import time
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

def record_api_usage(stripe_customer_id: str, units: int, idempotency_id: str):
    return stripe.billing.MeterEvent.create(
        event_name=os.environ.get("STRIPE_METER_EVENT_NAME", "api_requests"),
        identifier=idempotency_id,
        timestamp=int(time.time()),
        payload={
            "stripe_customer_id": stripe_customer_id,
            "value": str(units),
        },
    )

def preview_upcoming_invoice(customer_id: str):
    return stripe.Invoice.create_preview(customer=customer_id)`,
      },
      go: {
        filename: 'metering.go',
        snippet: `package metering

import (
	"os"
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/billing/meterevent"
)

func RecordUsage(customerID string, units int64, identifier string) (*stripe.BillingMeterEvent, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	return meterevent.New(&stripe.BillingMeterEventParams{
		EventName:  stripe.String(os.Getenv("STRIPE_METER_EVENT_NAME")),
		Identifier: stripe.String(identifier),
		Timestamp:  stripe.Int64(time.Now().Unix()),
		Payload: map[string]string{
			"stripe_customer_id": customerID,
			"value":              strconv.FormatInt(units, 10),
		},
	})
}`,
      },
      nextjs: {
        filename: 'app/api/usage/route.ts',
        snippet: `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { customerId, units, eventId } = await request.json();

  const event = await stripe.billing.meterEvents.create({
    event_name: process.env.STRIPE_METER_EVENT_NAME || 'api_requests',
    identifier: eventId,
    payload: {
      stripe_customer_id: customerId,
      value: String(units),
    },
  });

  return NextResponse.json({ identifier: event.identifier, recorded: true });
}`,
      },
    },
  },

  connect: {
    id: 'connect',
    title: 'Stripe Connect Marketplace Splits',
    eyebrow: '04 · MULTI-PARTY MARKETPLACE',
    summary:
      'Onboard sellers with Express accounts, collect platform application fees via Destination Charges, and track payout readiness via Connect webhooks.',
    apiPrimitives: [
      'accounts',
      'accountLinks',
      'paymentIntents (transfer_data)',
      'application_fee_amount',
    ],
    requiredEvents: [
      'account.updated',
      'payment_intent.succeeded',
      'transfer.created',
      'payout.paid',
      'payout.failed',
    ],
    envVars: [
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_CONNECT_WEBHOOK_SECRET=whsec_connect_...',
      'PLATFORM_FEE_BPS=1000',
    ],
    dashboardSteps: [
      'Enable Stripe Connect in Dashboard and choose your platform profile (Marketplace / SaaS).',
      'Configure Connect branding (logo, icon, brand color) for hosted onboarding flows.',
      'Create a dedicated Connect webhook endpoint (listening to events on Connected accounts) for account.updated.',
    ],
    backendSteps: [
      'Create an Express connected account (stripe.accounts.create) and store acct_... on the seller record.',
      'Generate single-use Account Links for KYC onboarding and handle refresh_url gracefully when links expire.',
      'Create Destination Charges with application_fee_amount and transfer_data.destination.',
      'Gate seller listing activation on charges_enabled && payouts_enabled from account.updated.',
    ],
    frontendSteps: [
      'Show seller onboarding status badges (Incomplete, Pending Verification, Payouts Active).',
      'Provide a "Continue Onboarding" CTA that requests a fresh Account Link on click (never cache expired links).',
      'Surface transparent net payout calculations (gross minus platform fee and Stripe fee) in the seller dashboard.',
    ],
    notes: [
      'Remember that destination charges place Stripe processing fees and dispute liability on the platform unless using on_behalf_of / direct charges.',
      'Always use separate webhook secrets for platform events vs Connect account events.',
    ],
    code: {
      node: {
        filename: 'server/connect.ts',
        snippet: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function onboardSeller(sellerEmail: string, sellerId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email: sellerEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { sellerId },
  });

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: \`\${process.env.APP_BASE_URL}/seller/onboarding/refresh\`,
    return_url: \`\${process.env.APP_BASE_URL}/seller/dashboard\`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, url: onboardingLink.url };
}

export async function createMarketplaceCharge(params: {
  amountCents: number;
  sellerAccountId: string;
  platformFeeBps: number; // e.g., 1000 = 10%
  orderId: string;
}) {
  const applicationFee = Math.round((params.amountCents * params.platformFeeBps) / 10_000);

  return stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      application_fee_amount: applicationFee,
      transfer_data: { destination: params.sellerAccountId },
      metadata: { orderId: params.orderId },
    },
    { idempotencyKey: \`mp_pi_\${params.orderId}\` }
  );
}`,
      },
      python: {
        filename: 'connect.py',
        snippet: `import os
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

def onboard_seller(seller_email: str, seller_id: str):
    account = stripe.Account.create(
        type="express",
        email=seller_email,
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
        metadata={"seller_id": seller_id},
    )
    link = stripe.AccountLink.create(
        account=account.id,
        refresh_url=f"{os.environ['APP_BASE_URL']}/seller/onboarding/refresh",
        return_url=f"{os.environ['APP_BASE_URL']}/seller/dashboard",
        type="account_onboarding",
    )
    return {"account_id": account.id, "url": link.url}

def create_marketplace_charge(amount_cents: int, seller_account_id: str, fee_bps: int, order_id: str):
    application_fee = round(amount_cents * fee_bps / 10_000)
    return stripe.PaymentIntent.create(
        amount=amount_cents,
        currency="usd",
        automatic_payment_methods={"enabled": True},
        application_fee_amount=application_fee,
        transfer_data={"destination": seller_account_id},
        metadata={"order_id": order_id},
        idempotency_key=f"mp_pi_{order_id}",
    )`,
      },
      go: {
        filename: 'connect.go',
        snippet: `package marketplace

import (
	"math"
	"os"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
)

func CreateDestinationCharge(amountCents int64, sellerAccountID string, feeBps int64, orderID string) (*stripe.PaymentIntent, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	appFee := int64(math.Round(float64(amountCents*feeBps) / 10000.0))

	params := &stripe.PaymentIntentParams{
		Amount:               stripe.Int64(amountCents),
		Currency:             stripe.String(string(stripe.CurrencyUSD)),
		ApplicationFeeAmount: stripe.Int64(appFee),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
		TransferData: &stripe.PaymentIntentTransferDataParams{
			Destination: stripe.String(sellerAccountID),
		},
	}
	params.AddMetadata("orderId", orderID)
	params.SetIdempotencyKey("mp_pi_" + orderID)

	return paymentintent.New(params)
}`,
      },
      nextjs: {
        filename: 'app/api/connect/charge/route.ts',
        snippet: `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { amountCents, sellerAccountId, orderId } = await request.json();
  const feeBps = Number(process.env.PLATFORM_FEE_BPS ?? 1000);
  const applicationFee = Math.round((amountCents * feeBps) / 10_000);

  const intent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      application_fee_amount: applicationFee,
      transfer_data: { destination: sellerAccountId },
      metadata: { orderId },
    },
    { idempotencyKey: \`mp_pi_\${orderId}\` }
  );

  return NextResponse.json({ clientSecret: intent.client_secret, id: intent.id });
}`,
      },
    },
  },

  webhooks: {
    id: 'webhooks',
    title: 'Idempotent Webhook Receiver',
    eyebrow: '05 · EVENT RELIABILITY',
    summary:
      'Verify raw HMAC-SHA256 Stripe-Signature headers, deduplicate redelivered events in Postgres/Redis, and acknowledge 2xx within 5 seconds.',
    apiPrimitives: ['webhooks.constructEvent', 'events', 'Stripe-Signature (t, v1)'],
    requiredEvents: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'invoice.paid',
      'invoice.payment_failed',
      'charge.dispute.created',
    ],
    envVars: [
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_WEBHOOK_SECRET=whsec_...',
    ],
    dashboardSteps: [
      'Register an HTTPS endpoint under Developers > Webhooks and select only the exact events your system handles.',
      'Copy the Signing Secret (whsec_...) into your server secret manager—never hardcode it.',
      'Use Stripe CLI (stripe listen --forward-to localhost:3000/api/webhooks/stripe) for local end-to-end verification.',
    ],
    backendSteps: [
      'Read the exact raw request bytes before any JSON parser touches the body.',
      'Verify the Stripe-Signature header using constructEvent (enforcing the 300-second replay tolerance).',
      'Insert event.id into a processed_stripe_events table with a UNIQUE constraint; return 200 immediately on conflict.',
      'Return HTTP 200 quickly and offload slow email/ERP jobs to a durable background queue.',
    ],
    frontendSteps: [
      'Never rely on frontend redirect URLs alone for state transitions—poll or subscribe to your database status updated by webhooks.',
      'Display clear reconciliation messaging ("Confirming payment...") while awaiting webhook delivery.',
    ],
    notes: [
      'Stripe retries non-2xx responses with exponential backoff for up to 3 days—your handler MUST be idempotent.',
      'During signing secret rotation, Stripe sends multiple v1 signatures simultaneously; constructEvent handles rolling secrets automatically.',
    ],
    code: {
      node: {
        filename: 'server/webhook.ts',
        snippet: `import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const app = express();
const processedEvents = new Set<string>(); // Replace with DB UNIQUE(event_id)

// IMPORTANT: mount raw parser BEFORE express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing Stripe-Signature header');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return res.status(400).send(\`Webhook signature failed: \${message}\`);
  }

  if (processedEvents.has(event.id)) {
    return res.json({ received: true, duplicate: true });
  }
  processedEvents.add(event.id);

  switch (event.type) {
    case 'checkout.session.completed':
      // Enqueue idempotent order fulfillment
      break;
    case 'invoice.payment_failed':
      // Trigger dunning notification
      break;
    default:
      break;
  }

  return res.json({ received: true });
});`,
      },
      python: {
        filename: 'webhook.py',
        snippet: `import os
import stripe
from fastapi import FastAPI, Header, HTTPException, Request

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
WEBHOOK_SECRET = os.environ["STRIPE_WEBHOOK_SECRET"]
app = FastAPI()

@app.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(alias="Stripe-Signature")):
    raw_body = await request.body()
    try:
        event = stripe.Webhook.construct_event(raw_body, stripe_signature, WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail=f"Webhook error: {exc}") from exc

    # Persist event["id"] with UNIQUE constraint in Postgres before mutating state
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Fulfill order using session["metadata"]
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        # Notify billing contact

    return {"received": True, "event_id": event["id"]}`,
      },
      go: {
        filename: 'webhook.go',
        snippet: `package webhooks

import (
	"io"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v81/webhook"
)

func StripeWebhookHandler(w http.ResponseWriter, r *http.Request) {
	const maxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "unable to read body", http.StatusServiceUnavailable)
		return
	}

	sigHeader := r.Header.Get("Stripe-Signature")
	event, err := webhook.ConstructEvent(payload, sigHeader, os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil {
		http.Error(w, "invalid signature", http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		// Record event.ID in DB (UNIQUE) and fulfill
	case "invoice.payment_failed":
		// Trigger retry / customer alert
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(\`{"received":true}\`))
}`,
      },
      nextjs: {
        filename: 'app/api/webhooks/stripe/route.ts',
        snippet: `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe-Signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Deduplicate event.id in database before processing
  if (event.type === 'checkout.session.completed') {
    // Fulfill order
  }

  return NextResponse.json({ received: true, id: event.id });
}`,
      },
    },
  },
};

export function detectFlowCategory(prompt: string): FlowCategory {
  const text = prompt.toLowerCase();
  if (/(connect|marketplace|seller|vendor|split|payout|application_fee|transfer)/.test(text)) {
    return 'connect';
  }
  if (/(usage|meter|per\s*1,?000|token|credit|overage|pay-as-you-go|api\s+requests)/.test(text)) {
    return 'usage';
  }
  if (/(webhook|hmac|signature|supabase|sync|idempoten|event|constructevent)/.test(text)) {
    return 'webhooks';
  }
  if (/(subscription|saas|recurring|trial|tier|portal|seat|annual|monthly|plan)/.test(text)) {
    return 'subscriptions';
  }
  return 'checkout';
}

export function detectPreferredLanguage(prompt: string): CodeLanguage {
  const text = prompt.toLowerCase();
  if (/(next\.?js|app router|vercel)/.test(text)) return 'nextjs';
  if (/(python|fastapi|django|flask)/.test(text)) return 'python';
  if (/(golang|\bgo\b|gin|fiber|echo)/.test(text)) return 'go';
  return 'node';
}

export function generateDeterministicBlueprint(
  prompt: string,
  explicitCategory?: FlowCategory
): { blueprint: FlowBlueprint; recommendedLanguage: CodeLanguage } {
  const trimmed = prompt.trim();
  const category = explicitCategory ?? detectFlowCategory(trimmed);
  const base = FLOW_BLUEPRINTS[category];
  const recommendedLanguage = trimmed ? detectPreferredLanguage(trimmed) : 'node';

  const customNotes = [...base.notes];
  const lower = trimmed.toLowerCase();

  if (lower.includes('supabase')) {
    customNotes.unshift(
      'Supabase sync: store stripe_customer_id in profiles, verify webhooks inside a Supabase Edge Function (using SubtleCryptoProvider), and write via the service_role client.'
    );
  }
  if (lower.includes('tax') || lower.includes('vat')) {
    customNotes.unshift(
      'Tax compliance: enable automatic_tax: { enabled: true } and collect customer billing/shipping addresses via customer_update: { address: "auto" }.'
    );
  }
  if (lower.includes('trial')) {
    customNotes.unshift(
      'Free trial guard: require a payment method up front or configure trial_settings.end_behavior.missing_payment_method = "cancel" to prevent zombie subscriptions.'
    );
  }
  if (lower.includes('apple pay') || lower.includes('google pay') || lower.includes('mobile')) {
    customNotes.unshift(
      'Wallets: verify your domain in Stripe Payment Method Domains so Apple Pay & Google Pay render automatically in Checkout and Payment Element.'
    );
  }

  return {
    blueprint: {
      ...base,
      detectedPrompt: trimmed || undefined,
      notes: customNotes,
    },
    recommendedLanguage,
  };
}
