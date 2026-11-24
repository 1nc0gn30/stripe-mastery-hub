import {
  FlowBlueprint,
  FlowCategory,
  CodeLanguage,
  generateDeterministicBlueprint,
} from '../lib/flowEngine';

export interface FlowGenerationOutput {
  blueprint: FlowBlueprint;
  recommendedLanguage: CodeLanguage;
  source: 'local-engine' | 'byok-gemini';
  customMarkdown?: string;
  warning?: string;
}

export async function generateFlowArchitecture(params: {
  prompt: string;
  explicitCategory?: FlowCategory;
  byokApiKey?: string;
}): Promise<FlowGenerationOutput> {
  const local = generateDeterministicBlueprint(params.prompt, params.explicitCategory);
  const apiKey = params.byokApiKey?.trim();

  if (!apiKey || !params.prompt.trim()) {
    return {
      ...local,
      source: 'local-engine',
    };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a senior Stripe integration engineer. Provide concise, production-ready guidance for this request:\n\n${params.prompt.trim()}\n\nCover: (1) Stripe Dashboard setup, (2) Server & DB schema/idempotency, (3) Webhook events, (4) Edge cases. Use dummy keys only (sk_test_..., whsec_..., price_...).`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        ...local,
        source: 'local-engine',
        warning: `BYOK Gemini returned HTTP ${response.status}. Showing deterministic local architecture blueprint.`,
      };
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('\n')
      .trim();

    if (!text) {
      return {
        ...local,
        source: 'local-engine',
        warning: 'BYOK Gemini returned an empty response. Showing deterministic local blueprint.',
      };
    }

    return {
      ...local,
      source: 'byok-gemini',
      customMarkdown: text,
    };
  } catch {
    return {
      ...local,
      source: 'local-engine',
      warning: 'Could not reach Gemini API with provided key. Showing deterministic local blueprint.',
    };
  }
}
