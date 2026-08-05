import Dexie, { type Table } from 'dexie';
import {
  DEFAULT_PREFERENCES,
  type DailyDigest,
  type FeedbackRecord,
  type Interest,
  type InterestProfile,
  type Preferences,
  type Recommendation,
  type Signal,
  type Storage,
} from '@whatnext/core';

interface ProfileRow {
  key: 'profile';
  data: InterestProfile;
}
interface PrefsRow {
  key: 'prefs';
  data: Preferences;
}

class WhatNextDB extends Dexie {
  profile!: Table<ProfileRow, string>;
  prefs!: Table<PrefsRow, string>;
  signals!: Table<Signal, string>;
  recommendations!: Table<Recommendation, string>;
  feedback!: Table<FeedbackRecord, string>;
  digests!: Table<DailyDigest, string>;

  constructor() {
    super('whatnext');
    this.version(1).stores({
      profile: 'key',
      prefs: 'key',
      signals: 'id, timestamp',
      recommendations: 'id, candidateId, generatedAt, status, category',
      feedback: 'id, recommendationId, timestamp, category',
      digests: 'date',
    });
  }
}

const db = new WhatNextDB();

export const indexedDbStorage: Storage = {
  async getInterestProfile(): Promise<InterestProfile> {
    const row = await db.profile.get('profile');
    return row?.data ?? {};
  },

  async saveInterestProfile(profile: InterestProfile): Promise<void> {
    await db.profile.put({ key: 'profile', data: profile });
  },

  async addSignal(signal: Signal): Promise<void> {
    await db.signals.put(signal);
    // keep the signal log bounded — we only need a rolling window for context,
    // the interest profile itself is the durable summary of long-term behaviour
    const count = await db.signals.count();
    if (count > 2000) {
      const oldest = await db.signals.orderBy('timestamp').limit(count - 2000).toArray();
      await db.signals.bulkDelete(oldest.map((s) => s.id));
    }
  },

  async getRecentSignals(limitMs: number): Promise<Signal[]> {
    const since = Date.now() - limitMs;
    return db.signals.where('timestamp').aboveOrEqual(since).toArray();
  },

  async addRecommendations(recs: Recommendation[]): Promise<void> {
    await db.recommendations.bulkPut(recs);
  },

  async getRecommendationHistory(limit = 100): Promise<Recommendation[]> {
    return db.recommendations.orderBy('generatedAt').reverse().limit(limit).toArray();
  },

  async updateRecommendationStatus(id: string, status: Recommendation['status']): Promise<void> {
    await db.recommendations.update(id, { status });
  },

  async getSavedRecommendations(): Promise<Recommendation[]> {
    return db.recommendations.where('status').equals('saved').toArray();
  },

  async addFeedback(record: FeedbackRecord): Promise<void> {
    await db.feedback.put(record);
  },

  async getFeedbackHistory(limit = 500): Promise<FeedbackRecord[]> {
    return db.feedback.orderBy('timestamp').reverse().limit(limit).toArray();
  },

  async getPreferences(): Promise<Preferences> {
    const row = await db.prefs.get('prefs');
    // Merge with defaults so any new fields added after initial install are always present
    return { ...DEFAULT_PREFERENCES, ...(row?.data ?? {}) };
  },

  async savePreferences(prefs: Preferences): Promise<void> {
    await db.prefs.put({ key: 'prefs', data: prefs });
  },

  async saveDigest(digest: DailyDigest): Promise<void> {
    await db.digests.put(digest);
  },

  async getDigest(date: string): Promise<DailyDigest | null> {
    const row = await db.digests.get(date);
    return row ?? null;
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      db.profile.clear(),
      db.prefs.clear(),
      db.signals.clear(),
      db.recommendations.clear(),
      db.feedback.clear(),
      db.digests.clear(),
    ]);
  },
};

/** exported only for the analytics view, which needs a raw top-N read the Storage interface doesn't cover */
export async function getTopInterestsRaw(n: number): Promise<Interest[]> {
  const profile = await indexedDbStorage.getInterestProfile();
  return Object.values(profile)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
