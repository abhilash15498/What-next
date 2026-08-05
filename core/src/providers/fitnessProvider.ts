import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const items: Candidate[] = [
  {
    id: 'fit_45min_strength',
    title: 'Do a 45-minute strength workout',
    description: 'Full-body compound lifts (squat, hinge, push, pull) — good default when you have no specific split planned.',
    category: 'fitness',
    tags: ['fitness'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.75,
    addedAt: Date.parse('2025-06-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'fit_20min_mobility',
    title: 'Do a 20-minute mobility & stretching session',
    description: 'Hip, shoulder, and thoracic spine mobility work — pairs well after long study or coding sessions.',
    category: 'fitness',
    tags: ['fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.6,
    addedAt: Date.parse('2025-05-15'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'fit_5k_run',
    title: 'Run 5K at an easy pace',
    description: 'Zone 2 aerobic base-building run — low fatigue cost, good on a day with heavy mental workload.',
    category: 'fitness',
    tags: ['fitness'],
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    popularity: 0.7,
    addedAt: Date.parse('2025-04-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'fit_football_juggling',
    title: 'Practice 15 minutes of football ball-control drills',
    description: 'Cone dribbling and juggling reps — quick skill practice for a football fan wanting to stay sharp.',
    category: 'fitness',
    tags: ['football', 'fitness'],
    difficulty: 'beginner',
    estimatedMinutes: 15,
    popularity: 0.5,
    addedAt: Date.parse('2025-05-25'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'fit_weekend_long_walk',
    title: 'Take a 60-minute outdoor walk',
    description: 'Low-intensity movement good for recovery days and for thinking through unresolved project decisions.',
    category: 'fitness',
    tags: ['fitness', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 60,
    popularity: 0.55,
    addedAt: Date.parse('2025-06-15'),
    suitedWindows: ['weekend', 'tonight'],
  },
];

export const fitnessProvider: Provider = {
  category: 'fitness',
  name: 'Fitness Provider',
  getCandidates: (_prefs: Preferences, _profile: InterestProfile): Promise<Candidate[]> =>
    Promise.resolve(items),
};
