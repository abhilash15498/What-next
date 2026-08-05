interface Props {
  value: number; // 0-100
  size?: 'sm' | 'md';
}

export function ConfidenceMeter({ value, size = 'md' }: Props) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} rounded-full bg-surface2 overflow-hidden`}>
        <div
          className="h-full rounded-full bg-signal transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-mono text-xs text-muted tabular-nums">{Math.round(clamped)}%</span>
    </div>
  );
}
