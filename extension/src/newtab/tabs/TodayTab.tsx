import { RefreshCw } from 'lucide-react';
import { useAppData } from '../../lib/AppDataContext';
import { RecommendationCard } from '../../components/RecommendationCard';
import { GhostField } from '../../components/GhostField';
import type { TimeWindow } from '@whatnext/core';

const WINDOW_LABELS: Record<TimeWindow, string> = {
  now: 'Now',
  tonight: 'Tonight',
  tomorrow: 'Tomorrow',
  weekend: 'Weekend',
};

import { useEffect } from 'react';
import { indexedDbStorage } from '../../lib/storage/indexedDbAdapter';

export function TodayTab() {
  const { engineResult, loading, regenerate, submitFeedback, digest } = useAppData();
  const top = engineResult?.feed[0];

  useEffect(() => {
    if (top) {
      indexedDbStorage.addRecommendations([{ ...top, status: top.status === 'pending' ? 'shown' : top.status }]);
    }
  }, [top]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl font-semibold">
              {digest?.headline ?? 'Right now, do this.'}
            </h2>
            <p className="text-sm text-muted mt-0.5">
              {engineResult
                ? `Evaluated ${engineResult.candidatesEvaluated} candidates across every category.`
                : 'Generating your first recommendation…'}
            </p>
          </div>
          <button
            onClick={regenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface2 px-3 py-2 text-xs font-medium text-muted hover:text-text disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>

        <div className="relative rounded-2xl border border-border bg-surface2/30 p-10">
          {engineResult && <GhostField candidatesEvaluated={engineResult.candidatesEvaluated} />}
          <div className="relative max-w-xl mx-auto">
            {top ? (
              <RecommendationCard
                recommendation={top}
                onFeedback={(type) => submitFeedback(top, type)}
                highlight
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
                {loading ? 'Thinking…' : 'No recommendation yet — hit regenerate.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {engineResult && (
        <div>
          <h3 className="font-display text-base font-semibold mb-3">Your timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {(Object.keys(WINDOW_LABELS) as TimeWindow[]).map((window) => (
              <div key={window} className="rounded-xl border border-border bg-surface p-4">
                <h4 className="font-mono text-xs uppercase tracking-wide text-signal mb-3">
                  {WINDOW_LABELS[window]}
                </h4>
                <div className="space-y-3">
                  {engineResult.timeline[window].length === 0 && (
                    <p className="text-xs text-muted">Nothing scheduled here yet.</p>
                  )}
                  {engineResult.timeline[window].map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-border bg-surface2 p-3">
                      <p className="text-sm font-medium leading-snug">{rec.title}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        {rec.dna.estimatedMinutes} min · score {rec.score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
