import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateRecommendations, reinforceTags, recordFeedback, decayProfile } from '@whatnext/core';
import { jsonFileStorage } from '../storage/jsonFileAdapter.js';

export function registerTools(server: McpServer): void {
  server.registerTool(
    'generate_recommendations',
    {
      title: 'Generate Recommendations',
      description:
        'Runs the full WhatNext recommendation engine now: gathers candidates from every provider, ranks them against the interest profile and current context, and returns the ranked feed plus the Now/Tonight/Tomorrow/Weekend timeline.',
      inputSchema: {},
    },
    async () => {
      const profile = await jsonFileStorage.getInterestProfile();
      await jsonFileStorage.saveInterestProfile(decayProfile(profile));
      const result = await generateRecommendations(jsonFileStorage);
      return {
        content: [
          {
            type: 'text',
            text: `Evaluated ${result.candidatesEvaluated} candidates. Top pick: "${result.feed[0]?.title ?? 'none'}".\n\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update_interests',
    {
      title: 'Update Interests',
      description: 'Manually reinforces or reduces one or more interest tags — useful when a user states a preference directly in conversation.',
      inputSchema: {
        tags: z.array(z.string()).describe('Interest tags to update, e.g. ["ai", "fitness"]'),
        direction: z.enum(['up', 'down']).describe('Whether to increase or decrease these interests'),
        magnitude: z.number().min(1).max(30).optional().describe('How strongly to adjust (default 6)'),
      },
    },
    async ({ tags, direction, magnitude }) => {
      const profile = await jsonFileStorage.getInterestProfile();
      const updated = reinforceTags(profile, tags, direction, magnitude ?? 6);
      await jsonFileStorage.saveInterestProfile(updated);
      return {
        content: [{ type: 'text', text: `Updated ${tags.length} interest(s) (${direction}): ${tags.join(', ')}` }],
      };
    },
  );

  server.registerTool(
    'record_feedback',
    {
      title: 'Record Feedback',
      description: 'Records user feedback (useful, not_interested, save, later, more_like_this) on a specific recommendation by id, and feeds it back into the interest profile.',
      inputSchema: {
        recommendationId: z.string(),
        feedbackType: z.enum(['useful', 'not_interested', 'save', 'later', 'more_like_this']),
      },
    },
    async ({ recommendationId, feedbackType }) => {
      const history = await jsonFileStorage.getRecommendationHistory(200);
      const rec = history.find((r) => r.id === recommendationId);
      if (!rec) {
        return { content: [{ type: 'text', text: `No recommendation found with id ${recommendationId}` }], isError: true };
      }
      await recordFeedback(jsonFileStorage, rec, feedbackType);
      return { content: [{ type: 'text', text: `Recorded "${feedbackType}" for "${rec.title}".` }] };
    },
  );

  server.registerTool(
    'search_interests',
    {
      title: 'Search Interests',
      description: 'Searches the interest profile by substring and returns matching interests with score, confidence, and trend.',
      inputSchema: { query: z.string() },
    },
    async ({ query }) => {
      const profile = await jsonFileStorage.getInterestProfile();
      const q = query.toLowerCase();
      const matches = Object.values(profile).filter((i) => i.name.includes(q));
      return { content: [{ type: 'text', text: JSON.stringify(matches, null, 2) }] };
    },
  );

  server.registerTool(
    'explain_recommendation',
    {
      title: 'Explain Recommendation',
      description: 'Returns the Why-Now explanation and AI reasoning trail for a specific recommendation id.',
      inputSchema: { recommendationId: z.string() },
    },
    async ({ recommendationId }) => {
      const history = await jsonFileStorage.getRecommendationHistory(200);
      const rec = history.find((r) => r.id === recommendationId);
      if (!rec) {
        return { content: [{ type: 'text', text: `No recommendation found with id ${recommendationId}` }], isError: true };
      }
      return {
        content: [
          {
            type: 'text',
            text: `Why now: ${rec.whyNow}\n\nAI reasoning: ${rec.aiReasoning}\n\nDNA: ${JSON.stringify(rec.dna, null, 2)}`,
          },
        ],
      };
    },
  );
}
