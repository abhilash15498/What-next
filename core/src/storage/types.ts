import type {
  DailyDigest,
  FeedbackRecord,
  InterestProfile,
  Preferences,
  Recommendation,
  Signal,
} from '../types.js';

/**
 * Storage is the only IO boundary the core engine touches. Implement this
 * once per runtime (IndexedDB in the browser extension, SQLite in the MCP
 * server) and every engine function in this package works unmodified.
 */
export interface Storage {
  getInterestProfile(): Promise<InterestProfile>;
  saveInterestProfile(profile: InterestProfile): Promise<void>;

  addSignal(signal: Signal): Promise<void>;
  getRecentSignals(limitMs: number): Promise<Signal[]>;

  addRecommendations(recs: Recommendation[]): Promise<void>;
  getRecommendationHistory(limit?: number): Promise<Recommendation[]>;
  updateRecommendationStatus(id: string, status: Recommendation['status']): Promise<void>;
  getSavedRecommendations(): Promise<Recommendation[]>;

  addFeedback(record: FeedbackRecord): Promise<void>;
  getFeedbackHistory(limit?: number): Promise<FeedbackRecord[]>;

  getPreferences(): Promise<Preferences>;
  savePreferences(prefs: Preferences): Promise<void>;

  saveDigest(digest: DailyDigest): Promise<void>;
  getDigest(date: string): Promise<DailyDigest | null>;

  /** wipes all locally stored data — used by the Settings > Privacy Controls panel */
  clearAll(): Promise<void>;
}

export const DEFAULT_PREFERENCES: Preferences = {
  disabledCategories: [],
  availableMinutesPerDay: 120,
  darkMode: true,
  mcpSyncEnabled: false,
  mcpSyncUrl: 'http://localhost:8787',
  anthropicApiKey: undefined,
  tmdbApiKey: undefined,
  googleBooksApiKey: undefined,
  githubToken: undefined,
  newsApiKey: undefined,
  groqApiKey: undefined,
  domainBlocklist: [
    'bank',
    'banking',
    'paypal',
    'stripe.com/pay',
    '.gov',
    'irs.gov',
    'login.',
    'signin.',
    'accounts.google.com',
    'mail.google.com',
    'outlook.',
    'auth0.com',
    'okta.com',
  ],
  onboardingCompleted: false,
};
