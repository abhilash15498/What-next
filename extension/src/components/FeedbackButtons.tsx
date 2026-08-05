import { ThumbsUp, ThumbsDown, Heart, Clock3, Sparkles } from 'lucide-react';
import type { FeedbackType, Recommendation } from '@whatnext/core';
import clsx from 'clsx';

interface Props {
  recommendation: Recommendation;
  onFeedback: (type: FeedbackType) => void;
  compact?: boolean;
}

const OPTIONS: Array<{ type: FeedbackType; icon: typeof ThumbsUp; label: string }> = [
  { type: 'useful', icon: ThumbsUp, label: 'Useful' },
  { type: 'not_interested', icon: ThumbsDown, label: 'Not interested' },
  { type: 'save', icon: Heart, label: 'Save' },
  { type: 'later', icon: Clock3, label: 'Later' },
  { type: 'more_like_this', icon: Sparkles, label: 'More like this' },
];

export function FeedbackButtons({ recommendation, onFeedback, compact = false }: Props) {
  const status = recommendation.status;

  return (
    <div className="flex items-center gap-1.5">
      {OPTIONS.map(({ type, icon: Icon, label }) => {
        const active =
          (type === 'useful' && status === 'useful') ||
          (type === 'not_interested' && status === 'not_interested') ||
          (type === 'save' && status === 'saved') ||
          (type === 'later' && status === 'later');

        return (
          <button
            key={type}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => onFeedback(type)}
            className={clsx(
              'inline-flex items-center justify-center rounded-lg border transition-colors',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              active
                ? 'border-signal/50 bg-signal/15 text-signal'
                : 'border-border bg-surface2 text-muted hover:text-text hover:border-muted',
            )}
          >
            <Icon size={compact ? 14 : 16} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
