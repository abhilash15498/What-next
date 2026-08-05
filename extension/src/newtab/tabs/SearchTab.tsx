import { useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { Candidate } from '@whatnext/core';
import { CategoryBadge, DifficultyBadge } from '../../components/Badges';
import { useAppData } from '../../lib/AppDataContext';

export function SearchTab() {
  const [query, setQuery] = useState('');
  const { saved, engineResult } = useAppData();

  // Build a searchable catalog from the current engine feed (live/static candidates already evaluated)
  const catalog: Candidate[] = useMemo(() => {
    const recs = engineResult?.feed ?? [];
    return recs.map((r) => ({
      id: r.candidateId,
      title: r.title,
      description: r.description,
      url: r.url,
      category: r.category,
      tags: r.dna.tags,
      difficulty: r.dna.difficulty,
      estimatedMinutes: r.dna.estimatedMinutes,
      popularity: r.dna.popularity,
      addedAt: r.generatedAt,
      suitedWindows: [],
    }));
  }, [engineResult]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t: string) => t.toLowerCase().includes(q)) ||
        c.category.includes(q),
    ).slice(0, 30);
  }, [query, catalog]);

  const savedResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return saved.filter((r) => r.title.toLowerCase().includes(q));
  }, [query, saved]);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-1">Search</h2>
      <p className="text-sm text-muted mb-4">
        Search across movies, books, GitHub repos, courses, projects, products, and your saved recommendations.
      </p>
      <div className="relative mb-6 max-w-lg">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything…"
          className="w-full rounded-xl border border-border bg-surface2 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-signal"
        />
      </div>

      {query.trim() === '' && <p className="text-sm text-muted">Start typing to search the full catalog.</p>}

      {savedResults.length > 0 && (
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-wide text-muted mb-2">From your saved items</h3>
          <div className="space-y-2">
            {savedResults.map((r) => (
              <div key={r.id} className="rounded-lg border border-signal/30 bg-signal/5 px-3 py-2 text-sm">
                {r.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <CategoryBadge category={c.category} />
              <DifficultyBadge difficulty={c.difficulty} />
            </div>
            <h4 className="font-display text-sm font-medium">{c.title}</h4>
            <p className="mt-1 text-xs text-muted leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
