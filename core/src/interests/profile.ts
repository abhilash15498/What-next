import type { Interest, InterestProfile, Signal } from '../types.js';
import { clamp, round } from '../utils/id.js';

const RECENT_ACTIVITY_CAP = 25;
const DECAY_PER_DAY = 0.985; // interests cool off ~1.5%/day without reinforcement
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function emptyInterest(name: string): Interest {
  const now = Date.now();
  return {
    name,
    score: 0,
    confidence: 0,
    recentActivity: [],
    trend: 'flat',
    relationships: {},
    lastUpdated: now,
  };
}

/** Applies passive time-decay to every interest since it was last touched. */
export function decayProfile(profile: InterestProfile, now: number = Date.now()): InterestProfile {
  const next: InterestProfile = {};
  for (const [name, interest] of Object.entries(profile)) {
    const days = Math.max(0, (now - interest.lastUpdated) / MS_PER_DAY);
    const decayFactor = Math.pow(DECAY_PER_DAY, days);
    const decayedScore = interest.score * decayFactor;
    next[name] = {
      ...interest,
      score: round(decayedScore, 2),
      // confidence decays much slower than score — we still "know" the user
      // liked something even if it's cooled off
      confidence: round(clamp(interest.confidence * Math.pow(0.999, days), 0, 1), 3),
    };
  }
  return next;
}

/**
 * Folds a batch of signals into the profile: bumps scores, grows confidence,
 * records recent activity, recomputes trend, and strengthens relationships
 * between interests that co-occur in the same signal.
 */
export function applySignals(profile: InterestProfile, signals: Signal[]): InterestProfile {
  if (signals.length === 0) return profile;
  const working: InterestProfile = { ...profile };

  for (const signal of signals) {
    const tagsInSignal = signal.tags.map((t) => t.tag);

    for (const { tag, weight } of signal.tags) {
      const existing = working[tag] ?? emptyInterest(tag);
      const previousScore = existing.score;

      const gain = weight * 18; // each strong signal can move score up to ~18 points
      const newScore = clamp(previousScore + gain * (1 - previousScore / 130), 0, 100);

      const recentActivity = [...existing.recentActivity, signal.timestamp].slice(
        -RECENT_ACTIVITY_CAP,
      );

      const confidence = clamp(existing.confidence + (1 - existing.confidence) * 0.12, 0, 1);

      let trend: Interest['trend'] = 'flat';
      if (newScore - previousScore > 1) trend = 'rising';
      else if (newScore < previousScore - 0.5) trend = 'falling';

      const relationships = { ...existing.relationships };
      for (const other of tagsInSignal) {
        if (other === tag) continue;
        relationships[other] = clamp((relationships[other] ?? 0) + 0.08, 0, 1);
      }

      working[tag] = {
        name: tag,
        score: round(newScore, 2),
        confidence: round(confidence, 3),
        recentActivity,
        trend,
        relationships,
        lastUpdated: signal.timestamp,
      };
    }
  }

  return working;
}

/** Positive or negative reinforcement to a specific set of tags, driven by explicit feedback. */
export function reinforceTags(
  profile: InterestProfile,
  tags: string[],
  direction: 'up' | 'down',
  magnitude = 6,
): InterestProfile {
  const working: InterestProfile = { ...profile };
  for (const tag of tags) {
    const existing = working[tag] ?? emptyInterest(tag);
    const delta = direction === 'up' ? magnitude : -magnitude;
    const newScore = clamp(existing.score + delta, 0, 100);
    working[tag] = {
      ...existing,
      score: round(newScore, 2),
      confidence: round(clamp(existing.confidence + 0.05, 0, 1), 3),
      trend: delta > 0 ? 'rising' : 'falling',
      lastUpdated: Date.now(),
    };
  }
  return working;
}

export function topInterests(profile: InterestProfile, n = 8): Interest[] {
  return Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** Interest Graph edges: pairs of interests whose relationship weight clears a threshold. */
export function buildInterestGraphEdges(
  profile: InterestProfile,
  threshold = 0.15,
): Array<{ source: string; target: string; weight: number }> {
  const edges: Array<{ source: string; target: string; weight: number }> = [];
  const seen = new Set<string>();

  for (const interest of Object.values(profile)) {
    for (const [other, weight] of Object.entries(interest.relationships)) {
      if (weight < threshold) continue;
      const key = [interest.name, other].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: interest.name, target: other, weight: round(weight, 2) });
    }
  }
  return edges;
}
