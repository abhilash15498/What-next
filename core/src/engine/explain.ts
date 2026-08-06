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

  // Clean candidate title prefix (e.g., 'Watch Punk Football' -> 'Punk Football')
  const titleClean = candidate.title
    .replace(/^(Watch|Explore|Master|Read|Plan|Study|Practice|Learn)\s+/i, '')
    .trim();

  // Create candidate-specific description summary snippet
  let descSnippet = candidate.description.trim();
  if (descSnippet.length > 95) {
    descSnippet = descSnippet.slice(0, 92) + '…';
  }
  // Ensure friendly sentence flow
  const descClause = descSnippet.charAt(0).toLowerCase() + descSnippet.slice(1);

  const activeInterests = Object.entries(profile)
    .filter(([_, i]) => i.score > 0)
    .map(([name, i]) => ({ tag: name, score: i.score }));

  if (activeInterests.length > 0 && interestMatchTags.length > 0) {
    const primaryTag = interestMatchTags[0].replace(/_/g, ' ');
    return `Matches your interest in ${primaryTag} — "${titleClean}" offers ${descClause} Fits well into a ${time} session today.`;
  }

  if (activeInterests.length > 0) {
    const topUserTag = activeInterests.sort((a, b) => b.score - a.score)[0].tag.replace(/_/g, ' ');
    return `Selected while exploring ${topUserTag} — "${titleClean}" (${descClause}) expands your activity mix in ${time}.`;
  }

  return `"${titleClean}" is a high-appeal discovery pick (${Math.round(dna.popularity * 100)}% popularity) covering ${descClause} Takes ${time}.`;
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
  const { interestMatchTags, score, dna } = scored;
  const tagStr = formatTagList(interestMatchTags);
  const confidence = Math.round(dna.confidence);

  return `Your recent activity around ${tagStr} gave this a boost. It ranked #${rank} out of ${candidatesEvaluated} candidates with a solid score of ${score}/100. There's an estimated ${confidence}% chance this will feel genuinely useful to you right now.`;
}
