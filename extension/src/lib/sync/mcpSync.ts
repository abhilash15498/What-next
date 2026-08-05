import type { Storage } from '@whatnext/core';

async function post(url: string, body: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // MCP server not running locally — that's fine, sync is best-effort and
    // silently no-ops rather than surfacing errors to the user.
  }
}

/**
 * Pushes the interest profile, preferences, recent recommendations, and
 * recent feedback to the local MCP server's sync API. Only called when
 * prefs.mcpSyncEnabled is true. Fully best-effort/fire-and-forget — if the
 * MCP server isn't running, this silently does nothing.
 */
export async function syncToMcpServer(storage: Storage, baseUrl: string): Promise<void> {
  const [profile, prefs, history, feedback] = await Promise.all([
    storage.getInterestProfile(),
    storage.getPreferences(),
    storage.getRecommendationHistory(50),
    storage.getFeedbackHistory(100),
  ]);

  await Promise.all([
    post(`${baseUrl}/sync/profile`, profile),
    post(`${baseUrl}/sync/preferences`, prefs),
    post(`${baseUrl}/sync/recommendations`, history),
    post(`${baseUrl}/sync/feedback`, feedback),
  ]);
}
