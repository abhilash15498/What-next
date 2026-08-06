import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const STATIC_LEARNING_ITEMS: Candidate[] = [
  {
    id: 'learn_recsys_stanford',
    title: 'Study Stanford CS246 — Mining Massive Datasets (Recommender Systems)',
    description: 'Free lecture notes covering collaborative filtering, matrix factorization, and ranking algorithms.',
    url: 'http://web.stanford.edu/class/cs246/',
    category: 'learning',
    tags: ['ai', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 90,
    popularity: 0.65,
    addedAt: Date.parse('2025-01-10'),
    suitedWindows: ['tomorrow', 'weekend'],
  },
  {
    id: 'learn_system_design_primer',
    title: "Study 'system-design-primer' fundamentals",
    description: 'Load balancing, caching, and database scaling patterns for software engineers.',
    url: 'https://github.com/donnemartin/system-design-primer',
    category: 'learning',
    tags: ['career', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    popularity: 0.8,
    addedAt: Date.parse('2024-10-01'),
    suitedWindows: ['tomorrow', 'weekend'],
  },
];

async function fetchLiveLearningRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} tutorial course learning guide 2026`;
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
        const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/ - .*$/, '').trim();
        const link = linkMatch[1].trim();

        items.push({
          id: `learn_rss_${i}_${Date.now()}`,
          title: `Study: ${title}`,
          description: `Live course guide and technical breakdown covering ${tag}.`,
          url: link,
          category: 'learning',
          tags: [tag, 'learning'],
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          popularity: 0.9,
          addedAt: Date.now(),
          suitedWindows: ['tomorrow', 'weekend'],
        });
      }
    }
    return items;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const learningProvider: Provider = {
  category: 'learning',
  name: 'Courses & Learning Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const activeTag = Object.values(profile).find((i) => i.score > 0)?.name ?? 'programming';

    try {
      const liveItems = await fetchLiveLearningRSS(activeTag);
      if (liveItems.length > 0) return liveItems;
    } catch {
      // Fallback
    }

    return STATIC_LEARNING_ITEMS;
  },
};
