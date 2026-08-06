import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Authentic Curated Shopping & Deals Catalog ───────────────────────────────

const SHOPPING_ITEMS: Candidate[] = [
  {
    id: 'shop_ergo_keyboard',
    title: 'Explore Ergonomic Mechanical Split Keyboards (Keychron / MX Keys)',
    description:
      'Compare low-profile split mechanical keyboards for posture comfort during long coding and writing sessions.',
    url: 'https://www.google.com/search?tbm=shop&q=ergonomic+mechanical+keyboard',
    category: 'shopping',
    tags: ['programming', 'productivity', 'tools'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.88,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'shop_chef_knife_castiron',
    title: 'Browse Japanese 8-inch Gyuto Chef Knives & Lodge Cast Iron Skillets',
    description:
      'High-carbon stainless steel kitchen knives and pre-seasoned cast iron skillets for precision home cooking.',
    url: 'https://www.google.com/search?tbm=shop&q=japanese+gyuto+chef+knife+8+inch',
    category: 'shopping',
    tags: ['cooking', 'food'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.9,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['tonight', 'weekend'],
  },
  {
    id: 'shop_football_boots',
    title: 'Check Firm Ground Football Boots & Precision Training Balls (Nike / Adidas)',
    description:
      'Compare lightweight firm-ground studs and match-grade footballs for turf and grass pitch sessions.',
    url: 'https://www.google.com/search?tbm=shop&q=firm+ground+football+boots',
    category: 'shopping',
    tags: ['football', 'fitness'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.85,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'shop_anc_headphones',
    title: 'Compare Active Noise Cancelling Wireless Headphones (Sony WH-1000XM5 / Bose)',
    description:
      'Top-rated active noise cancelling over-ear headphones for deep focus work, travel, and acoustic listening.',
    url: 'https://www.google.com/search?tbm=shop&q=active+noise+cancelling+headphones',
    category: 'shopping',
    tags: ['productivity', 'travel', 'lifestyle'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.92,
    addedAt: Date.parse('2025-01-20'),
    suitedWindows: ['now', 'weekend'],
  },
  {
    id: 'shop_standing_desk',
    title: 'Explore Electric Dual-Motor Height Adjustable Standing Desks',
    description:
      'Electric motorized sit-stand desks with memory presets to alternate between sitting and standing.',
    url: 'https://www.google.com/search?tbm=shop&q=electric+standing+desk+dual+motor',
    category: 'shopping',
    tags: ['productivity', 'fitness', 'career'],
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    popularity: 0.84,
    addedAt: Date.parse('2025-02-05'),
    suitedWindows: ['weekend'],
  },
];

export const shoppingProvider: Provider = {
  category: 'shopping',
  name: 'Shopping & Gear Deals Provider',
  getCandidates(_prefs: Preferences, _profile: InterestProfile): Promise<Candidate[]> {
    return Promise.resolve(SHOPPING_ITEMS);
  },
};
