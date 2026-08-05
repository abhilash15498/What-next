import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, LayoutDashboard, Settings } from 'lucide-react';
import {
  decayProfile,
  generateRecommendations,
  recordFeedback,
  type FeedbackType,
  type Recommendation,
} from '@whatnext/core';
import { indexedDbStorage } from '../lib/storage/indexedDbAdapter';
import { RecommendationCard } from '../components/RecommendationCard';
import { GhostField } from '../components/GhostField';

export function Popup() {
  const [loading, setLoading] = useState(true);
  const [top, setTop] = useState<Recommendation | null>(null);
  const [candidatesEvaluated, setCandidatesEvaluated] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const history = await indexedDbStorage.getRecommendationHistory(10);
    const fresh = history.filter((r) => Date.now() - r.generatedAt < 1000 * 60 * 60 * 6);
    if (fresh.length > 0) {
      setTop(fresh[0]);
      setCandidatesEvaluated(0);
      setLoading(false);
      return;
    }
    const profile = await indexedDbStorage.getInterestProfile();
    await indexedDbStorage.saveInterestProfile(decayProfile(profile));
    const result = await generateRecommendations(indexedDbStorage);
    setTop(result.feed[0] ?? null);
    setCandidatesEvaluated(result.candidatesEvaluated);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFeedback = async (type: FeedbackType) => {
    if (!top) return;
    await recordFeedback(indexedDbStorage, top, type);
    setTop({ ...top, status: type === 'useful' || type === 'more_like_this' ? 'useful' : type === 'save' ? 'saved' : type === 'later' ? 'later' : 'not_interested' });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="font-display text-lg font-bold text-text leading-none">WhatNext?</h1>
          <p className="text-[11px] text-muted mt-0.5">Stop Scrolling. Start Doing.</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Open dashboard"
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') })}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-surface2 text-muted hover:text-text"
          >
            <LayoutDashboard size={15} />
          </button>
          <button
            title="Settings"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-surface2 text-muted hover:text-text"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="relative h-40 rounded-2xl border border-border bg-surface flex items-center justify-center">
          <GhostField candidatesEvaluated={candidatesEvaluated} count={5} />
          <span className="relative font-mono text-xs text-muted">Evaluating candidates…</span>
        </div>
      )}

      {!loading && top && <RecommendationCard recommendation={top} onFeedback={handleFeedback} highlight />}

      {!loading && !top && (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          No recommendation yet — browse a little, or hit refresh below.
        </div>
      )}

      <button
        type="button"
        onClick={load}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface2 py-2 text-xs font-medium text-muted hover:text-text hover:border-muted transition-colors"
      >
        <RefreshCw size={13} />
        Refresh
      </button>
    </div>
  );
}
