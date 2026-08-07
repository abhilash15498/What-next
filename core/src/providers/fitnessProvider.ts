import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { cleanTitle } from '../utils/text.js';

const STATIC_FITNESS_ITEMS: Candidate[] = [
  {
    id: 'fit_45min_strength',
    title: 'Do a 45-minute strength workout',
    description: 'Full-body compound lifts (squat, hinge, push, pull) — ideal active recovery & strength training.',
    url: 'https://www.youtube.com/results?search_query=full+body+workout+routine',
    category: 'fitness',
    tags: ['fitness'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.75,
    addedAt: Date.parse('2025-06-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'fit_20min_mobility',
    title: 'Do a 20-minute mobility & stretching session',
    description: 'Hip, shoulder, and thoracic spine mobility work — pairs well after long study or coding sessions.',
    url: 'https://www.youtube.com/results?search_query=20+min+full+body+stretch+mobility',
    category: 'fitness',
    tags: ['fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.6,
    addedAt: Date.parse('2025-05-15'),
    suitedWindows: ['now', 'tonight'],
  },
];

async function fetchLiveFitnessRSS(tag: string): Promise<Candidate[]> {
  const query = `${tag} workout routine fitness training guide`;
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
        const rawTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/ - .*$/, '').trim();
        const title = cleanTitle(rawTitle);
        const link = linkMatch[1].trim();

        items.push({
          id: `fit_rss_${i}_${Date.now()}`,
          title: `Workout Guide: ${title}`,
          description: `Live workout routine, health training, and athletic performance guide.`,
          url: link,
          category: 'fitness',
          tags: [tag, 'fitness'],
          difficulty: 'beginner',
          estimatedMinutes: 30,
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

export const fitnessProvider: Provider = {
  category: 'fitness',
  name: 'Fitness & Health Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasFitnessInterest = Object.values(profile).some(
      (i) => i.score > 0 && (i.name === 'fitness' || i.name === 'football' || i.name === 'health'),
    );
    if (!hasFitnessInterest) return [];

    const activeTag = Object.values(profile).find((i) => i.score > 0 && (i.name === 'fitness' || i.name === 'football'))?.name ?? 'fitness';

    try {
      const liveItems = await fetchLiveFitnessRSS(activeTag);
      if (liveItems.length > 0) return liveItems;
    } catch {
      // Fallback
    }

    return STATIC_FITNESS_ITEMS;
  },
};
