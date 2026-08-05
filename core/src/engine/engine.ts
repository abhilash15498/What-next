import type { Storage } from '../storage/types.js';
import type { Candidate, EngineResult, Recommendation, RejectionExplanation } from '../types.js';
import { ALL_PROVIDERS } from '../providers/index.js';
import { scoreAllCandidates, selectDiverseFeed } from './rank.js';
import { buildWhyNow, buildWhyNot, buildAiReasoning } from './explain.js';
import { buildTimeline, assignWindow } from './timeline.js';
import { getCurrentContext } from '../utils/time.js';
import { makeId } from '../utils/id.js';
import { enrichWithGroq } from './groqEnrich.js';

const FEED_SIZE = 20;
const REJECTION_SAMPLE_SIZE = 6;
const LOW_SCORE_THRESHOLD = 35;

export async function generateRecommendations(storage: Storage): Promise<EngineResult> {
  const [profile, feedback, prefs, history] = await Promise.all([
    storage.getInterestProfile(),
    storage.getFeedbackHistory(500),
    storage.getPreferences(),
    storage.getRecommendationHistory(50),
  ]);

  const context = getCurrentContext();
  const recentlyShownIds = new Set(
    history
      .filter((r) => Date.now() - r.generatedAt < 1000 * 60 * 60 * 24 * 3)
      .map((r) => r.candidateId),
  );

  const allCandidates: Candidate[] = (
    await Promise.all(ALL_PROVIDERS.map((p) => p.getCandidates(prefs, profile)))
  ).flat();

  const scored = scoreAllCandidates(allCandidates, {
    profile,
    feedback,
    context,
    prefs,
    recentlyShownIds,
  });

  const selected = selectDiverseFeed(scored, FEED_SIZE);

  const recommendations: Recommendation[] = selected.map((s, idx) => {
    const window = assignWindow(s.candidate.suitedWindows, context.isWeekend, context.hourOfDay);
    const rec: Recommendation = {
      id: makeId('rec'),
      candidateId: s.candidate.id,
      title: s.candidate.title,
      description: s.candidate.description,
      url: s.candidate.url,
      category: s.candidate.category,
      dna: s.dna,
      score: s.score,
      whyNow: buildWhyNow(s, profile),
      aiReasoning: buildAiReasoning(s, allCandidates.length, idx + 1),
      window,
      rank: idx + 1,
      generatedAt: Date.now(),
      status: 'pending',
    };
    return rec;
  });

  const rejections: RejectionExplanation[] = scored
    .filter((s) => s.score < LOW_SCORE_THRESHOLD)
    .slice(0, REJECTION_SAMPLE_SIZE)
    .map((s) => ({
      candidateId: s.candidate.id,
      title: s.candidate.title,
      category: s.candidate.category,
      reason: buildWhyNot(s),
      score: s.score,
    }));

  // Optionally enrich top recommendations with Groq LLM
  let finalRecommendations = recommendations;
  if (prefs.groqApiKey?.trim()) {
    try {
      finalRecommendations = await enrichWithGroq(recommendations, profile, prefs.groqApiKey.trim());
    } catch {
      // Silent fallback — keep template-generated recommendations
    }
  }

  const timeline = buildTimeline(finalRecommendations);

  return {
    timeline,
    feed: finalRecommendations,
    rejections,
    candidatesEvaluated: allCandidates.length,
    generatedAt: Date.now(),
  };
}
