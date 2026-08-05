import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppData } from '../../lib/AppDataContext';
import { RecommendationCard } from '../../components/RecommendationCard';
import { CategoryBadge } from '../../components/Badges';

export function FeedTab() {
  const { engineResult, submitFeedback } = useAppData();
  const [showRejections, setShowRejections] = useState(false);

  if (!engineResult) {
    return <p className="text-sm text-muted">No feed yet — visit the Today tab and hit regenerate.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Your feed</h2>
        <p className="text-sm text-muted mb-4">
          Every candidate that made the cut, ranked by fit, freshness, novelty and your available time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engineResult.feed.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} onFeedback={(type) => submitFeedback(rec, type)} />
          ))}
        </div>
      </div>

      {engineResult.rejections.length > 0 && (
        <div>
          <button
            onClick={() => setShowRejections((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text"
          >
            {showRejections ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            Why weren't {engineResult.rejections.length} other items shown?
          </button>
          {showRejections && (
            <div className="mt-3 space-y-2">
              {engineResult.rejections.map((r) => (
                <div key={r.candidateId} className="rounded-lg border border-border bg-surface2 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={r.category} />
                    <span className="text-sm font-medium">{r.title}</span>
                    <span className="ml-auto font-mono text-xs text-muted">score {r.score}</span>
                  </div>
                  <p className="text-xs text-muted">{r.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
