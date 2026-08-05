import { useAppData } from '../../lib/AppDataContext';
import { CategoryBadge } from '../../components/Badges';

const STATUS_LABEL: Record<string, string> = {
  pending: 'No feedback yet',
  useful: 'Marked useful',
  not_interested: 'Not interested',
  saved: 'Saved',
  later: 'For later',
  dismissed: 'Dismissed',
};

export function HistoryTab() {
  const { history } = useAppData();

  if (history.length === 0) {
    return <p className="text-sm text-muted">No history yet.</p>;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">History</h2>
      <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
        {history.map((rec) => (
          <div key={rec.id} className="flex items-center gap-3 px-4 py-3">
            <CategoryBadge category={rec.category} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{rec.title}</p>
              <p className="text-[11px] text-muted">{new Date(rec.generatedAt).toLocaleString()}</p>
            </div>
            <span className="font-mono text-xs text-muted shrink-0">score {rec.score}</span>
            <span className="text-xs text-muted shrink-0 w-32 text-right">{STATUS_LABEL[rec.status] ?? rec.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
