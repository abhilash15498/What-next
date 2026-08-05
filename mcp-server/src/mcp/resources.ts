import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCurrentContext, topInterests } from '@whatnext/core';
import { jsonFileStorage } from '../storage/jsonFileAdapter.js';

export function registerResources(server: McpServer): void {
  server.registerResource(
    'interest-profile',
    'whatnext://interest-profile',
    {
      title: 'Interest Profile',
      description: "The user's full interest graph: scores, confidence, trend, and relationships between interests.",
      mimeType: 'application/json',
    },
    async (uri) => {
      const profile = await jsonFileStorage.getInterestProfile();
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(profile, null, 2) }] };
    },
  );

  server.registerResource(
    'recommendation-history',
    'whatnext://recommendation-history',
    {
      title: 'Recommendation History',
      description: 'The last 100 recommendations WhatNext has generated, with scores, DNA metadata and status.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const history = await jsonFileStorage.getRecommendationHistory(100);
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(history, null, 2) }] };
    },
  );

  server.registerResource(
    'saved-recommendations',
    'whatnext://saved-recommendations',
    {
      title: 'Saved Recommendations',
      description: 'Recommendations the user explicitly saved for later.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const saved = await jsonFileStorage.getSavedRecommendations();
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(saved, null, 2) }] };
    },
  );

  server.registerResource(
    'preferences',
    'whatnext://preferences',
    {
      title: 'Preferences',
      description: 'Disabled categories, available time budget, and privacy settings.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const prefs = await jsonFileStorage.getPreferences();
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(prefs, null, 2) }] };
    },
  );

  server.registerResource(
    'current-context',
    'whatnext://current-context',
    {
      title: 'Current Context',
      description: 'Time of day, day of week, and a quick summary of the top current interests — useful context for any "what should I do" reasoning.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const profile = await jsonFileStorage.getInterestProfile();
      const context = {
        ...getCurrentContext(),
        topInterests: topInterests(profile, 5).map((i) => ({ name: i.name, score: i.score, trend: i.trend })),
      };
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(context, null, 2) }] };
    },
  );
}
