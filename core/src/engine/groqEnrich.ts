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
 * Caches LLM outputs in memory per recommendation ID to prevent duplicate Groq API calls.
 */

import type { InterestProfile, Recommendation } from '../types.js';

// ── Config ─────────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
/** Max tokens per recommendation — keep short for speed */
const MAX_TOKENS = 250;
/** Only enrich top 3 recs per generation cycle to optimize API usage */
const ENRICH_LIMIT = 3;

// ── In-Memory Cache ────────────────────────────────────────────────────────────

const ENRICH_CACHE = new Map<string, GroqEnrichedFields>();

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
  return `You are WhatNext, a smart personal activity assistant.
Your job is to explain why a recommendation fits the user right now in plain, natural human English.

STRICT RULES:
- Write like a knowledgeable, friendly advisor.
- NEVER use mechanical algorithm jargon, score numbers (e.g. "score of 56.9/100"), confidence percentages (e.g. "confidence of 42%"), rank numbers (e.g. "ranked #1 out of candidates"), or algorithm references ("the algorithm considered").
- Explain natural real-world reasons why this specific item matches the user's active interests.
- Respond ONLY with valid JSON. No markdown, no code fences, no extra text.`;
}

function buildUserPrompt(rec: Recommendation, profile: InterestProfile): string {
  const topInterests = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((i) => i.name.replace(/_/g, ' '))
    .join(', ');

  return `User's active interests: ${topInterests || 'general discovery'}

Recommendation:
- Title: ${rec.title}
- Category: ${rec.category}
- Tags: ${rec.dna.tags.join(', ')}
- Difficulty: ${rec.dna.difficulty}
- Estimated time: ${rec.dna.estimatedMinutes} min

Current context:
- whyNow: "${rec.whyNow}"
- aiReasoning: "${rec.aiReasoning}"
- description: "${rec.description}"

Write improved versions in natural, warm human language (NO scores, NO percentages, NO rank numbers, NO algorithm jargon). Respond with ONLY this JSON:
{
  "whyNow": "2 sentences. Why this specific item fits this user's active interest right now.",
  "aiReasoning": "2 sentences. Warm human context explaining how this activity complements their current interests and daily flow.",
  "description": "1 clear sentence describing what this item actually is in plain English."
}`;
}

// ── Single enrichment call ─────────────────────────────────────────────────────

async function enrichSingle(
  apiKey: string,
  rec: Recommendation,
  profile: InterestProfile,
): Promise<GroqEnrichedFields | null> {
  const cacheKey = `${rec.candidateId}_${rec.title}`;
  if (ENRICH_CACHE.has(cacheKey)) {
    return ENRICH_CACHE.get(cacheKey)!;
  }

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

  const enrichedFields: GroqEnrichedFields = {
    whyNow: parsed.whyNow,
    aiReasoning: parsed.aiReasoning,
    description: parsed.description,
  };

  ENRICH_CACHE.set(cacheKey, enrichedFields);
  return enrichedFields;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function enrichWithGroq(
  recommendations: Recommendation[],
  profile: InterestProfile,
  apiKey: string,
): Promise<Recommendation[]> {
  const toEnrich = recommendations.slice(0, ENRICH_LIMIT);
  const rest = recommendations.slice(ENRICH_LIMIT);

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
        return rec;
      }
    }),
  );

  return [...enriched, ...rest];
}
