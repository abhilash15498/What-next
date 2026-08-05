import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'movie_interstellar',
    title: 'Watch Interstellar',
    description:
      'A visually stunning, emotionally heavy sci-fi film about time, gravity, and family — pairs well with an interest in physics or AI.',
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
    id: 'movie_the_social_network',
    title: 'Watch The Social Network',
    description:
      'The Facebook origin story — sharp writing, fast dialogue, essential watching for anyone into startups.',
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
    id: 'movie_arrival',
    title: 'Watch Arrival',
    description:
      'A slow-burn first-contact film about language and cognition — great after a heavy week of learning.',
    url: 'https://www.themoviedb.org/movie/329865',
    category: 'movie',
    tags: ['movies', 'ai'],
    difficulty: 'beginner',
    estimatedMinutes: 116,
    popularity: 0.8,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['tonight'],
  },
  {
    id: 'movie_moneyball',
    title: 'Watch Moneyball',
    description:
      'Data-driven decision making applied to baseball recruitment — a great watch for anyone into sports analytics.',
    url: 'https://www.themoviedb.org/movie/60308',
    category: 'movie',
    tags: ['football', 'career'],
    difficulty: 'beginner',
    estimatedMinutes: 133,
    popularity: 0.78,
    addedAt: Date.parse('2024-03-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_free_solo',
    title: 'Watch Free Solo',
    description:
      'Documentary about Alex Honnold free-climbing El Capitan — intense focus and preparation, resonates with fitness-minded viewers.',
    url: 'https://www.themoviedb.org/movie/490013',
    category: 'movie',
    tags: ['fitness', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 100,
    popularity: 0.82,
    addedAt: Date.parse('2025-02-10'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_the_imitation_game',
    title: 'Watch The Imitation Game',
    description:
      'Alan Turing cracking Enigma — the emotional origin story of computer science.',
    url: 'https://www.themoviedb.org/movie/205596',
    category: 'movie',
    tags: ['programming', 'ai', 'movies'],
    difficulty: 'beginner',
    estimatedMinutes: 114,
    popularity: 0.84,
    addedAt: Date.parse('2024-09-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'movie_spiderman_spiderverse',
    title: 'Watch Spider-Man: Across the Spider-Verse',
    description:
      'A visually inventive animated blockbuster — good low-effort weekend unwind.',
    url: 'https://www.themoviedb.org/movie/569094',
    category: 'movie',
    tags: ['movies', 'gaming'],
    difficulty: 'beginner',
    estimatedMinutes: 140,
    popularity: 0.9,
    addedAt: Date.parse('2025-05-01'),
    suitedWindows: ['weekend', 'tonight'],
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

// Broad mapping of TMDB genre IDs → interest tags
const GENRE_TAG_MAP: Record<number, string[]> = {
  28: ['action', 'movies'],       // Action
  12: ['movies'],                 // Adventure
  16: ['movies', 'gaming'],       // Animation
  35: ['movies'],                 // Comedy
  80: ['movies'],                 // Crime
  99: ['movies'],                 // Documentary
  18: ['movies'],                 // Drama
  10751: ['movies'],              // Family
  14: ['movies', 'gaming'],       // Fantasy
  36: ['movies'],                 // History
  27: ['movies'],                 // Horror
  10402: ['movies'],              // Music
  9648: ['movies'],               // Mystery
  10749: ['movies'],              // Romance
  878: ['movies', 'ai', 'quantum_computing'], // Science Fiction
  10770: ['movies'],              // TV Movie
  53: ['movies'],                 // Thriller
  10752: ['movies'],              // War
  37: ['movies'],                 // Western
};

async function fetchTmdbCandidates(apiKey: string, _profile: InterestProfile): Promise<Candidate[]> {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = (await res.json()) as { results: TmdbMovie[] };

  return data.results.slice(0, 12).map((m) => {
    const tags = [
      ...new Set(m.genre_ids.flatMap((g) => GENRE_TAG_MAP[g] ?? ['movies'])),
    ];
    const popularity = Math.min(m.vote_average / 10, 1);
    const estimatedMinutes = m.runtime ?? 110; // runtime not in list endpoint; use sensible default
    return {
      id: `tmdb_${m.id}`,
      title: `Watch ${m.title}`,
      description:
        m.overview.length > 200 ? m.overview.slice(0, 197) + '…' : m.overview || 'A popular film currently trending on TMDB.',
      url: `https://www.themoviedb.org/movie/${m.id}`,
      category: 'movie' as const,
      tags,
      difficulty: 'beginner' as const,
      estimatedMinutes,
      popularity,
      addedAt: m.release_date ? Date.parse(m.release_date) : Date.now(),
      suitedWindows: ['tonight', 'weekend'] as const,
    };
  });
}

// ── Provider ───────────────────────────────────────────────────────────────────

export const movieProvider: Provider = {
  category: 'movie',
  name: 'Movie & TV Provider (TMDB)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.tmdbApiKey?.trim()) {
      try {
        return await fetchTmdbCandidates(prefs.tmdbApiKey.trim(), profile);
      } catch {
        // Fall through to static list
      }
    }
    return STATIC_ITEMS;
  },
};
