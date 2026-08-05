import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Authentic Stock Market & Financial Analysis Catalog ──────────────────────

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
  {
    id: 'finance_bogleheads_index',
    title: 'Review low-cost index fund asset allocation (3-Fund Portfolio)',
    description:
      'Learn key principles of passive indexing, total stock market diversification, and dollar-cost averaging.',
    url: 'https://www.bogleheads.org/wiki/Three-fund_portfolio',
    category: 'finance',
    tags: ['stock_market', 'finance', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.88,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['now', 'weekend'],
  },
  {
    id: 'finance_fundamental_balance_sheet',
    title: 'Read fundamental analysis guide: balance sheets & FCF',
    description:
      'Understand free cash flow, operating margins, debt-to-equity, and income statement health before picking stocks.',
    url: 'https://www.investopedia.com/fundamental-analysis-4689757',
    category: 'finance',
    tags: ['stock_market', 'finance', 'investing'],
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    popularity: 0.86,
    addedAt: Date.parse('2025-01-20'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'finance_tech_earnings_reports',
    title: 'Analyze quarterly tech sector earnings & AI Capex guidance',
    description:
      'Review revenue growth, operating margins, and AI infrastructure capital expenditures across top market leaders.',
    url: 'https://www.google.com/finance',
    category: 'finance',
    tags: ['stock_market', 'finance', 'ai'],
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    popularity: 0.85,
    addedAt: Date.parse('2025-02-15'),
    suitedWindows: ['now', 'tonight'],
  },
];

const FINANCE_TAGS = new Set(['stock_market', 'finance', 'investing', 'entrepreneurship']);

export const financeProvider: Provider = {
  category: 'finance',
  name: 'Stock Market & Finance Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasFinanceInterest = Object.values(profile).some(
      (i) => i.score > 0 && FINANCE_TAGS.has(i.name),
    );
    return hasFinanceInterest ? AUTHENTIC_FINANCE_ITEMS : [];
  },
};
