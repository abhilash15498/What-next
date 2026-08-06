import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { cleanTitle } from '../utils/text.js';

// ── Authentic Stock Market & Financial Analysis Fallback Catalog ──────────────

const AUTHENTIC_FINANCE_ITEMS: Candidate[] = [
  {
    id: 'finance_sp500_pe_ratio',
    title: 'Analyze S&P 500 P/E valuation metrics & market trends',
    description:
      'Check historical price-to-earnings ratios, dividend yields, and macroeconomic interest rate expectations across market sectors.',
    url: 'https://finance.yahoo.com/quote/%5EGSPC',
    category: 'finance',
    tags: ['stock_market', 'finance', 'investing'],
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    popularity: 0.9,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'finance_warren_buffett_letters',
    title: "Study Warren Buffett's letters to Berkshire shareholders",
    description:
      'Read timeless principles on economic moats, margin of safety, owner earnings, and long-term capital allocation.',
    url: 'https://www.berkshirehathaway.com/letters/letters.html',
    category: 'finance',
    tags: ['stock_market', 'finance', 'investing'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.92,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['now', 'weekend'],
  },
];

const FINANCE_TAGS = new Set(['stock_market', 'finance', 'investing', 'entrepreneurship']);

async function fetchLiveFinanceRSS(query: string): Promise<Candidate[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const text = await res.text();
    const items: Candidate[] = [];
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || [];

    for (let i = 0; i < Math.min(itemMatches.length, 5); i++) {
      const raw = itemMatches[i];
      const titleMatch = raw.match(/<title>(.*?)<\/title>/);
      const linkMatch = raw.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = raw.match(/<pubDate>(.*?)<\/pubDate>/);

      if (titleMatch && linkMatch) {
        const rawTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/ - .*$/, '').trim();
        const title = cleanTitle(rawTitle);
        const link = linkMatch[1].trim();

        items.push({
          id: `finance_rss_${i}_${Date.now()}`,
          title: `Market News: ${title}`,
          description: `Live market coverage and financial metrics on ${query}.`,
          url: link,
          category: 'finance',
          tags: ['stock_market', 'finance'],
          difficulty: 'intermediate',
          estimatedMinutes: 15,
          popularity: 0.9,
          addedAt: pubDateMatch ? Date.parse(pubDateMatch[1]) || Date.now() : Date.now(),
          suitedWindows: ['now', 'tonight'],
        });
      }
    }
    return items;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const financeProvider: Provider = {
  category: 'finance',
  name: 'Stock Market & Finance Provider (Live RSS)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasFinanceInterest = Object.values(profile).some(
      (i) => i.score > 0 && FINANCE_TAGS.has(i.name),
    );
    if (!hasFinanceInterest) return [];

    try {
      const liveFinance = await fetchLiveFinanceRSS('stock market tech earnings S&P 500');
      if (liveFinance.length > 0) return liveFinance;
    } catch {
      // Fallback
    }

    return AUTHENTIC_FINANCE_ITEMS;
  },
};
