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
              Est. 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ece8e1]/15 bg-[#0d1117]/80 px-3 py-1.5 font-mono text-xs text-[#ece8e1]/80 backdrop-blur-md shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>v1.0.0</span>
            </div>

            <a
              href="https://github.com/abhilash15498/What-next"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ece8e1]/15 bg-[#0d1117]/80 px-3.5 py-1.5 font-mono text-xs text-[#ece8e1]/80 transition-colors hover:border-[#e8a84a] hover:text-[#e8a84a] backdrop-blur-md shadow-md"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[90vh] items-center justify-end pt-32 pb-16 lg:pt-28 lg:pb-12">
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

            <div className="animate-fade-up-delay-2 mt-9 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/api/download"
                  download="whatnext-extension.zip"
                  className="inline-flex items-center justify-center rounded-full bg-[#ece8e1] px-7 py-3 font-mono text-xs font-medium tracking-wide text-[#050505] transition-opacity hover:opacity-90 sm:text-sm"
                >
                  Download for Chrome
                </a>
                <button
                  type="button"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ece8e1]/20 px-6 py-3 font-mono text-xs tracking-wide text-[#ece8e1]/80 transition-colors hover:border-[#ece8e1]/50 hover:text-[#ece8e1] sm:text-sm"
                >
                  How it works
                  <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <p className="mt-1 font-mono text-[11px] text-[#ece8e1]/40">
                By downloading, you agree to our{" "}
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e8a84a] underline hover:text-[#e8a84a]/80"
                >
                  Privacy Policy
                </a>
                . 100% local & open source.
              </p>

              <button
                type="button"
                onClick={() => document.getElementById("install")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ece8e1]/20 px-7 py-3 font-mono text-xs tracking-wide text-[#ece8e1]/80 transition-colors hover:border-[#ece8e1]/50 hover:text-[#ece8e1] sm:text-sm"
              >
                Steps to Install & Use
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
