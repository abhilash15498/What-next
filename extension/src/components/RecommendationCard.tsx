import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { FeedbackType, Recommendation } from '@whatnext/core';
import { CategoryBadge, DifficultyBadge } from './Badges';
import { ConfidenceMeter } from './ConfidenceMeter';
import { FeedbackButtons } from './FeedbackButtons';

interface Props {
  recommendation: Recommendation;
  onFeedback: (type: FeedbackType) => void;
  highlight?: boolean;
}

export function RecommendationCard({ recommendation: rec, onFeedback, highlight = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={
        highlight
          ? 'rounded-2xl border border-signal/40 bg-surface p-5 shadow-[0_0_0_1px_rgba(255,178,56,0.08)]'
          : 'rounded-xl border border-border bg-surface p-4'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <CategoryBadge category={rec.category} />
            <DifficultyBadge difficulty={rec.dna.difficulty} />
            <span className="font-mono text-xs text-muted">{rec.dna.estimatedMinutes} min</span>
          </div>
          <h3 className={highlight ? 'font-display text-lg font-medium text-text' : 'font-display text-base font-medium text-text'}>
            {rec.title}
          </h3>
          <p className="mt-1 text-sm text-muted leading-relaxed">{rec.description}</p>
        </div>
        {rec.url && (
          <a
            href={rec.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-muted hover:text-signal transition-colors"
            title="Open link"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      <div className="mt-3">
        <ConfidenceMeter value={rec.dna.confidence} size="sm" />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-signal hover:text-signal/80"
      >
        Why now?
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 rounded-lg bg-surface2 p-3 text-xs leading-relaxed text-muted animate-dissolve">
          <p>{rec.whyNow}</p>
          <p className="border-t border-border pt-2 text-[11px] font-mono text-muted/80">{rec.aiReasoning}</p>
          {rec.dna.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {rec.dna.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-bg px-2 py-0.5 font-mono text-[10px] text-muted">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <FeedbackButtons recommendation={rec} onFeedback={onFeedback} />
        <span className="font-mono text-[11px] text-muted">score {rec.score}</span>
      </div>
    </div>
  );
}
