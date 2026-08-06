import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { cleanTitle } from '../utils/text.js';

// ── Authentic Curated Shopping & Deals Fallback Catalog ──────────────────────

const SHOPPING_ITEMS: Candidate[] = [
  {
    id: 'shop_ergo_keyboard',
    title: 'Explore Ergonomic Mechanical Split Keyboards (Keychron / MX Keys)',
    description:
      'Compare low-profile split mechanical keyboards for posture comfort during long coding and writing sessions.',
    url: 'https://www.google.com/search?tbm=shop&q=ergonomic+mechanical+keyboard',
    category: 'shopping',
    tags: ['programming', 'productivity', 'tools'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.88,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'shop_anc_headphones',
    title: 'Compare Active Noise Cancelling Wireless Headphones (Sony WH-1000XM5 / Bose)',
    description:
      'Top-rated active noise cancelling over-ear headphones for deep focus work, travel, and acoustic listening.',
    url: 'https://www.google.com/search?tbm=shop&q=active+noise+cancelling+headphones',
    category: 'shopping',
    tags: ['productivity', 'travel', 'lifestyle'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.92,
    addedAt: Date.parse('2025-01-20'),
    suitedWindows: ['now', 'weekend'],
  },
];

async function fetchLiveShoppingRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} best tech gear deals reviews`;
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
          id: `shop_rss_${i}_${Date.now()}`,
          title: `Gear & Deal: ${title}`,
          description: `Live product review, tech deal, and buyers guide for ${tag}.`,
          url: link,
          category: 'shopping',
          tags: [tag, 'shopping'],
          difficulty: 'beginner',
          estimatedMinutes: 20,
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

export const shoppingProvider: Provider = {
  category: 'shopping',
  name: 'Shopping & Gear Deals Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const topTag = Object.values(profile).find((i) => i.score > 0)?.name ?? 'tech';

    try {
      const liveDeals = await fetchLiveShoppingRSS(topTag);
      if (liveDeals.length > 0) return liveDeals;
    } catch {
      // Fallback
    }

    return SHOPPING_ITEMS;
  },
};
