import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import {
  DEFAULT_PREFERENCES,
  type DailyDigest,
  type FeedbackRecord,
  type InterestProfile,
  type Preferences,
  type Recommendation,
  type Signal,
  type Storage,
} from '@whatnext/core';

interface DataShape {
  profile: InterestProfile;
  prefs: Preferences;
  signals: Signal[];
  recommendations: Recommendation[];
  feedback: FeedbackRecord[];
  digests: Record<string, DailyDigest>;
}

function emptyData(): DataShape {
  return {
    profile: {},
    prefs: DEFAULT_PREFERENCES,
    signals: [],
    recommendations: [],
    feedback: [],
    digests: {},
  };
}

const DATA_DIR = process.env.WHATNEXT_DATA_DIR ?? join(homedir(), '.whatnext-mcp');
const DATA_FILE = join(DATA_DIR, 'store.json');

/**
 * A tiny synchronous JSON-file "database". This process is a single local
 * companion server with one reader/writer at a time, so a full embedded
 * database is unnecessary — this keeps the install dependency-free (no
 * native addons to compile). Swap in better-sqlite3 or Postgres later if
 * this ever needs to run multi-user or at real scale.
 */
class JsonFileStore {
  private data: DataShape;

  constructor() {
    this.data = this.load();
  }

  private load(): DataShape {
    if (!existsSync(DATA_FILE)) return emptyData();
    try {
      const raw = readFileSync(DATA_FILE, 'utf-8');
      return { ...emptyData(), ...JSON.parse(raw) };
    } catch {
      return emptyData();
    }
  }

  private persist(): void {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  get<K extends keyof DataShape>(key: K): DataShape[K] {
    return this.data[key];
  }

  set<K extends keyof DataShape>(key: K, value: DataShape[K]): void {
    this.data[key] = value;
    this.persist();
  }
}

const store = new JsonFileStore();

export const jsonFileStorage: Storage = {
  async getInterestProfile() {
    return store.get('profile');
  },
  async saveInterestProfile(profile) {
    store.set('profile', profile);
  },

  async addSignal(signal) {
    const signals = [...store.get('signals'), signal].slice(-2000);
    store.set('signals', signals);
  },
  async getRecentSignals(limitMs) {
    const since = Date.now() - limitMs;
    return store.get('signals').filter((s) => s.timestamp >= since);
  },

  async addRecommendations(recs) {
    const existing = store.get('recommendations');
    const byId = new Map(existing.map((r) => [r.id, r]));
    for (const r of recs) byId.set(r.id, r);
    store.set('recommendations', [...byId.values()].slice(-1000));
  },
  async getRecommendationHistory(limit = 100) {
    return [...store.get('recommendations')].sort((a, b) => b.generatedAt - a.generatedAt).slice(0, limit);
  },
  async updateRecommendationStatus(id, status) {
    const recs = store.get('recommendations').map((r) => (r.id === id ? { ...r, status } : r));
    store.set('recommendations', recs);
  },
  async getSavedRecommendations() {
    return store.get('recommendations').filter((r) => r.status === 'saved');
  },

  async addFeedback(record) {
    store.set('feedback', [...store.get('feedback'), record].slice(-2000));
  },
  async getFeedbackHistory(limit = 500) {
    return [...store.get('feedback')].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  async getPreferences() {
    return store.get('prefs');
  },
  async savePreferences(prefs) {
    store.set('prefs', prefs);
  },

  async saveDigest(digest) {
    store.set('digests', { ...store.get('digests'), [digest.date]: digest });
  },
  async getDigest(date) {
    return store.get('digests')[date] ?? null;
  },

  async clearAll() {
    store.set('profile', {});
    store.set('prefs', DEFAULT_PREFERENCES);
    store.set('signals', []);
    store.set('recommendations', []);
    store.set('feedback', []);
    store.set('digests', {});
  },
};

export { DATA_FILE };
