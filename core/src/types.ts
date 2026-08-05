/**
 * WhatNext? core domain types.
 * This package is storage-agnostic and has zero IO / browser / node dependencies.
 * It is consumed by the Chrome extension (via an IndexedDB adapter) and the
 * MCP server (via a SQLite adapter) — both implement the `Storage` interface
 * declared in `storage/types.ts` and pass it into the functions here.
 */

export type Category =
  | 'movie'
  | 'book'
  | 'github'
  | 'learning'
  | 'coding_project'
  | 'fitness'
  | 'career'
  | 'tool'
  | 'news';

export type TimeWindow = 'now' | 'tonight' | 'tomorrow' | 'weekend';

export type FeedbackType = 'useful' | 'not_interested' | 'save' | 'later' | 'more_like_this';

/** A single interest node in the user's Interest Graph. */
export interface Interest {
  /** normalized lowercase tag, e.g. "ai", "football", "fitness" */
  name: string;
  /** 0-100 strength of interest */
  score: number;
  /** 0-1 confidence in the score, grows with more signal volume */
  confidence: number;
  /** ms epoch timestamps of recent reinforcing signals (capped, most recent last) */
  recentActivity: number[];
  /** 'rising' | 'falling' | 'flat' computed from score deltas over recent window */
  trend: 'rising' | 'falling' | 'flat';
  /** tag -> co-occurrence weight (0-1), how often this interest appears alongside another */
  relationships: Record<string, number>;
  lastUpdated: number;
}

export type InterestProfile = Record<string, Interest>;

/** A raw behavioural signal captured by the extension (never includes sensitive content). */
export interface Signal {
  id: string;
  /** which surface produced it */
  source: 'page_visit' | 'search' | 'feedback' | 'manual';
  /** classified interest tags with a per-signal strength 0-1 */
  tags: Array<{ tag: string; weight: number }>;
  /** coarse category if known */
  category?: Category;
  timestamp: number;
  /** short, non-sensitive label for display in history, e.g. domain or query term */
  label: string;
}

/** DNA metadata attached to every recommendation candidate. */
export interface RecommendationDNA {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  category: Category;
  tags: string[];
  popularity: number; // 0-1
  freshness: number; // 0-1, decays with dataset age
  interestMatch: number; // 0-1
  confidence: number; // 0-100
}

/** A raw candidate produced by a provider, before ranking. */
export interface Candidate {
  id: string;
  title: string;
  description: string;
  url?: string;
  category: Category;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  popularity: number; // 0-1, static dataset prior
  addedAt: number; // ms epoch, used to compute freshness decay
  /** best time-of-day / context this item suits, used for timeline bucketing */
  suitedWindows: TimeWindow[];
}

/** A fully ranked & explained recommendation, ready for the UI. */
export interface Recommendation {
  id: string;
  candidateId: string;
  title: string;
  description: string;
  url?: string;
  category: Category;
  dna: RecommendationDNA;
  score: number; // 0-100 final ranked score
  whyNow: string;
  aiReasoning: string;
  window: TimeWindow;
  rank: number;
  generatedAt: number;
  status: 'pending' | 'useful' | 'not_interested' | 'saved' | 'later' | 'dismissed';
}

/** Explanation for a candidate that scored too low to surface. */
export interface RejectionExplanation {
  candidateId: string;
  title: string;
  category: Category;
  reason: string;
  score: number;
}

export interface FeedbackRecord {
  id: string;
  recommendationId: string;
  candidateId: string;
  category: Category;
  tags: string[];
  type: FeedbackType;
  timestamp: number;
}

export interface Preferences {
  /** categories the user has turned off entirely */
  disabledCategories: Category[];
  /** hours per day the user realistically has for "estimated usefulness" matching */
  availableMinutesPerDay: number;
  darkMode: boolean;
  /** opt-in, off by default: sync anonymized-locally profile snapshot to local MCP server */
  mcpSyncEnabled: boolean;
  mcpSyncUrl: string;
  /** BYOK — optional, used only client-side to enrich reasoning text. Never sent anywhere but Anthropic's API directly from the user's browser. */
  anthropicApiKey?: string;
  /** BYOK — TMDB API key for live movie/TV recommendations. https://www.themoviedb.org/settings/api */
  tmdbApiKey?: string;
  /** BYOK — Google Books API key for live book recommendations. https://console.cloud.google.com */
  googleBooksApiKey?: string;
  /** BYOK — GitHub personal access token for live repo recommendations. https://github.com/settings/tokens */
  githubToken?: string;
  /** BYOK — NewsAPI key for live news recommendations. https://newsapi.org */
  newsApiKey?: string;
  /** BYOK — Groq API key for LLM-powered recommendation reasoning. https://console.groq.com/keys */
  groqApiKey?: string;
  domainBlocklist: string[];
  onboardingCompleted: boolean;
}

export interface CurrentContext {
  hourOfDay: number;
  dayOfWeek: number; // 0=Sunday
  isWeekend: boolean;
  minutesRemainingToday: number;
}

export interface EngineResult {
  timeline: Record<TimeWindow, Recommendation[]>;
  feed: Recommendation[];
  rejections: RejectionExplanation[];
  candidatesEvaluated: number;
  generatedAt: number;
}

export interface DailyDigest {
  date: string; // YYYY-MM-DD
  headline: string;
  topRecommendation: Recommendation | null;
  byCategory: Partial<Record<Category, Recommendation>>;
  generatedAt: number;
}
