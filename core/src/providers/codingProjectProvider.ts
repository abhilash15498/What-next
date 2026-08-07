import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

const items: Candidate[] = [
  {
    id: 'proj_mcp_chrome_extension',
    title: 'Build an MCP-powered Chrome Extension feature',
    description: 'Wire a small Model Context Protocol resource into an existing extension so an AI client can query live page context.',
    category: 'coding_project',
    tags: ['mcp', 'browser-extensions', 'ai'],
    difficulty: 'advanced',
    estimatedMinutes: 180,
    popularity: 0.6,
    addedAt: Date.parse('2025-06-10'),
    suitedWindows: ['weekend', 'now'],
  },
  {
    id: 'proj_rag_study_assistant',
    title: 'Extend your RAG study-assistant with re-ranking',
    description: 'Add a cross-encoder re-ranking pass on top of your existing retrieval step to improve answer relevance.',
    category: 'coding_project',
    tags: ['ai', 'programming'],
    difficulty: 'advanced',
    estimatedMinutes: 150,
    popularity: 0.55,
    addedAt: Date.parse('2025-05-01'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'proj_stress_detection_prototype',
    title: 'Prototype the rPPG stress-signal module',
    description: 'Build a standalone webcam heart-rate estimator (rPPG) as an isolated module before wiring it into the full multimodal pipeline.',
    category: 'coding_project',
    tags: ['ai', 'programming'],
    difficulty: 'advanced',
    estimatedMinutes: 200,
    popularity: 0.5,
    addedAt: Date.parse('2025-07-10'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'proj_quantum_circuit_simulator',
    title: 'Write a 2-qubit circuit simulator from scratch',
    description: 'Implement state vectors and gate matrices by hand (no Qiskit) to internalize the linear algebra before relying on a framework.',
    category: 'coding_project',
    tags: ['quantum_computing', 'programming'],
    difficulty: 'advanced',
    estimatedMinutes: 120,
    popularity: 0.45,
    addedAt: Date.parse('2025-04-15'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'proj_portfolio_site_v2',
    title: 'Ship v2 of your AI/ML portfolio website',
    description: 'Add project case studies with architecture diagrams for your flagship builds — recruiters skim, so lead with outcomes.',
    category: 'coding_project',
    tags: ['career', 'web_dev'],
    difficulty: 'intermediate',
    estimatedMinutes: 150,
    popularity: 0.65,
    addedAt: Date.parse('2025-06-20'),
    suitedWindows: ['weekend'],
  },
  {
    id: 'proj_cli_habit_tracker',
    title: 'Build a 1-evening CLI habit tracker',
    description: 'A tiny scoped project — SQLite + a Python CLI — good for a low-effort momentum win between bigger builds.',
    category: 'coding_project',
    tags: ['programming', 'productivity'],
    difficulty: 'beginner',
    estimatedMinutes: 90,
    popularity: 0.4,
    addedAt: Date.parse('2025-03-05'),
    suitedWindows: ['now', 'tonight'],
  },
];

const CODING_TAGS = new Set(['programming', 'ai', 'mcp', 'quantum_computing', 'web_dev', 'browser-extensions']);

export const codingProjectProvider: Provider = {
  category: 'coding_project',
  name: 'Coding Project Provider',
  getCandidates: (_prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> => {
    const hasCodingInterest = Object.values(profile).some(
      (i) => i.score > 0 && CODING_TAGS.has(i.name),
    );
    if (!hasCodingInterest) return Promise.resolve([]);
    return Promise.resolve(items);
  },
};
