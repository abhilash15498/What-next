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

  // No profile signals yet — new user
  if (interestMatchTags.length === 0) {
    return `We haven't built up a picture of your interests yet, so this is a curated discovery pick — it has strong general appeal (${Math.round(dna.popularity * 100)}% popularity) and only takes ${time}. Give it a try and your future recommendations will get sharper.`;
  }

  const topTag = interestMatchTags
    .map((t) => ({ tag: t, score: profile[t]?.score ?? 0 }))
    .sort((a, b) => b.score - a.score)[0];

  const rising = interestMatchTags.some((t) => profile[t]?.trend === 'rising');
  const risingTag = interestMatchTags.find((t) => profile[t]?.trend === 'rising');

  const trendClause = rising && risingTag
    ? ` Your interest in ${risingTag.replace(/_/g, ' ')} has been rising lately —`
    : '';

  const matchClause = topTag
    ? `"${topTag.tag.replace(/_/g, ' ')}" is your #${
        Object.values(profile)
          .sort((a, b) => b.score - a.score)
          .findIndex((i) => i.name === topTag.tag) + 1
      } tracked interest right now (score ${Math.round(topTag.score)}/100).`
    : '';

  return `${trendClause} this lines up with your interest in ${formatTagList(interestMatchTags)}. ${matchClause} It's a ${candidate.difficulty} activity at ${time} — fits your current level and available time.`.trim();
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
