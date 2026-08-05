import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── Real Curated Travel & Destination Catalog ────────────────────────────────

const REAL_TRAVEL_ITEMS: Candidate[] = [
  {
    id: 'travel_weekend_getaway',
    title: 'Plan a 3-day weekend nature & cabin getaway',
    description:
      'Research nearby national parks, mountain cabins, or coastal retreats for a short refreshing weekend escape.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'lifestyle', 'outdoor'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.88,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'travel_scenic_roadtrip',
    title: 'Map out a scenic coastal road trip route & food stops',
    description:
      'Discover scenic driving routes, local culinary hidden gems, and picturesque stopovers along the way.',
    url: 'https://www.google.com/maps',
    category: 'travel',
    tags: ['travel', 'food', 'photography'],
    difficulty: 'beginner',
    estimatedMinutes: 45,
    popularity: 0.85,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'travel_kyoto_japan',
    title: 'Explore Kyoto & Tokyo 5-day cultural travel itinerary',
    description:
      'Discover historic temples, bamboo groves, food markets, and bullet-train day trips in Japan.',
    url: 'https://www.wikivoyage.org/wiki/Kyoto',
    category: 'travel',
    tags: ['travel', 'culture'],
    difficulty: 'beginner',
    estimatedMinutes: 35,
    popularity: 0.9,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['weekend', 'tonight'],
  },
];

interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

async function fetchWikiTravelCandidates(profile: InterestProfile): Promise<Candidate[]> {
  const topTag = topInterests(profile, 1)[0]?.name ?? 'travel';

  const query = encodeURIComponent(`${topTag.replace(/_/g, ' ')} travel tourism destination`);
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=1&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wiki API error');
  const data = (await res.json()) as { query?: { search?: WikiSearchResult[] } };
  if (!data.query?.search?.length) return [];

  return data.query.search
    .filter((item) => !item.title.toLowerCase().includes('rankings') && !item.title.toLowerCase().includes('list of'))
    .slice(0, 5)
    .map((item) => {
      const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '');
      return {
        id: `wiki_travel_${item.pageid}`,
        title: `Explore Destination: ${item.title}`,
        description: cleanSnippet.length > 180 ? cleanSnippet.slice(0, 177) + '…' : cleanSnippet,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        category: 'travel',
        tags: [topTag, 'travel'],
        difficulty: 'beginner',
        estimatedMinutes: 25,
        popularity: 0.86,
        addedAt: Date.now(),
        suitedWindows: ['weekend', 'tonight'],
      };
    });
}

const TRAVEL_TAGS = new Set(['travel', 'outdoor', 'lifestyle']);

export const travelProvider: Provider = {
  category: 'travel',
  name: 'Travel & Trip Ideas Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    try {
      const fetched = await fetchWikiTravelCandidates(profile);
      if (fetched.length > 0) return fetched;
    } catch {
      // Fall through
    }

    const hasTravelInterest = Object.values(profile).some(
      (i) => i.score > 0 && TRAVEL_TAGS.has(i.name),
    );
    return hasTravelInterest ? REAL_TRAVEL_ITEMS : [];
  },
};
