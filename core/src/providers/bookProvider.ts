import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'book_quantum_computing_since_democritus',
    title: "Read 'Quantum Computing Since Democritus' (Scott Aaronson)",
    description:
      'A first-principles, often funny walk through computer science and quantum theory. Great for a self-taught quantum roadmap.',
    category: 'book',
    tags: ['quantum_computing', 'ai'],
    difficulty: 'intermediate',
    estimatedMinutes: 600,
    popularity: 0.7,
    addedAt: Date.parse('2024-01-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'book_designing_data_intensive_apps',
    title: "Read 'Designing Data-Intensive Applications' (Martin Kleppmann)",
    description:
      'The canonical systems-design book — dense but directly useful for anyone building real backends.',
    category: 'book',
    tags: ['programming', 'career'],
    difficulty: 'advanced',
    estimatedMinutes: 900,
    popularity: 0.88,
    addedAt: Date.parse('2024-04-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'book_atomic_habits',
    title: "Read 'Atomic Habits' (James Clear)",
    description:
      'Practical framework for building consistent habits — useful alongside a fitness or study routine.',
    category: 'book',
    tags: ['fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 360,
    popularity: 0.95,
    addedAt: Date.parse('2023-11-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'book_zero_to_one',
    title: "Read 'Zero to One' (Peter Thiel)",
    description:
      "Contrarian take on building startups — short, opinionated, and a staple in founder reading lists.",
    category: 'book',
    tags: ['entrepreneurship'],
    difficulty: 'beginner',
    estimatedMinutes: 300,
    popularity: 0.82,
    addedAt: Date.parse('2024-02-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'book_nielsen_chuang',
    title: "Read Ch.1 of 'Quantum Computation and Quantum Information' (Nielsen & Chuang)",
    description:
      'The standard graduate textbook — start with chapter 1 for the foundational postulates.',
    category: 'book',
    tags: ['quantum_computing'],
    difficulty: 'advanced',
    estimatedMinutes: 240,
    popularity: 0.6,
    addedAt: Date.parse('2024-05-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'book_deep_work',
    title: "Read 'Deep Work' (Cal Newport)",
    description:
      'Framework for focused, high-value work in a distraction-saturated world.',
    category: 'book',
    tags: ['productivity', 'career'],
    difficulty: 'beginner',
    estimatedMinutes: 330,
    popularity: 0.87,
    addedAt: Date.parse('2023-08-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
];

// ── Google Books live fetch ────────────────────────────────────────────────────

interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    publishedDate?: string;
    infoLink?: string;
  };
}

/** Pick the top interest tags from the user profile for querying. */
function topInterestQuery(profile: InterestProfile): string {
  const sorted = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((i) => i.name.replace(/_/g, ' '));
  return sorted.length > 0 ? sorted.join(' OR ') : 'programming technology';
}

async function fetchGoogleBooksCandidates(
  apiKey: string,
  profile: InterestProfile,
): Promise<Candidate[]> {
  const q = encodeURIComponent(topInterestQuery(profile));
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&orderBy=relevance&maxResults=12&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books error: ${res.status}`);
  const data = (await res.json()) as { items?: GoogleBooksItem[] };
  if (!data.items?.length) return STATIC_ITEMS;

  return data.items.map((item) => {
    const v = item.volumeInfo;
    const author = v.authors?.[0] ?? 'Unknown';
    const pages = v.pageCount ?? 250;
    const estimatedMinutes = Math.round((pages / 25) * 10); // ~25 pages/hour reading
    const popularity = Math.min((v.averageRating ?? 3.5) / 5, 1);

    // Derive tags from categories
    const tags: string[] = ['books'];
    const cats = (v.categories ?? []).join(' ').toLowerCase();
    if (cats.includes('computer') || cats.includes('programming')) tags.push('programming');
    if (cats.includes('artificial') || cats.includes('machine')) tags.push('ai');
    if (cats.includes('quantum')) tags.push('quantum_computing');
    if (cats.includes('business') || cats.includes('entrepreneur')) tags.push('entrepreneurship');
    if (cats.includes('fitness') || cats.includes('health')) tags.push('fitness');
    if (cats.includes('career') || cats.includes('productivity')) tags.push('career');

    return {
      id: `gbooks_${item.id}`,
      title: `Read '${v.title}'${v.authors?.length ? ` (${author})` : ''}`,
      description:
        v.description
          ? v.description.slice(0, 200).replace(/<[^>]+>/g, '') + (v.description.length > 200 ? '…' : '')
          : `A book by ${author}.`,
      url: v.infoLink,
      category: 'book' as const,
      tags,
      difficulty: pages > 400 ? ('advanced' as const) : pages > 200 ? ('intermediate' as const) : ('beginner' as const),
      estimatedMinutes,
      popularity,
      addedAt: v.publishedDate ? Date.parse(v.publishedDate) : Date.now(),
      suitedWindows: ['tonight', 'weekend'],
    };
  });
}

// ── Provider ───────────────────────────────────────────────────────────────────

export const bookProvider: Provider = {
  category: 'book',
  name: 'Book Provider (Google Books)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.googleBooksApiKey?.trim()) {
      try {
        return await fetchGoogleBooksCandidates(prefs.googleBooksApiKey.trim(), profile);
      } catch {
        // Fall through to static list
      }
    }
    return STATIC_ITEMS;
  },
};
