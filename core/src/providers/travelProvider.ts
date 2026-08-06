import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { cleanTitle } from '../utils/text.js';

const REAL_TRAVEL_ITEMS: Candidate[] = [
  {
    id: 'travel_kerala_backwaters',
    title: 'Plan a Kerala backwaters & South India coastal trip',
    description:
      'Explore serene houseboat backwaters, tea plantations in Munnar, and palm-fringed coastal retreats.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'lifestyle', 'outdoor'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.9,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
];

const TRAVEL_TAGS = new Set(['travel', 'outdoor', 'lifestyle']);

async function fetchLiveTravelRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} travel guide trip itinerary 2026`;
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
        const rawTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/ - .*$/, '').trim();
        const title = cleanTitle(rawTitle);
        const link = linkMatch[1].trim();

        items.push({
          id: `travel_rss_${i}_${Date.now()}`,
          title: `Trip Guide: ${title}`,
          description: `Live travel itinerary and destination spotlight covering ${tag}.`,
          url: link,
          category: 'travel',
          tags: [tag, 'travel'],
          difficulty: 'beginner',
          estimatedMinutes: 30,
          popularity: 0.9,
          addedAt: Date.now(),
          suitedWindows: ['weekend', 'now'],
        });
      }
    }
    return items;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const travelProvider: Provider = {
  category: 'travel',
  name: 'Travel & Trip Ideas Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasTravelInterest = Object.values(profile).some(
      (i) => i.score > 0 && TRAVEL_TAGS.has(i.name),
    );
    if (!hasTravelInterest) return [];

    try {
      const liveItems = await fetchLiveTravelRSS('India travel');
      if (liveItems.length > 0) return liveItems;
    } catch {
      // Fallback
    }

    return REAL_TRAVEL_ITEMS;
  },
};
