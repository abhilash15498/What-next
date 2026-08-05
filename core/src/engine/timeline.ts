import type { Recommendation, TimeWindow } from '../types.js';

const WINDOWS: TimeWindow[] = ['now', 'tonight', 'tomorrow', 'weekend'];

export function buildTimeline(
  recommendations: Recommendation[],
  perWindow = 3,
): Record<TimeWindow, Recommendation[]> {
  const timeline: Record<TimeWindow, Recommendation[]> = {
    now: [],
    tonight: [],
    tomorrow: [],
    weekend: [],
  };

  const used = new Set<string>();

  // first pass: honor each recommendation's own preferred window
  for (const window of WINDOWS) {
    for (const rec of recommendations) {
      if (timeline[window].length >= perWindow) break;
      if (used.has(rec.id)) continue;
      if (rec.window === window) {
        timeline[window].push(rec);
        used.add(rec.id);
      }
    }
  }

  // second pass: fill any under-populated window with the next-best leftovers
  for (const window of WINDOWS) {
    if (timeline[window].length >= perWindow) continue;
    for (const rec of recommendations) {
      if (timeline[window].length >= perWindow) break;
      if (used.has(rec.id)) continue;
      timeline[window].push(rec);
      used.add(rec.id);
    }
  }

  return timeline;
}

export function assignWindow(suitedWindows: TimeWindow[], isWeekend: boolean, hourOfDay: number): TimeWindow {
  if (isWeekend && suitedWindows.includes('weekend')) return 'weekend';
  if (hourOfDay >= 18 && suitedWindows.includes('tonight')) return 'tonight';
  if (suitedWindows.includes('now')) return 'now';
  if (suitedWindows.includes('tomorrow')) return 'tomorrow';
  return suitedWindows[0] ?? 'now';
}
