import type {
  Candidate,
  Category,
  CurrentContext,
  FeedbackRecord,
  InterestProfile,
  Preferences,
  RecommendationDNA,
} from '../types.js';
import { clamp, round } from '../utils/id.js';
import { freshnessFromAge } from '../utils/time.js';

export interface ScoredCandidate {
  candidate: Candidate;
  score: number; // 0-100
  dna: RecommendationDNA;
  interestMatchTags: string[];
}

const WEIGHTS = {
  interestSimilarity: 30,
  contextRelevance: 16,
  feedbackAdjustment: 14,
  freshness: 8,
  novelty: 10,
  diversity: 6, // applied post-hoc during selection, not in the base score
  popularity: 10,
  estimatedUsefulness: 12,
};

/** cosine-like overlap between a candidate's tags and the user's scored interests, 0-1 */
function interestSimilarity(candidate: Candidate, profile: InterestProfile): { score: number; tags: string[] } {
  let total = 0;
  let matched = 0;
  const matchedTags: string[] = [];
  for (const tag of candidate.tags) {
    const interest = profile[tag];
    if (!interest) continue;
    total += interest.score / 100;
    matched += 1;
    matchedTags.push(tag);
  }
  if (matched === 0) return { score: 0, tags: [] };
  return { score: clamp(total / candidate.tags.length, 0, 1), tags: matchedTags };
}

function contextRelevance(candidate: Candidate, context: CurrentContext): number {
  const window: 'now' | 'tonight' | 'tomorrow' | 'weekend' = context.isWeekend
    ? 'weekend'
    : context.hourOfDay >= 18
      ? 'tonight'
      : 'now';
  if (candidate.suitedWindows.includes(window)) return 1;
  if (candidate.suitedWindows.includes('now')) return 0.6;
  return 0.35;
}

/** Net positive vs negative feedback ratio for this candidate's tags/category, -1..1 mapped to 0..1 */
function feedbackAdjustment(candidate: Candidate, feedback: FeedbackRecord[]): number {
  const relevant = feedback.filter(
    (f) => f.category === candidate.category || f.tags.some((t) => candidate.tags.includes(t)),
  );
  if (relevant.length === 0) return 0.5; // neutral prior
  let positive = 0;
  let negative = 0;
  for (const f of relevant) {
    if (f.type === 'useful' || f.type === 'save' || f.type === 'more_like_this') positive += 1;
    if (f.type === 'not_interested') negative += 1;
  }
  const net = (positive - negative) / relevant.length; // -1..1
  return clamp((net + 1) / 2, 0, 1);
}

function estimatedUsefulness(candidate: Candidate, prefs: Preferences, context: CurrentContext): number {
  const budget = Math.min(prefs.availableMinutesPerDay, Math.max(15, context.minutesRemainingToday));
  if (candidate.estimatedMinutes <= budget) return 1;
  // gracefully penalize items that don't fit today rather than zeroing them out —
  // they may still be the right "weekend" recommendation
  const overBy = candidate.estimatedMinutes - budget;
  return clamp(1 - overBy / (budget + 1), 0.15, 1);
}

function novelty(candidate: Candidate, recentlyShownIds: Set<string>): number {
  return recentlyShownIds.has(candidate.id) ? 0.2 : 1;
}

function difficultyFor(candidate: Candidate): RecommendationDNA['difficulty'] {
  return candidate.difficulty;
}

export function scoreCandidate(
  candidate: Candidate,
  ctx: {
    profile: InterestProfile;
    feedback: FeedbackRecord[];
    context: CurrentContext;
    prefs: Preferences;
    recentlyShownIds: Set<string>;
  },
): ScoredCandidate {
  const sim = interestSimilarity(candidate, ctx.profile);
  const relevance = contextRelevance(candidate, ctx.context);
  const fb = feedbackAdjustment(candidate, ctx.feedback);
  const fresh = freshnessFromAge(candidate.addedAt);
  const nov = novelty(candidate, ctx.recentlyShownIds);
  const usefulness = estimatedUsefulness(candidate, ctx.prefs, ctx.context);

  const raw =
    sim.score * WEIGHTS.interestSimilarity +
    relevance * WEIGHTS.contextRelevance +
    fb * WEIGHTS.feedbackAdjustment +
    fresh * WEIGHTS.freshness +
    nov * WEIGHTS.novelty +
    candidate.popularity * WEIGHTS.popularity +
    usefulness * WEIGHTS.estimatedUsefulness;

  const maxPossible =
    WEIGHTS.interestSimilarity +
    WEIGHTS.contextRelevance +
    WEIGHTS.feedbackAdjustment +
    WEIGHTS.freshness +
    WEIGHTS.novelty +
    WEIGHTS.popularity +
    WEIGHTS.estimatedUsefulness;

  const score = round(clamp((raw / maxPossible) * 100, 0, 100), 1);

  // confidence blends how strongly we know the matched interests plus data volume signal
  const matchedConfidences = sim.tags.map((t) => ctx.profile[t]?.confidence ?? 0);
  const avgConfidence = matchedConfidences.length
    ? matchedConfidences.reduce((a, b) => a + b, 0) / matchedConfidences.length
    : 0.3; // baseline confidence for cold-start / unmatched items

  const dna: RecommendationDNA = {
    difficulty: difficultyFor(candidate),
    estimatedMinutes: candidate.estimatedMinutes,
    category: candidate.category,
    tags: candidate.tags,
    popularity: round(candidate.popularity, 2),
    freshness: round(fresh, 2),
    interestMatch: round(sim.score, 2),
    confidence: round(clamp(avgConfidence * 60 + score * 0.4, 0, 100), 0),
  };

  return { candidate, score, dna, interestMatchTags: sim.tags };
}

export function scoreAllCandidates(
  candidates: Candidate[],
  ctx: {
    profile: InterestProfile;
    feedback: FeedbackRecord[];
    context: CurrentContext;
    prefs: Preferences;
    recentlyShownIds: Set<string>;
  },
): ScoredCandidate[] {
  return candidates
    .filter((c) => !ctx.prefs.disabledCategories.includes(c.category))
    .map((c) => scoreCandidate(c, ctx))
    .sort((a, b) => b.score - a.score);
}

/**
 * Applies a diversity penalty during selection: once a category has been
 * picked `capPerCategory` times in the returned feed, further items from
 * that category are pushed down rather than dropped, so the top-N feed
 * doesn't become all-movies or all-GitHub.
 */
export function selectDiverseFeed(scored: ScoredCandidate[], topN: number, capPerCategory = 3): ScoredCandidate[] {
  const counts: Partial<Record<Category, number>> = {};
  const primary: ScoredCandidate[] = [];
  const overflow: ScoredCandidate[] = [];

  for (const item of scored) {
    const count = counts[item.candidate.category] ?? 0;
    if (count < capPerCategory) {
      primary.push(item);
      counts[item.candidate.category] = count + 1;
    } else {
      overflow.push(item);
    }
  }

  return [...primary, ...overflow].slice(0, topN);
}
