interface Props {
  count?: number;
  candidatesEvaluated: number;
}

const OFFSETS = [
  { x: -140, y: -60, r: -8, w: 160 },
  { x: 130, y: -80, r: 6, w: 140 },
  { x: -170, y: 40, r: 5, w: 150 },
  { x: 160, y: 30, r: -5, w: 170 },
  { x: -90, y: -110, r: -3, w: 120 },
  { x: 90, y: 100, r: 4, w: 130 },
  { x: 0, y: -130, r: 0, w: 110 },
  { x: -40, y: 120, r: -6, w: 140 },
];

export function GhostField({ count = 8, candidatesEvaluated }: Props) {
  const ghosts = OFFSETS.slice(0, count);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {ghosts.map((g, i) => (
        <div
          key={i}
          className="absolute rounded-xl border border-border/60 bg-surface2/40 animate-ghostFloat"
          style={{
            width: g.w,
            height: 64,
            transform: `translate(${g.x}px, ${g.y}px) rotate(${g.r}deg)`,
            opacity: 0.35,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <div className="absolute bottom-2 right-2 rounded-full bg-bg/80 px-2.5 py-1 font-mono text-[10px] text-muted">
        {candidatesEvaluated} candidates → 1 decision
      </div>
    </div>
  );
}
