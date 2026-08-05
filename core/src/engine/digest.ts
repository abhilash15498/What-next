import type { Category, DailyDigest, Recommendation } from '../types.js';
import { todayKey } from '../utils/time.js';

const HEADLINES = [
  'Good morning. Here is what actually matters today.',
  "Good morning. You don't need 40 tabs — you need this.",
  'Good morning. One clear next step, chosen for you.',
];

export function buildDailyDigest(recommendations: Recommendation[], now: Date = new Date()): DailyDigest {
  const sorted = [...recommendations].sort((a, b) => b.score - a.score);
  const top = sorted[0] ?? null;

  const byCategory: Partial<Record<Category, Recommendation>> = {};
  for (const rec of sorted) {
    if (!byCategory[rec.category]) {
      byCategory[rec.category] = rec;
    }
  }

  return {
    date: todayKey(now),
    headline: HEADLINES[now.getDate() % HEADLINES.length],
    topRecommendation: top,
    byCategory,
    generatedAt: Date.now(),
  };
}
