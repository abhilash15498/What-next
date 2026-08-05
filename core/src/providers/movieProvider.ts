import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'movie_interstellar',
    title: 'Watch Interstellar',
    description:
      'A visually stunning sci-fi epic about time, gravity, and family — pairs well with interest in physics, space, or AI.',
    url: 'https://www.themoviedb.org/movie/157336',
    category: 'movie',
    tags: ['movies', 'ai', 'quantum_computing'],
    difficulty: 'beginner',
    estimatedMinutes: 169,
    popularity: 0.93,
    addedAt: Date.parse('2024-11-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_rrr',
    title: 'Watch RRR (Indian Action Epic)',
    description:
      'A thrilling, high-energy Indian action film celebrating brotherhood, spectacular choreography, and cinematic scale.',
    url: 'https://www.themoviedb.org/movie/579974',
    category: 'movie',
    tags: ['indian', 'movies', 'action'],
    difficulty: 'beginner',
    estimatedMinutes: 187,
    popularity: 0.91,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'tonight'],
  },
  {
    id: 'movie_spirited_away',
    title: 'Watch Spirited Away (Japanese Anime Masterpiece)',
    description:
      'Hayao Miyazaki\'s legendary Studio Ghibli animated film exploring magic, growth, and Japanese folklore.',
    url: 'https://www.themoviedb.org/movie/129',
    category: 'movie',
    tags: ['japanese', 'anime', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 125,
    popularity: 0.94,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'tonight'],
  },
  {
    id: 'movie_the_social_network',
    title: 'Watch The Social Network',
    description:
      'The Facebook origin story — sharp writing, fast dialogue, essential watching for anyone into tech & startups.',
    url: 'https://www.themoviedb.org/movie/37799',
    category: 'movie',
    tags: ['entrepreneurship', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 120,
    popularity: 0.85,
    addedAt: Date.parse('2024-06-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_moneyball',
    title: 'Watch Moneyball',
    description:
      'Data-driven decision making applied to sports recruitment — a great watch for anyone into analytics or sports.',
    url: 'https://www.themoviedb.org/movie/60308',
    category: 'movie',
    tags: ['football', 'career', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 133,
    popularity: 0.78,
    addedAt: Date.parse('2024-03-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
];

// ── TMDB live fetch ────────────────────────────────────────────────────────────

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  runtime?: number;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  release_date: string;
}

const GENRE_TAG_MAP: Record<number, string[]> = {
  28: ['action', 'movies'],
  12: ['movies'],
  16: ['anime', 'movies', 'gaming'],
  35: ['movies'],
  80: ['movies'],
  99: ['movies'],
  18: ['movies'],
  14: ['movies', 'gaming'],
  36: ['history', 'movies'],
  878: ['movies', 'ai', 'quantum_computing'],
};

async function fetchTmdbCandidates(apiKey: string, profile: InterestProfile): Promise<Candidate[]> {
  const topTag = topInterests(profile, 1)[0]?.name;
  let url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  if (topTag) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(topTag.replace(/_/g, ' '))}&page=1`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = (await res.json()) as { results: TmdbMovie[] };

  return data.results.slice(0, 12).map((m) => {
    const tags = [
      ...(topTag ? [topTag] : []),
      ...new Set(m.genre_ids.flatMap((g) => GENRE_TAG_MAP[g] ?? ['movies'])),
    ];
    return {
      id: `tmdb_${m.id}`,
      title: `Watch ${m.title}`,
      description:
        m.overview.length > 200 ? m.overview.slice(0, 197) + '…' : m.overview || 'A popular film currently trending on TMDB.',
      url: `https://www.themoviedb.org/movie/${m.id}`,
      category: 'movie' as const,
      tags,
      difficulty: 'beginner' as const,
      estimatedMinutes: m.runtime ?? 120,
      popularity: Math.min(m.vote_average / 10, 1),
      addedAt: m.release_date ? Date.parse(m.release_date) : Date.now(),
      suitedWindows: ['tonight', 'weekend'] as const,
    };
  });
}

export const movieProvider: Provider = {
  category: 'movie',
  name: 'Movie & TV Provider (TMDB)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.tmdbApiKey?.trim()) {
      try {
        return await fetchTmdbCandidates(prefs.tmdbApiKey.trim(), profile);
      } catch {
        // Fall through
      }
    }

    // Dynamic interest-based candidates for active tags
    const active = topInterests(profile, 5).filter((i) => i.score > 0);
    const dynamicItems: Candidate[] = [];

    for (const interest of active) {
      const tag = interest.name;
      const displayTag = tag.replace(/_/g, ' ');

      dynamicItems.push({
        id: `movie_dynamic_${tag}`,
        title: `Explore top-rated ${displayTag} movies & films`,
        description: `Watch highly recommended films, cinema highlights, and documentaries focused on ${displayTag}.`,
        url: `https://www.themoviedb.org/search?query=${encodeURIComponent(displayTag)}`,
        category: 'movie',
        tags: [tag, 'movies'],
        difficulty: 'beginner',
        estimatedMinutes: 120,
        popularity: 0.89,
        addedAt: Date.now(),
        suitedWindows: ['tonight', 'weekend'],
      });
    }

    return [...dynamicItems, ...STATIC_ITEMS];
  },
};
