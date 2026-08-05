import type { Recommendation } from '@whatnext/core';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5';

export interface EnhanceResult {
  text: string;
}

/**
 * Sends only the recommendation's already-computed, non-sensitive metadata
 * (title, category, matched tags, scores) to the Anthropic API using the
 * user's own API key, entered in Settings and stored locally. WhatNext has
 * no backend of its own — this call goes straight from the browser to
 * Anthropic and nowhere else.
 */
export async function enhanceReasoningWithClaude(
  apiKey: string,
  recommendation: Recommendation,
  baseReasoning: string,
  model: string = DEFAULT_MODEL,
): Promise<EnhanceResult> {
  const prompt = `You are the explanation layer of a personal recommendation engine called WhatNext?.
Rewrite the following auto-generated reasoning into a warmer, more specific 2-3 sentence explanation for the user, in second person. Do not invent facts that aren't implied below — only rephrase and sharpen what's given.

Recommendation: "${recommendation.title}" (category: ${recommendation.category})
Matched tags: ${recommendation.dna.tags.join(', ')}
Confidence: ${recommendation.dna.confidence}/100
Auto-generated reasoning: "${baseReasoning}"

Respond with only the rewritten explanation, no preamble.`;

  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Anthropic API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = (data.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n')
    .trim();

  return { text: text || baseReasoning };
}
