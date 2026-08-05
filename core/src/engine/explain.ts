import type { InterestProfile } from '../types.js';
import type { ScoredCandidate } from './rank.js';

function formatTagList(tags: string[]): string {
  const readable = tags.map((t) => t.replace(/_/g, ' ').replace(/-/g, ' '));
  if (readable.length === 0) return 'your general activity';
  if (readable.length === 1) return readable[0];
  if (readable.length === 2) return `${readable[0]} and ${readable[1]}`;
  return `${readable.slice(0, -1).join(', ')}, and ${readable[readable.length - 1]}`;
}

function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function buildWhyNow(scored: ScoredCandidate, profile: InterestProfile): string {
  const { interestMatchTags, dna, candidate } = scored;
  const time = timeLabel(candidate.estimatedMinutes);

  const activeInterests = Object.entries(profile)
    .filter(([_, i]) => i.score > 0)
    .map(([name, i]) => ({ tag: name, score: i.score }));

  if (activeInterests.length > 0 && interestMatchTags.length > 0) {
    const primaryTag = interestMatchTags[0].replace(/_/g, ' ');
    return `Selected specifically for your interest in ${primaryTag}. This ${candidate.difficulty} ${candidate.category} activity takes about ${time} and matches your current preferences.`;
  }

  if (activeInterests.length > 0) {
    const topUserTag = activeInterests.sort((a, b) => b.score - a.score)[0].tag.replace(/_/g, ' ');
    return `You're exploring ${topUserTag} — this high-quality ${candidate.category} recommendation was selected to expand your activity mix in ${time}.`;
  }

  return `A curated discovery pick (${Math.round(dna.popularity * 100)}% popularity) taking ${time}. Interact with recommendations to personalize your engine.`;
}

export function buildWhyNot(scored: ScoredCandidate): string {
  const reasons: string[] = [];
  if (scored.dna.interestMatch < 0.2) {
    reasons.push("it doesn't closely match any of your currently tracked interests");
  }
  if (scored.dna.freshness < 0.3) {
    reasons.push('this item has been in the pool for a while without new signals to refresh it');
  }
  if (scored.dna.confidence < 40) {
    reasons.push("we don't yet have enough signal to be confident this is a good fit");
  }
  if (reasons.length === 0) {
    reasons.push('other candidates scored higher for your current context and available time');
  }
  return `Skipped this time — ${reasons.join(', and ')}.`;
}

export function buildAiReasoning(
  scored: ScoredCandidate,
  candidatesEvaluated: number,
  rank: number,
): string {
  const pct = Math.round(scored.dna.confidence);
  const scoreLabel = scored.score >= 75 ? 'strong' : scored.score >= 50 ? 'solid' : 'moderate';

  const matchPhrase = scored.interestMatchTags.length
    ? `Your recent activity around ${formatTagList(scored.interestMatchTags)} gave this a boost`
    : 'No strong interest match was found — popularity and freshness drove the ranking';

  const rankPhrase =
    rank === 1
      ? 'It came out as your #1 pick'
      : rank <= 3
        ? `It ranked #${rank} — very close to the top`
        : `It ranked #${rank} out of ${candidatesEvaluated} candidates`;

  return `${matchPhrase}. ${rankPhrase} with a ${scoreLabel} score of ${scored.score}/100. There's an estimated ${pct}% chance this will feel genuinely useful to you right now.`;
}
