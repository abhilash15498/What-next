import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'news_ai_engineering_roundup',
    title: "Read this week's AI engineering roundup",
    description:
      'A digest-style read covering new model releases, tooling updates, and notable open-source repos from the past week.',
    category: 'news',
    tags: ['ai', 'programming'],
    difficulty: 'beginner',
    estimatedMinutes: 15,
    popularity: 0.7,
    addedAt: Date.parse('2025-07-25'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'news_quantum_computing_progress',
    title: 'Catch up on recent quantum hardware milestones',
    description:
      'Coverage of recent qubit-count and error-correction progress across major quantum computing labs.',
    category: 'news',
    tags: ['quantum_computing'],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    popularity: 0.5,
    addedAt: Date.parse('2025-07-20'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'news_football_transfer_window',
    title: 'Catch up on the latest transfer window news',
    description:
      'Quick roundup of confirmed transfers and rumors involving your followed clubs and players.',
    category: 'news',
    tags: ['football'],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    popularity: 0.65,
    addedAt: Date.parse('2025-07-28'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'news_startup_funding_digest',
    title: "Read this week's startup funding digest",
    description:
      'Notable seed and Series A rounds, with a short note on what problem each company is solving.',
    category: 'news',
    tags: ['entrepreneurship'],
    difficulty: 'beginner',
    estimatedMinutes: 12,
    popularity: 0.55,
    addedAt: Date.parse('2025-07-22'),
    suitedWindows: ['now', 'tonight'],
  },
];

// ── NewsAPI live fetch ─────────────────────────────────────────────────────────

interface NewsApiArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
}

/** Map interest tags → NewsAPI query keywords */
const TAG_KEYWORD_MAP: Record<string, string> = {
  ai: 'artificial intelligence OR machine learning',
  quantum_computing: 'quantum computing',
  programming: 'software development OR programming',
  web_dev: 'web development',
  entrepreneurship: 'startup funding OR entrepreneurship',
  football: 'football OR soccer',
  fitness: 'fitness OR health',
  career: 'technology career OR software jobs',
  gaming: 'video games OR gaming',
  productivity: 'productivity technology',
};

function buildNewsQuery(profile: InterestProfile): string {
  const topTags = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((i) => TAG_KEYWORD_MAP[i.name] ?? i.name.replace(/_/g, ' '));
  return topTags.length > 0 ? topTags.join(' OR ') : 'technology';
}

async function fetchNewsApiCandidates(
  apiKey: string,
  profile: InterestProfile,
): Promise<Candidate[]> {
  const q = encodeURIComponent(buildNewsQuery(profile));
  const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
  const data = (await res.json()) as { articles?: NewsApiArticle[]; status: string };
  if (data.status !== 'ok' || !data.articles?.length) return STATIC_ITEMS;

  return data.articles
    .filter((a) => a.title && a.title !== '[Removed]')
    .slice(0, 8)
    .map((article, i) => {
      // Derive tags from headline keywords
      const combined = `${article.title} ${article.description ?? ''}`.toLowerCase();
      const tags: string[] = ['news'];
      if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('llm')) tags.push('ai');
      if (combined.includes('quantum')) tags.push('quantum_computing');
      if (combined.includes('startup') || combined.includes('funding') || combined.includes('founder')) tags.push('entrepreneurship');
      if (combined.includes('football') || combined.includes('soccer') || combined.includes('premier league')) tags.push('football');
      if (combined.includes('fitness') || combined.includes('health')) tags.push('fitness');
      if (combined.includes('programming') || combined.includes('developer') || combined.includes('software')) tags.push('programming');

      return {
        id: `news_live_${Date.now()}_${i}`,
        title: `Read: ${article.title.slice(0, 80)}${article.title.length > 80 ? '…' : ''}`,
        description:
          article.description
            ? article.description.slice(0, 200) + (article.description.length > 200 ? '…' : '')
            : `From ${article.source.name} — a recent article matching your interests.`,
        url: article.url,
        category: 'news' as const,
        tags: [...new Set(tags)],
        difficulty: 'beginner' as const,
        estimatedMinutes: 8,
        popularity: 0.6,
        addedAt: article.publishedAt ? Date.parse(article.publishedAt) : Date.now(),
        suitedWindows: ['now', 'tonight'],
      };
    });
}

// ── Provider ───────────────────────────────────────────────────────────────────

export const newsProvider: Provider = {
  category: 'news',
  name: 'News Provider (NewsAPI)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.newsApiKey?.trim()) {
      try {
        return await fetchNewsApiCandidates(prefs.newsApiKey.trim(), profile);
      } catch {
        // Fall through to static list
      }
    }
    return STATIC_ITEMS;
  },
};
