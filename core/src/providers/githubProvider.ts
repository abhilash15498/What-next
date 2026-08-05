import type { Candidate, InterestProfile, Preferences } from '../types.js';
import type { Provider } from './types.js';

// ── Static fallback for developers ─────────────────────────────────────────

const STATIC_ITEMS: Candidate[] = [
  {
    id: 'gh_modelcontextprotocol_sdk',
    title: 'Explore the official Model Context Protocol SDK',
    description:
      'Read through the reference TypeScript SDK for MCP — resources, tools, and prompts implemented end to end.',
    url: 'https://github.com/modelcontextprotocol/typescript-sdk',
    category: 'github',
    tags: ['mcp', 'ai', 'programming'],
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    popularity: 0.85,
    addedAt: Date.parse('2025-03-01'),
    suitedWindows: ['now', 'tomorrow'],
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
    id: 'gh_dexie',
    title: 'Explore Dexie.js on GitHub',
    description:
      'A minimal IndexedDB wrapper — read the documentation and live query examples.',
    url: 'https://github.com/dexie/Dexie.js',
    category: 'github',
    tags: ['programming', 'web_dev'],
    difficulty: 'beginner',
    estimatedMinutes: 25,
    popularity: 0.75,
    addedAt: Date.parse('2025-05-10'),
    suitedWindows: ['now'],
  },
];

const CODING_TAGS = new Set([
  'programming',
  'ai',
  'web_dev',
  'python',
  'quantum_computing',
  'mcp',
  'tools',
  'productivity',
  'github',
  'devops',
  'rust',
  'javascript',
  'typescript',
]);

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

function topCodingInterestQuery(profile: InterestProfile): string | null {
  const matched = Object.values(profile)
    .filter((i) => i.score > 0 && CODING_TAGS.has(i.name))
    .sort((a, b) => b.score - a.score)
    .map((i) => i.name.replace(/_/g, ' '));
  return matched.length > 0 ? matched.join(' ') : null;
}

function deriveDifficulty(repo: GithubRepo): Candidate['difficulty'] {
  const lang = repo.language?.toLowerCase() ?? '';
  if (lang === 'rust' || lang === 'haskell' || lang === 'c++') return 'advanced';
  if (repo.stargazers_count > 10000) return 'intermediate';
  return 'beginner';
}

async function fetchGithubCandidates(
  token: string,
  profile: InterestProfile,
): Promise<Candidate[]> {
  const query = topCodingInterestQuery(profile);
  if (!query) return []; // Non-coding profiles get no GitHub recommendations forced upon them

  const q = encodeURIComponent(query);
  const url = `https://api.github.com/search/repositories?q=${q}+is:public&sort=stars&order=desc&per_page=10`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'WhatNext-App',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = (await res.json()) as { items?: GithubRepo[] };
  if (!data.items?.length) return [];

  const maxStars = Math.max(...data.items.map((r) => r.stargazers_count), 1);

  return data.items.map((repo) => {
    const tags: string[] = ['programming'];
    const topics = repo.topics ?? [];
    if (topics.some((t) => t.includes('ai') || t.includes('ml') || t.includes('machine-learning'))) tags.push('ai');
    if (topics.some((t) => t.includes('web') || t.includes('frontend'))) tags.push('web_dev');

    return {
      id: `gh_live_${repo.id}`,
      title: `Explore ${repo.full_name} on GitHub`,
      description:
        repo.description
          ? repo.description.slice(0, 200) + (repo.description.length > 200 ? '…' : '')
          : `A popular ${repo.language ?? 'open source'} repository with ${repo.stargazers_count.toLocaleString()} stars.`,
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
    try {
      const fetched = await fetchGithubCandidates(prefs.githubToken?.trim() ?? '', profile);
      if (fetched.length > 0) return fetched;
    } catch {
      // Fall through
    }

    const hasCodingInterest = Object.values(profile).some((i) => i.score > 0 && CODING_TAGS.has(i.name));
    return hasCodingInterest ? STATIC_ITEMS : [];
  },
};
