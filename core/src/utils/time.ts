import type { CurrentContext } from '../types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getCurrentContext(now: Date = new Date()): CurrentContext {
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const minutesRemainingToday = (23 - hourOfDay) * 60 + (60 - now.getMinutes());
  return { hourOfDay, dayOfWeek, isWeekend, minutesRemainingToday };
}

export function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function daysAgo(timestamp: number, now: number = Date.now()): number {
  return (now - timestamp) / DAY_MS;
}

export function freshnessFromAge(addedAt: number, halfLifeDays = 120, now: number = Date.now()): number {
  const age = daysAgo(addedAt, now);
  // exponential decay, clamped so nothing curated ever drops to zero
  const decayed = Math.pow(0.5, age / halfLifeDays);
  return Math.max(0.15, Math.min(1, decayed));
}
