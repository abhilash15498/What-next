import { Heart } from 'lucide-react';
import { useAppData } from '../../lib/AppDataContext';
import { RecommendationCard } from '../../components/RecommendationCard';

export function SavedTab() {
  const { saved, submitFeedback } = useAppData();

  if (saved.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <Heart className="mx-auto mb-2 text-muted" size={22} />
        <p className="text-sm text-muted">Nothing saved yet. Tap the heart on a recommendation to keep it here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Saved ({saved.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saved.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} onFeedback={(type) => submitFeedback(rec, type)} />
        ))}
      </div>
    </div>
  );
}
