export interface ParsedSignatureHeader {
  timestamp: number | null;
  v1Signatures: string[];
  v0Signatures: string[];
  rawPairs: Array<{ key: string; value: string }>;
}

export interface SignatureVerificationResult {
  valid: boolean;
  signatureMatched: boolean;
  timestampValid: boolean;
  timestamp: number | null;
  ageSeconds: number | null;
  toleranceSeconds: number;
  expectedSignature: string;
  providedSignatures: string[];
  signedPayloadByteLength: number;
  reason: string;
}

export interface WebhookTemplate {
  id: string;
  label: string;
  eventType: string;
  payload: string;
}

export const WEBHOOK_TEMPLATES: WebhookTemplate[] = [
  {
    id: 'checkout.session.completed',
    label: 'checkout.session.completed',
    eventType: 'checkout.session.completed',
    payload: JSON.stringify(
      {
        id: 'evt_1Q9xK2LkdIwHu7ix9P4bM1vZ',
        object: 'event',
        api_version: '2025-02-24.acacia',
        created: 1732480000,
        type: 'checkout.session.completed',
        livemode: false,
        data: {
          object: {
            id: 'cs_test_a1B2c3D4e5F6g7H8i9J0',
            object: 'checkout.session',
            amount_total: 4900,
            currency: 'usd',
            customer: 'cus_R9x8K2mN1pQ4sT',
            client_reference_id: 'usr_98421',
            mode: 'payment',
            payment_status: 'paid',
            status: 'complete',
            metadata: {
              order_id: 'ord_2026_00481',
              plan: 'pro_annual',
            },
          },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'invoice.payment_failed',
    label: 'invoice.payment_failed',
    eventType: 'invoice.payment_failed',
    payload: JSON.stringify(
      {
        id: 'evt_1Q9xL8LkdIwHu7ix7R2cN9kM',
        object: 'event',
        api_version: '2025-02-24.acacia',
        created: 1732480120,
        type: 'invoice.payment_failed',
        livemode: false,
        data: {
          object: {
            id: 'in_1Q9xL7LkdIwHu7ixA4b2C8dE',
            object: 'invoice',
            amount_due: 2900,
            attempt_count: 2,
            currency: 'usd',
            customer: 'cus_R9x8K2mN1pQ4sT',
            subscription: 'sub_1Q8mP2LkdIwHu7ixW3y5Z7qR',
            status: 'open',
            next_payment_attempt: 1732739320,
          },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'customer.subscription.updated',
    label: 'customer.subscription.updated',
    eventType: 'customer.subscription.updated',
    payload: JSON.stringify(
      {
        id: 'evt_1Q9xM4LkdIwHu7ix3T8vX1nB',
        object: 'event',
        api_version: '2025-02-24.acacia',
        created: 1732480240,
        type: 'customer.subscription.updated',
        livemode: false,
        data: {
          object: {
            id: 'sub_1Q8mP2LkdIwHu7ixW3y5Z7qR',
            object: 'subscription',
            customer: 'cus_R9x8K2mN1pQ4sT',
            status: 'active',
            cancel_at_period_end: false,
            current_period_end: 1735072240,
            items: {
              data: [
                {
                  id: 'si_R9x8K2mN1pQ4sT',
                  price: { id: 'price_pro_monthly', unit_amount: 2900, currency: 'usd' },
                  quantity: 3,
                },
              ],
            },
          },
        },
      },
      null,
      2
    ),
  },
  {
    id: 'account.updated',
    label: 'account.updated (Connect)',
    eventType: 'account.updated',
    payload: JSON.stringify(
      {
        id: 'evt_1Q9xN9LkdIwHu7ix5U1wY6pC',
        object: 'event',
        api_version: '2025-02-24.acacia',
        created: 1732480360,
        type: 'account.updated',
        account: 'acct_1Q7kL92eZvKYlo2C',
        livemode: false,
        data: {
          object: {
            id: 'acct_1Q7kL92eZvKYlo2C',
            object: 'account',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
            country: 'US',
            default_currency: 'usd',
          },
        },
      },
      null,
      2
    ),
  },
];

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function parseStripeSignatureHeader(header: string): ParsedSignatureHeader {
  const rawPairs: Array<{ key: string; value: string }> = [];
  let timestamp: number | null = null;
  const v1Signatures: string[] = [];
  const v0Signatures: string[] = [];

  for (const part of header.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    rawPairs.push({ key, value });

    if (key === 't') {
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed > 0) {
        timestamp = parsed;
      }
    } else if (key === 'v1' && value) {
      v1Signatures.push(value.toLowerCase());
    } else if (key === 'v0' && value) {
      v0Signatures.push(value.toLowerCase());
    }
  }

  return { timestamp, v1Signatures, v0Signatures, rawPairs };
}

export async function computeStripeHmacSha256(
  secret: string,
  timestamp: number,
  rawPayload: string
): Promise<{ signature: string; signedPayloadByteLength: number }> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is unavailable in this environment.');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const signedPayload = `${timestamp}.${rawPayload}`;
  const payloadBytes = encoder.encode(signedPayload);

  const cryptoKey = await subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const macBuffer = await subtle.sign('HMAC', cryptoKey, payloadBytes);
  return {
    signature: bytesToHex(new Uint8Array(macBuffer)),
    signedPayloadByteLength: payloadBytes.byteLength,
  };
}

export async function generateStripeSignatureHeader(
  secret: string,
  rawPayload: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): Promise<{ header: string; signature: string; timestamp: number; signedPayloadByteLength: number }> {
  const { signature, signedPayloadByteLength } = await computeStripeHmacSha256(
    secret,
    timestamp,
    rawPayload
  );
  return {
    header: `t=${timestamp},v1=${signature}`,
    signature,
    timestamp,
    signedPayloadByteLength,
  };
}

export async function verifyStripeSignature(params: {
  secret: string;
  rawPayload: string;
  signatureHeader: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
}): Promise<SignatureVerificationResult> {
  const toleranceSeconds = params.toleranceSeconds ?? 300;
  const nowSeconds = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  const parsed = parseStripeSignatureHeader(params.signatureHeader);

  if (parsed.timestamp === null) {
    return {
      valid: false,
      signatureMatched: false,
      timestampValid: false,
      timestamp: null,
      ageSeconds: null,
      toleranceSeconds,
      expectedSignature: '',
      providedSignatures: parsed.v1Signatures,
      signedPayloadByteLength: 0,
      reason: 'Missing or invalid timestamp (t=...) in Stripe-Signature header.',
    };
  }

  if (parsed.v1Signatures.length === 0) {
    return {
      valid: false,
      signatureMatched: false,
      timestampValid: false,
      timestamp: parsed.timestamp,
      ageSeconds: nowSeconds - parsed.timestamp,
      toleranceSeconds,
      expectedSignature: '',
      providedSignatures: [],
      signedPayloadByteLength: 0,
      reason: 'No v1 signature found in Stripe-Signature header.',
    };
  }

  const { signature: expectedSignature, signedPayloadByteLength } = await computeStripeHmacSha256(
    params.secret,
    parsed.timestamp,
    params.rawPayload
  );

  const signatureMatched = parsed.v1Signatures.some((sig) =>
    constantTimeEqual(sig, expectedSignature)
  );
  const ageSeconds = nowSeconds - parsed.timestamp;
  const timestampValid = toleranceSeconds <= 0 || Math.abs(ageSeconds) <= toleranceSeconds;

  let reason = 'Signature verified and timestamp is within replay tolerance.';
  if (!signatureMatched) {
    reason =
      'HMAC-SHA256 mismatch: raw body bytes, signing secret, or timestamp differ from the signature.';
  } else if (!timestampValid) {
    reason = `Signature matches, but timestamp drift (${ageSeconds}s) exceeds ${toleranceSeconds}s replay tolerance.`;
  }

  return {
    valid: signatureMatched && timestampValid,
    signatureMatched,
    timestampValid,
    timestamp: parsed.timestamp,
    ageSeconds,
    toleranceSeconds,
    expectedSignature,
    providedSignatures: parsed.v1Signatures,
    signedPayloadByteLength,
    reason,
  };
}

export function buildWebhookCurlCommand(
  endpointUrl: string,
  signatureHeader: string,
  rawPayload: string
): string {
  const escapedPayload = rawPayload.replace(/'/g, `'\\''`);
  return `curl -i -X POST '${endpointUrl}' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Stripe-Signature: ${signatureHeader}' \\\n  --data-raw '${escapedPayload}'`;
}
