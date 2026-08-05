import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

const STATIC_FINANCE_ITEMS: Candidate[] = [
  {
    id: 'finance_stock_watchlist',
    title: 'Review your stock market watch list & market trends',
    description:
      'Check key market indices (S&P 500, Nifty 50, Nasdaq), sector performance, and quarterly earnings trends.',
    url: 'https://finance.yahoo.com',
    category: 'finance',
    tags: ['stock_market', 'finance', 'investing'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.88,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'finance_fundamental_analysis',
    title: 'Study fundamental analysis & stock valuation metrics',
    description:
      'Understand P/E ratios, free cash flow, operating margins, and balance sheet health for long-term investing.',
    url: 'https://www.investopedia.com/fundamental-analysis-4689757',
    category: 'finance',
    tags: ['stock_market', 'finance', 'career'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.84,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['now', 'weekend'],
  },
  {
    id: 'finance_index_funds',
    title: 'Explore low-cost index funds & asset allocation',
    description:
      'Learn key principles of passive investing, index fund diversification, and dollar-cost averaging.',
    url: 'https://www.bogleheads.org/wiki/Bogleheads%C2%AE_investment_philosophy',
    category: 'finance',
    tags: ['stock_market', 'finance', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.86,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['now', 'weekend'],
  },
];

const PURE_MOVIE_TAGS = new Set(['bollywood', 'anime', 'movies', 'film', 'cinema']);

export const financeProvider: Provider = {
  category: 'finance',
  name: 'Stock Market & Finance Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const active = topInterests(profile, 5).filter((i) => i.score > 0);
    const dynamicItems: Candidate[] = [];

    for (const interest of active) {
      const tag = interest.name;
      if (PURE_MOVIE_TAGS.has(tag)) continue;
      const displayTag = tag.replace(/_/g, ' ');

      dynamicItems.push({
        id: `finance_dynamic_${tag}_analysis`,
        title: `Analyze stock market trends & companies in ${displayTag}`,
        description: `Research leading publicly traded stocks, sector innovations, and market updates related to ${displayTag}.`,
        url: `https://www.google.com/finance/quote/${encodeURIComponent(displayTag)}`,
        category: 'finance',
        tags: [tag, 'stock_market', 'finance'],
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        popularity: 0.86,
        addedAt: Date.now(),
        suitedWindows: ['now', 'tonight'],
      });
    }

    return [...dynamicItems, ...STATIC_FINANCE_ITEMS];
  },
};
