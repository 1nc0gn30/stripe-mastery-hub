export async function generateStripeFlow(userInput: string) {
  const response = await fetch('/api/flow-architect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userInput,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'AI flow architect is unavailable right now.');
  }

  return payload.text || 'No response generated.';
}
