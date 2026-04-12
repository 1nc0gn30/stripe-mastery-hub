import { GoogleGenAI } from '@google/genai';

type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type RequestBody = {
  userInput?: string;
};

const json = (statusCode: number, body: Record<string, unknown>) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(body),
});

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(503, {
      error: 'AI Flow Architect is coming soon on this deployment. Join the waitlist for launch updates.',
    });
  }

  let body: RequestBody;
  try {
    body = JSON.parse(event.body || '{}') as RequestBody;
  } catch {
    return json(400, { error: 'Invalid JSON request body.' });
  }

  const userInput = body.userInput?.trim();
  if (!userInput) {
    return json(400, { error: 'userInput is required.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Stripe Integration Architect. A user needs help setting up a payment flow.

User Request: ${userInput}

Provide a clear, step-by-step guide.
Focus on:
1. Stripe Dashboard steps (products, checkout, webhooks, portal).
2. Backend and database steps (secure key handling, webhook verification, storage).
3. Frontend steps (redirects, metadata, success/cancel UX).

Rules:
- Use dummy IDs/keys only (e.g., price_123, sk_test_...).
- Be concise but thorough.
- Use Markdown headings and bullet points.
- Include code snippets where helpful.
- Never suggest exposing secret keys in frontend code.`,
    });

    return json(200, { text: response.text || 'No response generated.' });
  } catch (error) {
    console.error('flow-architect function error:', error);
    return json(502, { error: 'Failed to contact AI provider.' });
  }
};
