import type { Category } from '@whatnext/core';

const LABELS: Record<Category, string> = {
  movie: 'Movie',
  book: 'Book',
  github: 'GitHub',
  learning: 'Learning',
  coding_project: 'Project',
  fitness: 'Fitness',
  career: 'Career',
  tool: 'Tool',
  news: 'News',
  travel: 'Travel',
  finance: 'Finance & Stocks',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface2 px-2.5 py-0.5 text-xs font-medium text-muted">
      {LABELS[category]}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const color =
    difficulty === 'beginner'
      ? 'text-success border-success/30 bg-success/10'
      : difficulty === 'intermediate'
        ? 'text-signal border-signal/30 bg-signal/10'
        : 'text-danger border-danger/30 bg-danger/10';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}>
      {difficulty}
    </span>
  );
}
