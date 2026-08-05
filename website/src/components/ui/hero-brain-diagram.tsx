"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Frameless hero art: stippled brain + question mark (top-right).
 * Black pixels blend into the site background via mix-blend-mode.
 * Keeps the scan-line pass over the brain.
 */
export default function HeroBrainDiagram({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    setMounted(true);
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion.current || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setOffset({ x: nx * 10, y: ny * 8 });
  }, []);

  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  if (!mounted) {
    return (
      <div
        className={`relative h-full w-full ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-visible ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: "transform 0.35s ease-out",
        }}
      >
        <Image
          src="/brain-question-hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 90vw"
          className="object-contain object-center"
          style={{
            // Pure black in the PNG becomes invisible → matches site bg
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Scanning pass across the brain */}
      <div className="pointer-events-none absolute inset-[8%_6%] overflow-hidden">
        <div className="hbd-scan absolute inset-x-0 top-0 h-[2px]" />
      </div>

      <style>{`
        .hbd-scan {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(232, 168, 74, 0.15) 20%,
            rgba(236, 232, 225, 0.65) 50%,
            rgba(232, 168, 74, 0.15) 80%,
            transparent 100%
          );
          box-shadow:
            0 0 18px rgba(236, 232, 225, 0.35),
            0 0 40px rgba(232, 168, 74, 0.2);
          animation: hbd-scan 4.8s linear infinite;
        }
        @keyframes hbd-scan {
          0% { transform: translateY(0); opacity: 0; }
          8% { opacity: 0.9; }
          92% { opacity: 0.55; }
          100% { transform: translateY(520px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hbd-scan { animation: none !important; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
