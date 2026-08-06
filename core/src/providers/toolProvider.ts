import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const STATIC_TOOL_ITEMS: Candidate[] = [
  {
    id: 'tool_obsidian',
    title: 'Set up Obsidian for project notes',
    description: 'Local-first, markdown-based note tool — a natural fit for privacy-first productivity.',
    url: 'https://obsidian.md/',
    category: 'tool',
    tags: ['productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.65,
    addedAt: Date.parse('2025-01-05'),
    suitedWindows: ['now'],
  },
];

async function fetchLiveToolRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} developer tool software productivity app review 2026`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const text = await res.text();
    const items: Candidate[] = [];
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || [];

    for (let i = 0; i < Math.min(itemMatches.length, 5); i++) {
      const raw = itemMatches[i];
      const titleMatch = raw.match(/<title>(.*?)<\/title>/);
      const linkMatch = raw.match(/<link>(.*?)<\/link>/);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/ - .*$/, '').trim();
        const link = linkMatch[1].trim();

        items.push({
          id: `tool_rss_${i}_${Date.now()}`,
          title: `Discover Tool: ${title}`,
          description: `Live developer tool, library, and productivity app breakdown for ${tag}.`,
          url: link,
          category: 'tool',
          tags: [tag, 'productivity'],
          difficulty: 'beginner',
          estimatedMinutes: 20,
          popularity: 0.9,
          addedAt: Date.now(),
          suitedWindows: ['now', 'tomorrow'],
        });
      }
    }
    return items;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const toolProvider: Provider = {
  category: 'tool',
  name: 'Tools & Software Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const activeTag = Object.values(profile).find((i) => i.score > 0)?.name ?? 'productivity';

    try {
      const liveItems = await fetchLiveToolRSS(activeTag);
      if (liveItems.length > 0) return liveItems;
    } catch {
      // Fallback
    }

    return STATIC_TOOL_ITEMS;
  },
};
