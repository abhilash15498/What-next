import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Authentic Curated Travel & Trip Ideas Catalog ────────────────────────────

const REAL_TRAVEL_ITEMS: Candidate[] = [
  {
    id: 'travel_kerala_backwaters',
    title: 'Plan a Kerala backwaters & South India coastal trip',
    description:
      'Explore serene houseboat backwaters, tea plantations in Munnar, and palm-fringed coastal retreats.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'lifestyle', 'outdoor'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.9,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'travel_goa_beach_food',
    title: 'Plan a Goa weekend beach escape & culinary food tour',
    description:
      'Discover quiet hidden beaches, fresh coastal seafood shacks, and historic Latin Quarter architecture in Fontainhas.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'food', 'lifestyle'],
    difficulty: 'beginner',
    estimatedMinutes: 35,
    popularity: 0.88,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'travel_manali_ladakh',
    title: 'Plan a Himalayan mountain road trip: Manali & Leh Ladakh',
    description:
      'Scenic high-altitude mountain passes, Pangong lake, Buddhist monasteries, and mountain adventure culture.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'outdoor'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.86,
    addedAt: Date.parse('2025-02-10'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'travel_coorg_plantation',
    title: 'Explore Coorg & Western Ghats coffee plantation retreat',
    description:
      'Misty hills, spice plantations, waterfalls, and nature trekking trails in Karnataka.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'outdoor', 'lifestyle'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.85,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'travel_scenic_roadtrip',
    title: 'Map out a 3-day scenic road trip route & food stops',
    description:
      'Discover scenic driving routes, local culinary hidden gems, and picturesque stopovers along the way.',
    url: 'https://www.google.com/maps',
    category: 'travel',
    tags: ['travel', 'food', 'photography'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.84,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
];

const TRAVEL_TAGS = new Set(['travel', 'outdoor', 'lifestyle']);

export const travelProvider: Provider = {
  category: 'travel',
  name: 'Travel & Trip Ideas Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasTravelInterest = Object.values(profile).some(
      (i) => i.score > 0 && TRAVEL_TAGS.has(i.name),
    );
    return hasTravelInterest ? REAL_TRAVEL_ITEMS : [];
  },
};
