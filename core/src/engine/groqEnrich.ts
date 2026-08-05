/**
 * groqEnrich.ts
 *
 * Uses Groq's OpenAI-compatible chat API to enrich the top-ranked recommendations
 * with genuinely personalised, LLM-generated explanations. Falls back silently to
 * the template strings already on each Recommendation when:
 *   - No API key is configured
 *   - The network request fails
 *   - The model returns malformed JSON
 *
 * Only enriches the top ENRICH_LIMIT recommendations (default 5) to keep latency low.
 */

import type { InterestProfile, Recommendation } from '../types.js';

// ── Config ─────────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
/** Max tokens per recommendation — keep short for speed */
const MAX_TOKENS = 300;
/** Only enrich this many top recs per generation cycle */
const ENRICH_LIMIT = 5;

// ── Types ──────────────────────────────────────────────────────────────────────

interface GroqEnrichedFields {
  whyNow: string;
  aiReasoning: string;
  description: string;
}

interface GroqChoice {
  message: { content: string };
}

interface GroqResponse {
  choices: GroqChoice[];
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are WhatNext, a personal recommendation engine. Your job is to write warm, specific, first-person explanations for why a recommendation fits a user right now.

Rules:
- Be concise, direct, and friendly — no filler phrases like "Great choice!"
- Reference the user's actual interests and scores when relevant
- Respond ONLY with valid JSON. No markdown, no code fences, no extra text.`;
}

function buildUserPrompt(rec: Recommendation, profile: InterestProfile): string {
  const topInterests = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((i) => `${i.name.replace(/_/g, ' ')} (score ${Math.round(i.score)}/100, trend: ${i.trend})`)
    .join(', ');

  return `User's top interests: ${topInterests || 'unknown (new user)'}

Recommendation:
- Title: ${rec.title}
- Category: ${rec.category}
- Tags: ${rec.dna.tags.join(', ')}
- Difficulty: ${rec.dna.difficulty}
- Estimated time: ${rec.dna.estimatedMinutes} min
- Rank: #${rec.rank} out of the evaluated candidates
- Score: ${rec.score}/100
- Confidence: ${Math.round(rec.dna.confidence)}%

Current template explanations (use as context, improve upon them):
- whyNow: "${rec.whyNow}"
- aiReasoning: "${rec.aiReasoning}"
- description: "${rec.description}"

Write improved versions. Respond with ONLY this JSON (no other text):
{
  "whyNow": "2-3 sentences. Why this specific item for this user right now. Mention their actual interests.",
  "aiReasoning": "2-3 sentences. Explain the ranking logic — what factors tipped this to #${rec.rank}, what the score means.",
  "description": "1 sharp sentence describing what this item actually is, in plain English."
}`;
}

// ── Single enrichment call ─────────────────────────────────────────────────────

async function enrichSingle(
  apiKey: string,
  rec: Recommendation,
  profile: InterestProfile,
): Promise<GroqEnrichedFields | null> {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(rec, profile) },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  };

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as GroqResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as Partial<GroqEnrichedFields>;
  if (!parsed.whyNow || !parsed.aiReasoning || !parsed.description) return null;

  return {
    whyNow: parsed.whyNow,
    aiReasoning: parsed.aiReasoning,
    description: parsed.description,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Enriches the top ENRICH_LIMIT recommendations using Groq.
 * Returns a new array with enriched fields merged in; the rest of the feed
 * is returned unchanged. Never throws — any error means the original rec is kept.
 *
 * @param recommendations Full ranked recommendation feed
 * @param profile User's interest profile
 * @param apiKey Groq API key from Preferences
 */
export async function enrichWithGroq(
  recommendations: Recommendation[],
  profile: InterestProfile,
  apiKey: string,
): Promise<Recommendation[]> {
  const toEnrich = recommendations.slice(0, ENRICH_LIMIT);
  const rest = recommendations.slice(ENRICH_LIMIT);

  // Run enrichments in parallel for speed
  const enriched = await Promise.all(
    toEnrich.map(async (rec): Promise<Recommendation> => {
      try {
        const fields = await enrichSingle(apiKey, rec, profile);
        if (!fields) return rec;
        return {
          ...rec,
          whyNow: fields.whyNow,
          aiReasoning: fields.aiReasoning,
          description: fields.description,
        };
      } catch {
        return rec; // Silent fallback — keep original template
      }
    }),
  );

  return [...enriched, ...rest];
}
