import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── Real Curated Movie Catalog ───────────────────────────────────────────────

const REAL_MOVIE_CATALOG: Candidate[] = [
  {
    id: 'movie_moneyball',
    title: 'Watch Moneyball (Sports & Analytics)',
    description:
      'Data-driven decision making applied to sports recruitment — starring Brad Pitt, essential for sports & analytics enthusiasts.',
    url: 'https://www.themoviedb.org/movie/60308',
    category: 'movie',
    tags: ['football', 'career', 'movies', 'sports'],
    difficulty: 'beginner',
    estimatedMinutes: 133,
    popularity: 0.88,
    addedAt: Date.parse('2024-03-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_chef',
    title: 'Watch Chef (Jon Favreau Culinary Journey)',
    description:
      'A heartwarming, food-filled film about a fine-dining chef who starts a Cuban food truck to rediscover his passion for cooking.',
    url: 'https://www.themoviedb.org/movie/212778',
    category: 'movie',
    tags: ['cooking', 'food', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 114,
    popularity: 0.89,
    addedAt: Date.parse('2024-05-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_jiro_dreams_of_sushi',
    title: 'Watch Jiro Dreams of Sushi (Master Culinary Documentary)',
    description:
      'A stunning documentary on 85-year-old sushi master Jiro Ono and his obsessive pursuit of culinary perfection.',
    url: 'https://www.themoviedb.org/movie/82694',
    category: 'movie',
    tags: ['cooking', 'food', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 81,
    popularity: 0.9,
    addedAt: Date.parse('2024-06-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_the_big_short',
    title: 'Watch The Big Short (Stock Market & Finance)',
    description:
      'Fast-paced, brilliant drama breaking down the 2008 housing market crash and Wall Street hedge fund traders.',
    url: 'https://www.themoviedb.org/movie/318846',
    category: 'movie',
    tags: ['stock_market', 'finance', 'investing', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 130,
    popularity: 0.92,
    addedAt: Date.parse('2024-02-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_rrr',
    title: 'Watch RRR (Indian Action Epic)',
    description:
      'A thrilling, high-energy Indian action spectacle celebrating brotherhood, incredible stunts, and cinematic scale.',
    url: 'https://www.themoviedb.org/movie/579974',
    category: 'movie',
    tags: ['bollywood', 'movies', 'action'],
    difficulty: 'beginner',
    estimatedMinutes: 187,
    popularity: 0.93,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'tonight'],
  },
  {
    id: 'movie_spirited_away',
    title: 'Watch Spirited Away (Studio Ghibli Masterpiece)',
    description:
      'Hayao Miyazaki\'s Oscar-winning animated film exploring magic, growth, and Japanese folklore.',
    url: 'https://www.themoviedb.org/movie/129',
    category: 'movie',
    tags: ['anime', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 125,
    popularity: 0.95,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'tonight'],
  },
  {
    id: 'movie_interstellar',
    title: 'Watch Interstellar (Sci-Fi Epic)',
    description:
      'Christopher Nolan\'s visually stunning sci-fi film about time dilation, black holes, and human endurance.',
    url: 'https://www.themoviedb.org/movie/157336',
    category: 'movie',
    tags: ['movies', 'ai', 'quantum_computing'],
    difficulty: 'beginner',
    estimatedMinutes: 169,
    popularity: 0.94,
    addedAt: Date.parse('2024-11-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_the_social_network',
    title: 'Watch The Social Network',
    description:
      'The Facebook origin story — sharp writing, fast dialogue, essential watching for tech & startup founders.',
    url: 'https://www.themoviedb.org/movie/37799',
    category: 'movie',
    tags: ['entrepreneurship', 'movies', 'programming'],
    difficulty: 'beginner',
    estimatedMinutes: 120,
    popularity: 0.86,
    addedAt: Date.parse('2024-06-01'),
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

async function fetchTmdbCandidates(apiKey: string, profile: InterestProfile): Promise<Candidate[]> {
  const topTag = topInterests(profile, 1)[0]?.name;
  let url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  if (topTag) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(topTag.replace(/_/g, ' '))}&page=1`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = (await res.json()) as { results: TmdbMovie[] };
  if (!data.results?.length) return [];

  return data.results.slice(0, 10).map((m) => ({
    id: `tmdb_${m.id}`,
    title: `Watch ${m.title}`,
    description:
      m.overview.length > 200 ? m.overview.slice(0, 197) + '…' : m.overview || 'A popular film currently trending on TMDB.',
    url: `https://www.themoviedb.org/movie/${m.id}`,
    category: 'movie' as const,
    tags: [topTag ?? 'movies', 'movies'],
    difficulty: 'beginner' as const,
    estimatedMinutes: m.runtime ?? 120,
    popularity: Math.min(m.vote_average / 10, 1),
    addedAt: m.release_date ? Date.parse(m.release_date) : Date.now(),
    suitedWindows: ['tonight', 'weekend'] as const,
  }));
}

export const movieProvider: Provider = {
  category: 'movie',
  name: 'Movie & TV Provider (TMDB)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.tmdbApiKey?.trim()) {
      try {
        const live = await fetchTmdbCandidates(prefs.tmdbApiKey.trim(), profile);
        if (live.length > 0) return live;
      } catch {
        // Fall through to real curated catalog
      }
    }
    return REAL_MOVIE_CATALOG;
  },
};
