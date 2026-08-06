import type { Category, DailyDigest, Recommendation } from '../types.js';
import { todayKey } from '../utils/time.js';

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning.';
  if (hour >= 12 && hour < 17) return 'Good afternoon.';
  if (hour >= 17 && hour < 22) return 'Good evening.';
  return 'Late night focus.';
}

export function buildDailyDigest(recommendations: Recommendation[], now: Date = new Date()): DailyDigest {
  const sorted = [...recommendations].sort((a, b) => b.score - a.score);
  const top = sorted[0] ?? null;
  const hour = now.getHours();
  const greeting = getGreeting(hour);

  const headlines = [
    `${greeting} Here is what actually matters right now.`,
    `${greeting} You don't need 40 tabs — you need this.`,
    `${greeting} One clear next step, chosen for you.`,
  ];

  const byCategory: Partial<Record<Category, Recommendation>> = {};
  for (const rec of sorted) {
    if (!byCategory[rec.category]) {
      byCategory[rec.category] = rec;
    }
  }

  return {
    date: todayKey(now),
    headline: headlines[now.getDate() % headlines.length],
    topRecommendation: top,
    byCategory,
    generatedAt: Date.now(),
  };
}
