import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const STATIC_CAREER_ITEMS: Candidate[] = [
  {
    id: 'career_update_linkedin_projects',
    title: 'Refresh your LinkedIn project section',
    description: 'Add your latest shipped project with a 2-line outcome-first summary and a link.',
    url: 'https://www.linkedin.com/',
    category: 'career',
    tags: ['career', 'programming'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.7,
    addedAt: Date.parse('2025-06-01'),
    suitedWindows: ['now', 'tonight'],
  },
];

async function fetchLiveCareerRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} software engineer career tech interview guide 2026`;
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
          id: `career_rss_${i}_${Date.now()}`,
          title: `Career Guide: ${title}`,
          description: `Live tech career insight, interview strategy, and growth breakdown for ${tag}.`,
          url: link,
          category: 'career',
          tags: [tag, 'career'],
          difficulty: 'intermediate',
          estimatedMinutes: 25,
          popularity: 0.9,
          addedAt: Date.now(),
          suitedWindows: ['now', 'tomorrow'],
        });
      }
    }
    return items;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const careerProvider: Provider = {
  category: 'career',
  name: 'Career Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const activeTag = Object.values(profile).find((i) => i.score > 0)?.name ?? 'programming';

    try {
      const liveItems = await fetchLiveCareerRSS(activeTag);
      if (liveItems.length > 0) return liveItems;
    } catch {
      // Fallback
    }

    return STATIC_CAREER_ITEMS;
  },
};
