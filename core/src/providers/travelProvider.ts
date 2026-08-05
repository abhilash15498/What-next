import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';
import { topInterests } from '../interests/profile.js';

const STATIC_TRAVEL_ITEMS: Candidate[] = [
  {
    id: 'travel_weekend_getaway',
    title: 'Plan a 3-day weekend travel getaway',
    description:
      'Research nearby nature spots, historical towns, or coastal retreats for a short refreshing weekend escape.',
    url: 'https://www.google.com/travel',
    category: 'travel',
    tags: ['travel', 'lifestyle', 'outdoor'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.85,
    addedAt: Date.parse('2025-01-01'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'travel_scenic_roadtrip',
    title: 'Map out a scenic road trip route & food spots',
    description:
      'Discover scenic driving routes, local culinary hidden gems, and picturesque stopovers along the way.',
    url: 'https://www.google.com/maps',
    category: 'travel',
    tags: ['travel', 'food', 'photography'],
    difficulty: 'beginner',
    estimatedMinutes: 45,
    popularity: 0.82,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'travel_cultural_itinerary',
    title: 'Explore cultural & historical travel itineraries',
    description:
      'Curate a custom travel itinerary exploring art museums, heritage sites, and architectural landmarks.',
    url: 'https://www.wikivoyage.org',
    category: 'travel',
    tags: ['travel', 'culture', 'history'],
    difficulty: 'beginner',
    estimatedMinutes: 40,
    popularity: 0.8,
    addedAt: Date.parse('2025-01-15'),
    suitedWindows: ['tonight', 'weekend'],
  },
];

export const travelProvider: Provider = {
  category: 'travel',
  name: 'Travel & Trip Ideas Provider',
  async getCandidates(_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    const active = topInterests(profile, 5).filter((i) => i.score > 0);
    const dynamicItems: Candidate[] = [];

    for (const interest of active) {
      const tag = interest.name;
      const displayTag = tag.replace(/_/g, ' ');

      dynamicItems.push({
        id: `travel_dynamic_${tag}_itinerary`,
        title: `Plan a ${displayTag}-inspired travel & exploration trip`,
        description: `Research top destinations, hidden gems, and travel itineraries themed around ${displayTag}.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(displayTag + ' travel destination itinerary')}`,
        category: 'travel',
        tags: [tag, 'travel'],
        difficulty: 'beginner',
        estimatedMinutes: 35,
        popularity: 0.88,
        addedAt: Date.now(),
        suitedWindows: ['weekend', 'tonight'],
      });
    }

    return [...dynamicItems, ...STATIC_TRAVEL_ITEMS];
  },
};
