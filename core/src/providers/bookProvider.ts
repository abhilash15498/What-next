import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'book_intelligent_investor',
    title: "Read 'The Intelligent Investor' (Benjamin Graham)",
    description:
      'The classic definitive book on value investing, stock market dynamics, and margin of safety.',
    category: 'book',
    tags: ['stock_market', 'finance', 'investing'],
    difficulty: 'intermediate',
    estimatedMinutes: 480,
    popularity: 0.92,
    addedAt: Date.parse('2024-01-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'book_atomic_habits',
    title: "Read 'Atomic Habits' (James Clear)",
    description:
      'Practical framework for building consistent habits — useful alongside any personal goal routine.',
    category: 'book',
    tags: ['fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 360,
    popularity: 0.95,
    addedAt: Date.parse('2023-11-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'book_designing_data_intensive_apps',
    title: "Read 'Designing Data-Intensive Applications' (Martin Kleppmann)",
    description:
      'The canonical systems-design book — dense but directly useful for software engineering backends.',
    category: 'book',
    tags: ['programming', 'career'],
    difficulty: 'advanced',
    estimatedMinutes: 900,
    popularity: 0.88,
    addedAt: Date.parse('2024-04-01'),
    suitedWindows: ['weekend'],
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

function topInterestQuery(profile: InterestProfile): string {
  const sorted = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((i) => i.name.replace(/_/g, ' '));
  return sorted.length > 0 ? sorted.join(' OR ') : 'reading';
}

async function fetchGoogleBooksCandidates(
  apiKey: string,
  profile: InterestProfile,
): Promise<Candidate[]> {
  const q = encodeURIComponent(topInterestQuery(profile));
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&orderBy=relevance&maxResults=12${apiKey ? `&key=${apiKey}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books error: ${res.status}`);
  const data = (await res.json()) as { items?: GoogleBooksItem[] };
  if (!data.items?.length) return [];

  return data.items.map((item) => {
    const v = item.volumeInfo;
    const author = v.authors?.[0] ?? 'Author';
    const pages = v.pageCount ?? 250;
    const estimatedMinutes = Math.round((pages / 25) * 10);
    const popularity = Math.min((v.averageRating ?? 3.5) / 5, 1);

    const tags: string[] = ['books'];
    const cats = (v.categories ?? []).join(' ').toLowerCase();
    if (cats.includes('computer') || cats.includes('programming')) tags.push('programming');
    if (cats.includes('artificial') || cats.includes('machine')) tags.push('ai');
    if (cats.includes('business') || cats.includes('finance')) tags.push('finance', 'stock_market');
    if (cats.includes('travel')) tags.push('travel');

    return {
      id: `gbooks_${item.id}`,
      title: `Read '${v.title}' (${author})`,
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
    try {
      const fetched = await fetchGoogleBooksCandidates(prefs.googleBooksApiKey?.trim() ?? '', profile);
      if (fetched.length > 0) return fetched;
    } catch {
      // Fall through
    }

    const active = topInterests(profile, 5).filter((i) => i.score > 0);
    const dynamicItems: Candidate[] = [];

    for (const interest of active) {
      const tag = interest.name;
      const displayTag = tag.replace(/_/g, ' ');

      dynamicItems.push({
        id: `book_dynamic_${tag}`,
        title: `Read top recommended books on ${displayTag}`,
        description: `Explore essential reading lists, authoritative books, and literature about ${displayTag}.`,
        url: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(displayTag)}`,
        category: 'book',
        tags: [tag, 'books'],
        difficulty: 'intermediate',
        estimatedMinutes: 300,
        popularity: 0.87,
        addedAt: Date.now(),
        suitedWindows: ['tonight', 'weekend'],
      });
    }

    return [...dynamicItems, ...STATIC_ITEMS];
  },
};
