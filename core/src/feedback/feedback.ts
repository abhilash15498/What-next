import type { Storage } from '../storage/types.js';
import type { FeedbackType, Recommendation } from '../types.js';
import { reinforceTags } from '../interests/profile.js';
import { makeId } from '../utils/id.js';

const STATUS_BY_FEEDBACK: Record<FeedbackType, Recommendation['status']> = {
  useful: 'useful',
  not_interested: 'not_interested',
  save: 'saved',
  later: 'later',
  more_like_this: 'useful',
};

export async function recordFeedback(
  storage: Storage,
  recommendation: Recommendation,
  type: FeedbackType,
): Promise<void> {
  await storage.addFeedback({
    id: makeId('fb'),
    recommendationId: recommendation.id,
    candidateId: recommendation.candidateId,
    category: recommendation.category,
    tags: recommendation.dna.tags,
    type,
    timestamp: Date.now(),
  });

  await storage.updateRecommendationStatus(recommendation.id, STATUS_BY_FEEDBACK[type]);

  const direction: 'up' | 'down' =
    type === 'not_interested' ? 'down' : type === 'useful' || type === 'more_like_this' ? 'up' : 'up';
  const magnitude = type === 'more_like_this' ? 10 : type === 'not_interested' ? 8 : 5;

  const profile = await storage.getInterestProfile();
  const updated = reinforceTags(profile, recommendation.dna.tags, direction, magnitude);
  await storage.saveInterestProfile(updated);
}
