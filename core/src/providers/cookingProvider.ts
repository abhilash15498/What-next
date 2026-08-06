import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Curated fallback catalog ──────────────────────────────────────────────────

const COOKING_CATALOG: Candidate[] = [
  {
    id: 'cook_carbonara',
    title: 'Master classic 20-minute Italian Carbonara',
    description:
      'Learn traditional Roman Carbonara using egg yolks, Pecorino Romano, guanciale, and fresh black pepper — no cream needed.',
    url: 'https://www.youtube.com/results?search_query=classic+authentic+carbonara+recipe',
    category: 'shopping',
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
    category: 'shopping',
    tags: ['cooking', 'food'],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    popularity: 0.95,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['now'],
  },
];

interface MealDBItem {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strYoutube?: string;
}

async function fetchLiveMealDBCandidates(profile: InterestProfile): Promise<Candidate[]> {
  const activeFoodTag = Object.values(profile).find(
    (i) => i.score > 0 && (i.name === 'cooking' || i.name === 'food'),
  )?.name ?? 'pasta';

  const query = activeFoodTag === 'cooking' ? 'chicken' : activeFoodTag;
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('MealDB error');
    const data = (await res.json()) as { meals?: MealDBItem[] };
    if (!data.meals?.length) return [];

    return data.meals.slice(0, 5).map((meal) => {
      const desc = meal.strInstructions
        ? meal.strInstructions.slice(0, 180).replace(/\r\n/g, ' ') + '…'
        : `A popular ${meal.strArea ?? ''} ${meal.strCategory ?? 'food'} recipe for home cooking.`;

      return {
        id: `mealdb_${meal.idMeal}`,
        title: `Cook Live Recipe: ${meal.strMeal}`,
        description: desc,
        url: meal.strYoutube || `https://www.google.com/search?q=${encodeURIComponent(meal.strMeal + ' recipe')}`,
        category: 'shopping' as const,
        tags: ['cooking', 'food'],
        difficulty: 'beginner' as const,
        estimatedMinutes: 30,
        popularity: 0.9,
        addedAt: Date.now(),
        suitedWindows: ['tonight', 'weekend'],
      };
    });
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export const cookingProvider: Provider = {
  category: 'shopping',
  name: 'Cooking & Culinary Provider (TheMealDB)',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const hasCookingInterest = Object.values(profile).some(
      (i) => i.score > 0 && (i.name === 'cooking' || i.name === 'food'),
    );
    if (!hasCookingInterest) return [];

    try {
      const liveMeals = await fetchLiveMealDBCandidates(profile);
      if (liveMeals.length > 0) return liveMeals;
    } catch {
      // Fall through
    }

    return COOKING_CATALOG;
  },
};
