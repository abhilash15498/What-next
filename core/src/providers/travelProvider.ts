import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_TRAVEL_ITEMS: Candidate[] = [
  {
    id: 'travel_weekend_getaway',
    title: 'Plan a 3-day weekend travel getaway',
    description:
      'Research nearby nature spots, historical towns, or coastal retreats for a short refreshing weekend escape.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'lifestyle', 'outdoor'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.85,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'travel_scenic_roadtrip',
    title: 'Map out a scenic road trip route & food spots',
    description:
      'Discover scenic driving routes, local culinary hidden gems, and picturesque stopovers along the way.',
    url: 'https://www.google.com/maps',
    category: 'travel',
    tags: ['travel', 'food', 'photography'],
    difficulty: 'beginner',
    estimatedMinutes: 45,
    popularity: 0.82,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
];

const PURE_MOVIE_TAGS = new Set(['bollywood', 'anime', 'movies', 'film', 'cinema']);

interface WikiSearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

async function fetchWikiTravelCandidates(profile: InterestProfile): Promise<Candidate[]> {
  const topTag = topInterests(profile, 1)[0]?.name ?? 'travel';
  if (PURE_MOVIE_TAGS.has(topTag)) return [];

  const query = encodeURIComponent(`${topTag.replace(/_/g, ' ')} travel tourism destination`);
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=1&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wiki API error');
  const data = (await res.json()) as { query?: { search?: WikiSearchResult[] } };
  if (!data.query?.search?.length) return [];

  return data.query.search.slice(0, 8).map((item) => {
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

// ── Provider ───────────────────────────────────────────────────────────────────

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

    const active = topInterests(profile, 5).filter((i) => i.score > 0);
    const dynamicItems: Candidate[] = [];

    for (const interest of active) {
      const tag = interest.name;
      if (PURE_MOVIE_TAGS.has(tag)) continue;
      const displayTag = tag.replace(/_/g, ' ');

      dynamicItems.push({
        id: `travel_dynamic_${tag}_itinerary`,
        title: `Plan a ${displayTag}-inspired travel & exploration trip`,
        description: `Research top destinations, hidden gems, and travel itineraries themed around ${displayTag}.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(displayTag + ' travel destination itinerary')}`,
        category: 'travel',
        tags: [tag, 'travel'],
        difficulty: 'beginner',
        estimatedMinutes: 35,
        popularity: 0.88,
        addedAt: Date.now(),
        suitedWindows: ['weekend', 'tonight'],
      });
    }

    return [...dynamicItems, ...STATIC_TRAVEL_ITEMS];
  },
};
