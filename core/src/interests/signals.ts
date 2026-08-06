import type { Category, Signal } from '../types.js';
import { makeId } from '../utils/id.js';

/**
 * Keyword -> interest tag dictionary. Deliberately deterministic and
 * inspectable (every tag WhatNext assigns can be traced back to a keyword
 * match), which is what lets the "Why Now?" explanations be honest rather
 * than hand-waved.
 */
export const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'llm', 'gpt', 'neural network', 'openai', 'anthropic', 'claude', 'chatbot', 'ai agent', 'transformer'],
  programming: ['programming', 'coding', 'developer', 'software engineer', 'algorithm', 'data structure', 'leetcode', 'stack overflow'],
  'browser-extensions': ['chrome extension', 'browser extension', 'manifest v3', 'web extension'],
  mcp: ['model context protocol', 'mcp server', 'mcp tool'],
  web_dev: ['react', 'typescript', 'javascript', 'frontend', 'vite', 'next.js', 'css', 'html'],
  python: ['python', 'django', 'flask', 'pandas', 'numpy'],
  quantum_computing: ['quantum computing', 'qubit', 'quantum circuit', 'qiskit', 'pennylane'],
  github: ['github', 'pull request', 'open source', 'repository', 'git commit'],
  football: ['football', 'real madrid', 'premier league', 'la liga', 'champions league', 'mbappe', 'messi', 'ronaldo'],
  fitness: ['workout', 'gym', 'fitness', 'running', 'strength training', 'cardio', 'yoga'],
  entrepreneurship: ['startup', 'entrepreneur', 'founder', 'venture capital', 'saas', 'product market fit'],
  movies: ['movie', 'film', 'cinema', 'trailer', 'imdb', 'director'],
  books: ['book', 'novel', 'author', 'reading list', 'goodreads'],
  music: ['music', 'song', 'album', 'playlist', 'spotify'],
  career: ['resume', 'job interview', 'linkedin', 'career', 'internship', 'hiring'],
  finance: ['stock market', 'investing', 'personal finance', 'budgeting'],
  news: ['breaking news', 'world news', 'current events'],
  travel: ['travel', 'itinerary', 'flight', 'destination'],
  design: ['ui design', 'ux design', 'figma', 'typography'],
  gaming: ['video game', 'gaming', 'playstation', 'xbox', 'steam'],
  productivity: ['productivity', 'time management', 'note taking', 'todo list'],
  cooking: ['cooking', 'recipe', 'food', 'chef', 'baking', 'culinary', 'meal prep', 'kitchen'],
};

const CATEGORY_HINTS: Record<Category, string[]> = {
  movie: ['movie', 'film', 'cinema', 'imdb', 'trailer', 'indian', 'bollywood', 'japanese', 'anime', 'hollywood'],
  book: ['book', 'novel', 'goodreads', 'reading list'],
  github: ['github', 'repository', 'pull request', 'open source'],
  learning: ['course', 'tutorial', 'learn', 'udemy', 'coursera'],
  coding_project: ['project idea', 'build a', 'side project'],
  fitness: ['workout', 'gym', 'fitness', 'yoga', 'running'],
  career: ['resume', 'job', 'internship', 'career', 'linkedin'],
  tool: ['tool', 'app', 'software', 'utility'],
  news: ['news', 'breaking', 'headline'],
  travel: ['travel', 'itinerary', 'flight', 'destination', 'vacation', 'hotel', 'trip'],
  finance: ['stock market', 'investing', 'portfolio', 'stocks', 'equity', 'shares', 'finance'],
  shopping: ['shopping', 'buy', 'deal', 'gear', 'amazon', 'store', 'cart', 'discount'],
};

export function isSensitiveDomain(url: string, blocklist: string[]): boolean {
  const lower = url.toLowerCase();
  return blocklist.some((entry) => lower.includes(entry.toLowerCase()));
}

/**
 * Classifies a small amount of non-sensitive page text (title + meta
 * description, or a search query) into weighted interest tags.
 * Never pass raw page body content, form values, or anything that could
 * contain credentials or personal data — this only ever sees titles/queries.
 */
export function classifyText(text: string): Array<{ tag: string; weight: number }> {
  const lower = text.toLowerCase();
  const matches: Array<{ tag: string; weight: number }> = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) hits += 1;
    }
    if (hits > 0) {
      const weight = Math.min(1, 0.35 + hits * 0.25);
      matches.push({ tag, weight });
    }
  }
  return matches;
}

export function guessCategory(text: string): Category | undefined {
  const lower = text.toLowerCase();
  for (const [category, hints] of Object.entries(CATEGORY_HINTS) as [Category, string[]][]) {
    if (hints.some((h) => lower.includes(h))) return category;
  }
  return undefined;
}

export function buildSignalFromPageVisit(params: {
  url: string;
  title: string;
  description?: string;
  blocklist: string[];
}): Signal | null {
  const { url, title, description = '', blocklist } = params;
  if (isSensitiveDomain(url, blocklist)) return null;

  const text = `${title} ${description}`.trim();
  const tags = classifyText(text);
  if (tags.length === 0) return null;

  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // keep raw string if URL parsing fails
  }

  return {
    id: makeId('sig'),
    source: 'page_visit',
    tags,
    category: guessCategory(text),
    timestamp: Date.now(),
    label: host,
  };
}

export function buildSignalFromSearch(query: string): Signal | null {
  const tags = classifyText(query);
  if (tags.length === 0) return null;
  return {
    id: makeId('sig'),
    source: 'search',
    tags,
    category: guessCategory(query),
    timestamp: Date.now(),
    label: query.slice(0, 80),
  };
}
