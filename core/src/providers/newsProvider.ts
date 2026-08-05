import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

// ── HackerNews & Public RSS/Reddit live fetch ───────────────────────────────

interface HnItem {
  id: number;
  title: string;
  url?: string;
  score?: number;
  time?: number;
  by?: string;
}

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
    id: 'news_startup_funding_digest',
    title: "Read this week's tech & startup funding digest",
    description:
      'Notable seed and Series A rounds, with a short note on what problem each company is solving.',
    category: 'news',
    tags: ['entrepreneurship', 'finance'],
    difficulty: 'beginner',
    estimatedMinutes: 12,
    popularity: 0.55,
    addedAt: Date.parse('2025-07-22'),
    suitedWindows: ['now', 'tonight'],
  },
];

async function fetchLiveHackerNews(profile: InterestProfile): Promise<Candidate[]> {
  const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  if (!topIdsRes.ok) throw new Error('HN fetch error');
  const ids = ((await topIdsRes.json()) as number[]).slice(0, 15);

  const items = await Promise.all(
    ids.map(async (id) => {
      try {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemRes.ok) return null;
        return (await itemRes.json()) as HnItem;
      } catch {
        return null;
      }
    }),
  );

  const valid = items.filter((i): i is HnItem => i !== null && Boolean(i.title && i.url));
  const activeTags = topInterests(profile, 5).map((t) => t.name);

  return valid.slice(0, 10).map((hn) => {
    const text = hn.title.toLowerCase();
    const tags: string[] = ['news'];
    if (text.includes('ai') || text.includes('llm') || text.includes('gpt')) tags.push('ai');
    if (text.includes('code') || text.includes('dev') || text.includes('python') || text.includes('js')) tags.push('programming');
    if (text.includes('stock') || text.includes('market') || text.includes('money')) tags.push('finance', 'stock_market');
    if (text.includes('cooking') || text.includes('recipe') || text.includes('food')) tags.push('cooking', 'food');

    // Attach active user tags to match profile
    for (const tag of activeTags) {
      if (text.includes(tag.replace(/_/g, ' '))) tags.push(tag);
    }

    return {
      id: `hn_live_${hn.id}`,
      title: `Read: ${hn.title}`,
      description: `Trending on HackerNews (${hn.score ?? 50} points) by ${hn.by ?? 'community'}.`,
      url: hn.url ?? `https://news.ycombinator.com/item?id=${hn.id}`,
      category: 'news',
      tags: [...new Set(tags)],
      difficulty: 'beginner',
      estimatedMinutes: 10,
      popularity: Math.min((hn.score ?? 50) / 400, 1),
      addedAt: hn.time ? hn.time * 1000 : Date.now(),
      suitedWindows: ['now', 'tonight'],
    };
  });
}

// ── Provider ───────────────────────────────────────────────────────────────────

export const newsProvider: Provider = {
  category: 'news',
  name: 'News & Tech Stories Provider (live)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    try {
      const fetched = await fetchLiveHackerNews(profile);
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
        id: `news_dynamic_${tag}`,
        title: `Read latest news & updates on ${displayTag}`,
        description: `Catch up on trending news articles, industry updates, and discussions about ${displayTag}.`,
        url: `https://news.google.com/search?q=${encodeURIComponent(displayTag)}`,
        category: 'news',
        tags: [tag, 'news'],
        difficulty: 'beginner',
        estimatedMinutes: 10,
        popularity: 0.8,
        addedAt: Date.now(),
        suitedWindows: ['now', 'tonight'],
      });
    }

    return [...dynamicItems, ...STATIC_ITEMS];
  },
};
