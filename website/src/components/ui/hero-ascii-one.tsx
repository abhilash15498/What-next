"use client";

import { ArrowDown } from "lucide-react";
import HeroBrainDiagram from "@/components/ui/hero-brain-diagram";

type HeroAsciiOneProps = {
  onLearnMore?: () => void;
};

export default function HeroAsciiOne({ onLearnMore }: HeroAsciiOneProps) {
  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
      return;
    }
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-transparent">
      {/* Hero illustration — single instance, responsive placement */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute top-[12%] left-1/2 h-[42vh] w-[90%] max-w-sm -translate-x-1/2 opacity-35 lg:top-1/2 lg:left-[4%] lg:h-[78vh] lg:w-[48%] lg:max-w-xl lg:translate-x-0 lg:-translate-y-1/2 lg:opacity-100">
          <HeroBrainDiagram />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 lg:hidden" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-black/70 lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-black to-transparent lg:block" />
      </div>

      <header className="absolute top-0 right-0 left-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold tracking-widest text-[#ece8e1] italic -skew-x-6 lg:text-2xl">
              WhatNext?
            </span>
            <div className="hidden h-3 w-px bg-[#ece8e1]/30 sm:block" />
            <span className="hidden font-mono text-[10px] tracking-wider text-[#ece8e1]/40 uppercase sm:inline">
              Est. 2025
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleLearnMore}
              className="hidden font-mono text-xs tracking-wide text-[#ece8e1]/55 transition-colors hover:text-[#ece8e1] lg:inline"
            >
              How it works
            </button>
            <a
              href="/api/download"
              download="whatnext-extension.zip"
              className="rounded-full border border-[#ece8e1]/25 px-4 py-2 font-mono text-xs tracking-wide text-[#ece8e1] transition-colors hover:border-[#ece8e1] hover:bg-[#ece8e1] hover:text-[#050505]"
            >
              Get extension
            </a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[88vh] items-center justify-end pt-24 pb-12 lg:pt-0 lg:pb-8">
        <div className="w-full px-6 lg:w-[48%] lg:px-10 lg:pr-16">
          <div className="max-w-md lg:ml-auto">
            <p className="animate-fade-up mb-5 font-mono text-[10px] tracking-[0.28em] text-[#e8a84a] uppercase">
              Privacy-first · Local-only
            </p>

            <h1 className="animate-fade-up-delay font-display text-4xl leading-[1.1] font-bold tracking-tight text-[#ece8e1] sm:text-5xl lg:text-6xl">
              Stop scrolling.
              <br />
              <span className="text-[#e8a84a]">Start doing.</span>
            </h1>

            <p className="animate-fade-up-delay-2 mt-6 font-mono text-sm leading-relaxed text-[#ece8e1]/55 lg:text-base">
              One new-tab answer — ranked across movies, books, repos, courses,
              and more — from an interest model that never leaves your browser.
            </p>

            <div className="animate-fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/api/download"
                download="whatnext-extension.zip"
                className="inline-flex items-center justify-center rounded-full bg-[#ece8e1] px-7 py-3 font-mono text-xs font-medium tracking-wide text-[#050505] transition-opacity hover:opacity-90 sm:text-sm"
              >
                Download for Chrome
              </a>
              <button
                type="button"
                onClick={handleLearnMore}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ece8e1]/20 px-7 py-3 font-mono text-xs tracking-wide text-[#ece8e1]/80 transition-colors hover:border-[#ece8e1]/50 hover:text-[#ece8e1] sm:text-sm"
              >
                How it works
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
