import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const items: Candidate[] = [
  {
    id: 'tool_obsidian',
    title: 'Set up Obsidian for project notes',
    description: 'Local-first, markdown-based note tool — a natural fit if you like keeping data privacy-first, same philosophy as this extension.',
    category: 'tool',
    tags: ['productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.65,
    addedAt: Date.parse('2025-01-05'),
    suitedWindows: ['now'],
  },
  {
    id: 'tool_react_flow',
    title: 'Try React Flow for a graph-based UI',
    description: 'Node-based diagram library — worth exploring for any project that needs to visualize relationships (like an interest graph).',
    category: 'tool',
    tags: ['web_dev', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    popularity: 0.5,
    addedAt: Date.parse('2025-05-20'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'tool_postman',
    title: 'Set up a Postman/Bruno collection for your APIs',
    description: 'Organize and version your API request collections instead of re-typing curl commands.',
    category: 'tool',
    tags: ['programming'],
    difficulty: 'beginner',
    estimatedMinutes: 20,
    popularity: 0.55,
    addedAt: Date.parse('2024-11-20'),
    suitedWindows: ['now'],
  },
  {
    id: 'tool_notion_tracker',
    title: 'Build a lightweight Notion project tracker',
    description: 'A simple kanban across your in-flight projects (SENTINEL, Reality Check, StockTrack, etc.) so nothing silently stalls.',
    category: 'tool',
    tags: ['productivity', 'career'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.6,
    addedAt: Date.parse('2025-02-25'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'tool_qiskit_lab',
    title: 'Install Qiskit + set up a local Jupyter quantum lab',
    description: 'One-time environment setup so every future quantum-roadmap session starts with zero friction.',
    category: 'tool',
    tags: ['quantum_computing', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    popularity: 0.45,
    addedAt: Date.parse('2025-03-15'),
    suitedWindows: ['now'],
  },
];

export const toolProvider: Provider = {
  category: 'tool',
  name: 'Tool Provider',
  getCandidates: (_prefs: Preferences, _profile: InterestProfile): Promise<Candidate[]> =>
    Promise.resolve(items),
};
