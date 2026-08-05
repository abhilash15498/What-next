import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const items: Candidate[] = [
  {
    id: 'career_update_linkedin_projects',
    title: 'Refresh your LinkedIn project section',
    description: 'Add your latest shipped project with a 2-line outcome-first summary and a link — recruiters scan this section first.',
    category: 'career',
    tags: ['career', 'programming'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.7,
    addedAt: Date.parse('2025-06-01'),
    suitedWindows: ['now', 'tonight'],
  },
  {
    id: 'career_ml_summer_school_followup',
    title: 'Follow up on your ML Summer School application',
    description: 'Check the application portal for status updates and prep a 60-second summary of your SOP in case of an interview.',
    category: 'career',
    tags: ['ai', 'career'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.6,
    addedAt: Date.parse('2025-07-15'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'career_mock_interview',
    title: 'Do one mock technical interview (45 min)',
    description: 'Practice a data structures/algorithms problem out loud on a whiteboard or shared doc — talking through it is the actual skill being tested.',
    category: 'career',
    tags: ['career', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.68,
    addedAt: Date.parse('2025-05-10'),
    suitedWindows: ['tomorrow', 'weekend'],
  },
  {
    id: 'career_open_source_contribution',
    title: 'Make your first open-source pull request',
    description: 'Find a "good first issue" label on a repo you already use and submit a small, well-scoped fix.',
    category: 'career',
    tags: ['github', 'programming', 'career'],
    difficulty: 'intermediate',
    estimatedMinutes: 90,
    popularity: 0.55,
    addedAt: Date.parse('2025-04-20'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'career_cold_outreach',
    title: 'Send 3 thoughtful cold outreach messages',
    description: 'Reach out to people working in quantum engineering or AI/ML roles you admire, referencing something specific from their work.',
    category: 'career',
    tags: ['career', 'entrepreneurship'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.5,
    addedAt: Date.parse('2025-03-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
];

export const careerProvider: Provider = {
  category: 'career',
  name: 'Career Provider',
  getCandidates: (_prefs: Preferences, _profile: InterestProfile): Promise<Candidate[]> =>
    Promise.resolve(items),
};
