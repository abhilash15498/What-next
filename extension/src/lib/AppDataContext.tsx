import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_PREFERENCES,
  buildDailyDigest,
  decayProfile,
  generateRecommendations,
  recordFeedback,
  todayKey,
  type Category,
  type DailyDigest,
  type EngineResult,
  type FeedbackRecord,
  type FeedbackType,
  type InterestProfile,
  type Preferences,
  type Recommendation,
} from '@whatnext/core';
import { indexedDbStorage } from './storage/indexedDbAdapter';

interface AppData {
  loading: boolean;
  profile: InterestProfile;
  prefs: Preferences;
  engineResult: EngineResult | null;
  history: Recommendation[];
  saved: Recommendation[];
  feedbackHistory: FeedbackRecord[];
  digest: DailyDigest | null;
  refresh: () => Promise<void>;
  regenerate: () => Promise<void>;
  submitFeedback: (rec: Recommendation, type: FeedbackType) => Promise<void>;
  updatePrefs: (partial: Partial<Preferences>) => Promise<void>;
  toggleCategory: (category: Category, enabled: boolean) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<InterestProfile>({});
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [engineResult, setEngineResult] = useState<EngineResult | null>(null);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [saved, setSaved] = useState<Recommendation[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>([]);
  const [digest, setDigest] = useState<DailyDigest | null>(null);

  const loadAll = useCallback(async () => {
    const [p, prefsRow, hist, savedRows, fb, existingDigest] = await Promise.all([
      indexedDbStorage.getInterestProfile(),
      indexedDbStorage.getPreferences(),
      indexedDbStorage.getRecommendationHistory(100),
      indexedDbStorage.getSavedRecommendations(),
      indexedDbStorage.getFeedbackHistory(500),
      indexedDbStorage.getDigest(todayKey()),
    ]);
    setProfile(p);
    setPrefs(prefsRow);
    setHistory(hist);
    setSaved(savedRows);
    setFeedbackHistory(fb);
    setDigest(existingDigest);
    return { profile: p, hist };
  }, []);

  const regenerate = useCallback(async () => {
    setLoading(true);
    const currentProfile = await indexedDbStorage.getInterestProfile();
    await indexedDbStorage.saveInterestProfile(decayProfile(currentProfile));
    const result = await generateRecommendations(indexedDbStorage);
    setEngineResult(result);
    const newDigest = buildDailyDigest(result.feed);
    await indexedDbStorage.saveDigest(newDigest);
    setDigest(newDigest);
    await loadAll();
    setLoading(false);
  }, [loadAll]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadAll();
    const currentPrefs = await indexedDbStorage.getPreferences();

    // If onboarding is not completed, don't generate recommendations yet
    if (!currentPrefs.onboardingCompleted) {
      setEngineResult(null);
      setLoading(false);
      return;
    }

    const existing = await indexedDbStorage.getRecommendationHistory(10);
    if (existing.length === 0) {
      await regenerate();
      return;
    }

    const lastGen = existing[0]?.generatedAt ?? 0;
    const staleCutoff = 1000 * 60 * 30; // 30 minutes
    if (Date.now() - lastGen > staleCutoff) {
      await regenerate();
    } else {
      // Feed is fresh — rehydrate engineResult from stored recs
      setEngineResult({
        feed: existing,
        timeline: { now: [], tonight: [], tomorrow: [], weekend: [] },
        rejections: [],
        candidatesEvaluated: existing.length,
        generatedAt: lastGen,
      });
      setLoading(false);
    }
  }, [loadAll, regenerate]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitFeedback = useCallback(
    async (rec: Recommendation, type: FeedbackType) => {
      await recordFeedback(indexedDbStorage, rec, type);
      await loadAll();
    },
    [loadAll],
  );

  const updatePrefs = useCallback(async (partial: Partial<Preferences>) => {
    const current = await indexedDbStorage.getPreferences();
    const next = { ...current, ...partial };
    await indexedDbStorage.savePreferences(next);
    setPrefs(next);
  }, []);

  const toggleCategory = useCallback(
    async (category: Category, enabled: boolean) => {
      const current = await indexedDbStorage.getPreferences();
      const disabled = new Set(current.disabledCategories);
      if (enabled) disabled.delete(category);
      else disabled.add(category);
      const next = { ...current, disabledCategories: [...disabled] };
      await indexedDbStorage.savePreferences(next);
      setPrefs(next);
    },
    [],
  );

  const clearAllData = useCallback(async () => {
    setLoading(true);
    await indexedDbStorage.clearAll();
    await indexedDbStorage.savePreferences(DEFAULT_PREFERENCES);
    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      await chrome.storage.session.remove('latestEngineResult').catch(() => {});
    }
    setEngineResult(null);
    await loadAll();
    setLoading(false);
  }, [loadAll]);

  const value = useMemo<AppData>(
    () => ({
      loading,
      profile,
      prefs,
      engineResult,
      history,
      saved,
      feedbackHistory,
      digest,
      refresh,
      regenerate,
      submitFeedback,
      updatePrefs,
      toggleCategory,
      clearAllData,
    }),
    [loading, profile, prefs, engineResult, history, saved, feedbackHistory, digest, refresh, regenerate, submitFeedback, updatePrefs, toggleCategory, clearAllData],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
