import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const COOKING_CATALOG: Candidate[] = [
  {
    id: 'cook_carbonara',
    title: 'Master classic 20-minute Italian Carbonara',
    description:
      'Learn traditional Roman Carbonara using egg yolks, Pecorino Romano, guanciale, and fresh black pepper — no cream needed.',
    url: 'https://www.youtube.com/results?search_query=classic+authentic+carbonara+recipe',
    category: 'tool',
    tags: ['cooking', 'food'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.92,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['tonight', 'now'],
  },
  {
    id: 'cook_gordon_ramsay_eggs',
    title: "Master Gordon Ramsay's scrambled eggs technique",
    description:
      'Learn the low-and-slow butter and crème fraîche technique for creamy, cafe-quality scrambled eggs.',
    url: 'https://www.youtube.com/results?search_query=gordon+ramsay+perfect+scrambled+eggs',
    category: 'tool',
    tags: ['cooking', 'food'],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    popularity: 0.95,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['now'],
  },
  {
    id: 'cook_meal_prep',
    title: 'Prep 4 days of healthy high-protein meals',
    description:
      'Batch cook marinated chicken/tofu, roasted vegetables, and quinoa to save 5+ hours during the busy week.',
    url: 'https://www.youtube.com/results?search_query=weekly+high+protein+meal+prep',
    category: 'tool',
    tags: ['cooking', 'food', 'fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 60,
    popularity: 0.88,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'cook_knife_skills',
    title: 'Practice fundamental chef knife skills & cutting dicing',
    description:
      'Master claw grip, rock chopping, julienne, and dicing techniques to double your speed in the kitchen.',
    url: 'https://www.youtube.com/results?search_query=basic+chef+knife+skills+tutorial',
    category: 'tool',
    tags: ['cooking', 'food'],
    difficulty: 'beginner',
    estimatedMinutes: 15,
    popularity: 0.85,
    addedAt: Date.parse('2025-01-20'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'cook_cast_iron_steak',
    title: 'Sear a restaurant-quality cast iron steak with herb butter',
    description:
      'Learn high-heat searing, butter basting with garlic & rosemary, and proper resting for perfect medium-rare.',
    url: 'https://www.youtube.com/results?search_query=how+to+sear+steak+cast+iron+baste',
    category: 'tool',
    tags: ['cooking', 'food'],
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    popularity: 0.9,
    addedAt: Date.parse('2025-02-10'),
    suitedWindows: ['tonight', 'weekend'],
  },
];

export const cookingProvider: Provider = {
  category: 'tool',
  name: 'Cooking & Culinary Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasCookingInterest = Object.values(profile).some(
      (i) => i.score > 0 && (i.name === 'cooking' || i.name === 'food'),
    );
    return hasCookingInterest ? COOKING_CATALOG : [];
  },
};
