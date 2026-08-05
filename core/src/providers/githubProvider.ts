import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Static fallback ────────────────────────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'gh_modelcontextprotocol_sdk',
    title: 'Explore the official Model Context Protocol SDK',
    description:
      'Read through the reference TypeScript SDK for MCP — resources, tools, and prompts implemented end to end.',
    url: 'https://github.com/modelcontextprotocol/typescript-sdk',
    category: 'github',
    tags: ['mcp', 'ai', 'programming', 'browser-extensions'],
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    popularity: 0.75,
    addedAt: Date.parse('2025-03-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'gh_qiskit',
    title: 'Explore Qiskit on GitHub',
    description:
      "IBM's open-source quantum computing SDK — browse the tutorials folder for runnable circuit examples.",
    url: 'https://github.com/Qiskit/qiskit',
    category: 'github',
    tags: ['quantum_computing', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    popularity: 0.72,
    addedAt: Date.parse('2025-02-01'),
    suitedWindows: ['now', 'tomorrow'],
  },
  {
    id: 'gh_awesome_chrome_extensions',
    title: "Browse 'awesome-chrome-extension'",
    description:
      'A curated list of Manifest V3 extension examples — good pattern reference for background workers and CSP handling.',
    url: 'https://github.com/topics/chrome-extension',
    category: 'github',
    tags: ['browser-extensions', 'programming'],
    difficulty: 'beginner',
    estimatedMinutes: 30,
    popularity: 0.68,
    addedAt: Date.parse('2025-04-01'),
    suitedWindows: ['now'],
  },
  {
    id: 'gh_transformers',
    title: "Read Hugging Face 'transformers' source",
    description:
      'Trace through the pipeline abstraction to see how tokenization, model loading, and inference are wired together.',
    url: 'https://github.com/huggingface/transformers',
    category: 'github',
    tags: ['ai', 'programming'],
    difficulty: 'advanced',
    estimatedMinutes: 90,
    popularity: 0.9,
    addedAt: Date.parse('2024-12-01'),
    suitedWindows: ['tomorrow', 'weekend'],
  },
  {
    id: 'gh_pennylane',
    title: 'Explore PennyLane on GitHub',
    description:
      'Cross-platform library for differentiable quantum programming — good next step after Qiskit basics.',
    url: 'https://github.com/PennyLaneAI/pennylane',
    category: 'github',
    tags: ['quantum_computing', 'ai'],
    difficulty: 'advanced',
    estimatedMinutes: 60,
    popularity: 0.6,
    addedAt: Date.parse('2025-01-20'),
    suitedWindows: ['tomorrow', 'weekend'],
  },
  {
    id: 'gh_dexie',
    title: 'Explore Dexie.js on GitHub',
    description:
      'The IndexedDB wrapper this very project uses — read the docs folder to understand live queries.',
    url: 'https://github.com/dexie/Dexie.js',
    category: 'github',
    tags: ['programming', 'web_dev'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.55,
    addedAt: Date.parse('2025-05-10'),
    suitedWindows: ['now'],
  },
];

// ── GitHub Search live fetch ──────────────────────────────────────────────────

interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  topics: string[];
  open_issues_count: number;
}

function topInterestQuery(profile: InterestProfile): string {
  const sorted = Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((i) => i.name.replace(/_/g, ' '));
  return sorted.length > 0 ? sorted.join(' ') : 'programming';
}

function deriveDifficulty(repo: GithubRepo): Candidate['difficulty'] {
  const stars = repo.stargazers_count;
  const lang = repo.language?.toLowerCase() ?? '';
  if (lang === 'rust' || lang === 'haskell' || lang === 'c++') return 'advanced';
  if (stars > 20000) return 'intermediate';
  return 'beginner';
}

async function fetchGithubCandidates(
  token: string,
  profile: InterestProfile,
): Promise<Candidate[]> {
  const q = encodeURIComponent(topInterestQuery(profile));
  const url = `https://api.github.com/search/repositories?q=${q}+is:public&sort=stars&order=desc&per_page=12`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = (await res.json()) as { items: GithubRepo[] };
  if (!data.items?.length) return STATIC_ITEMS;

  const maxStars = Math.max(...data.items.map((r) => r.stargazers_count), 1);

  return data.items.map((repo) => {
    const tags: string[] = ['programming'];
    const topics = repo.topics ?? [];
    if (topics.some((t) => t.includes('ai') || t.includes('ml') || t.includes('machine-learning'))) tags.push('ai');
    if (topics.some((t) => t.includes('quantum'))) tags.push('quantum_computing');
    if (topics.some((t) => t.includes('web') || t.includes('frontend'))) tags.push('web_dev');
    if (topics.some((t) => t.includes('extension') || t.includes('chrome'))) tags.push('browser-extensions');
    if (repo.language === 'TypeScript' || repo.language === 'JavaScript') tags.push('web_dev');

    return {
      id: `gh_live_${repo.id}`,
      title: `Explore ${repo.full_name} on GitHub`,
      description:
        repo.description
          ? repo.description.slice(0, 200) + (repo.description.length > 200 ? '…' : '')
          : `A popular ${repo.language ?? 'code'} repository with ${repo.stargazers_count.toLocaleString()} stars.`,
      url: repo.html_url,
      category: 'github' as const,
      tags: [...new Set(tags)],
      difficulty: deriveDifficulty(repo),
      estimatedMinutes: 30 + Math.round((repo.open_issues_count / 100) * 30),
      popularity: repo.stargazers_count / maxStars,
      addedAt: Date.parse(repo.pushed_at),
      suitedWindows: ['now', 'tomorrow'],
    };
  });
}

// ── Provider ───────────────────────────────────────────────────────────────────

export const githubProvider: Provider = {
  category: 'github',
  name: 'GitHub Repository Provider (live)',
  async getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]> {
    if (prefs.githubToken?.trim()) {
      try {
        return await fetchGithubCandidates(prefs.githubToken.trim(), profile);
      } catch {
        // Fall through to static list
      }
    }
    return STATIC_ITEMS;
  },
};
