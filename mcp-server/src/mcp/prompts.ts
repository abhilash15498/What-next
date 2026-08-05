import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { topInterests } from '@whatnext/core';
import { jsonFileStorage } from '../storage/jsonFileAdapter.js';

async function interestSummary(): Promise<string> {
  const profile = await jsonFileStorage.getInterestProfile();
  const top = topInterests(profile, 6);
  if (top.length === 0) return 'No interest data yet.';
  return top.map((i) => `${i.name} (${Math.round(i.score)}/100, ${i.trend})`).join(', ');
}

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'what-should-i-do-next',
    {
      title: 'What should I do next?',
      description: 'Ask WhatNext to pick the single most valuable next action across every category.',
      argsSchema: {},
    },
    async () => {
      const summary = await interestSummary();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Call the generate_recommendations tool, then tell me the single best thing to do right now and why. My current top interests: ${summary}.`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'recommend-a-coding-project',
    {
      title: 'Recommend a coding project.',
      description: 'Ask WhatNext to suggest a coding/side project that matches current interests and skill level.',
      argsSchema: {},
    },
    async () => {
      const summary = await interestSummary();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Call generate_recommendations, filter to category "coding_project", and recommend the best one with reasoning. My current top interests: ${summary}.`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'recommend-a-movie',
    {
      title: 'Recommend a movie.',
      description: 'Ask WhatNext to suggest a movie or show that fits current mood and interests.',
      argsSchema: {},
    },
    async () => {
      const summary = await interestSummary();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Call generate_recommendations, filter to category "movie", and recommend the best one with reasoning. My current top interests: ${summary}.`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'recommend-something-useful',
    {
      title: 'Recommend something useful.',
      description: 'Ask WhatNext for the highest-utility recommendation regardless of category, weighted toward productive categories.',
      argsSchema: {},
    },
    async () => {
      const summary = await interestSummary();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Call generate_recommendations and pick the highest-scoring item from career, learning, coding_project, or tool categories. Explain why it's the most useful use of my time right now. My current top interests: ${summary}.`,
            },
          },
        ],
      };
    },
  );
}
