"use client";

import {
  Download,
  Shield,
  Sparkles,
  Layers,
  Eye,
  FolderOpen,
  Terminal,
  Puzzle,
} from "lucide-react";
import HeroAsciiOne from "@/components/ui/hero-ascii-one";

const features = [
  {
    icon: Sparkles,
    title: "One answer, every new tab",
    body: "A single ranked recommendation — not a feed of noise — with confidence, Why Now?, and DNA metadata you can actually read.",
  },
  {
    icon: Layers,
    title: "Category-independent",
    body: "Movies, books, GitHub repos, courses, side projects, fitness, career moves, tools, and news — ranked against one shared interest model.",
  },
  {
    icon: Shield,
    title: "Privacy-first by default",
    body: "Interest profile, history, and feedback live in IndexedDB. No login, no cloud account, no backend that WhatNext controls.",
  },
  {
    icon: Eye,
    title: "Explainable ranking",
    body: "Every pick carries a reasoning trail. Rejected candidates get a Why Not? — so you know what the model actually did.",
  },
];

const installSteps = [
  {
    icon: Terminal,
    title: "Build the extension",
    body: "From the repo root run npm install && npm run build. The packed extension lands in extension/dist.",
  },
  {
    icon: Puzzle,
    title: "Open Chrome extensions",
    body: "Go to chrome://extensions and enable Developer mode in the top-right corner.",
  },
  {
    icon: FolderOpen,
    title: "Load unpacked",
    body: "Click Load unpacked, select the extension/dist folder, then open a new tab to start onboarding.",
  },
];

export default function LandingPage() {
  const scrollToInstall = () => {
    document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadZip = async () => {
    try {
      const res = await fetch("/whatnext-extension.zip", { method: "HEAD" });
      if (!res.ok) {
        scrollToInstall();
        window.alert(
          "Extension zip is not packaged yet.\n\nFrom the monorepo root:\n  npm run build\n  npm run pack:extension -w website\n\nThen try Download ZIP again — or follow the Load unpacked steps above.",
        );
        return;
      }
      const link = document.createElement("a");
      link.href = "/whatnext-extension.zip";
      link.download = "whatnext-extension.zip";
      link.click();
    } catch {
      scrollToInstall();
    }
  };

  return (
    <div className="relative min-h-screen text-[#ece8e1]">
      {/* Fixed starfield behind the entire site */}
      <div aria-hidden className="site-stars pointer-events-none fixed inset-0 -z-10" />

      <HeroAsciiOne onDownload={scrollToInstall} onLearnMore={scrollToFeatures} />

      <div className="relative">
        <section id="features" className="relative px-6 pt-10 pb-28 lg:px-10 lg:pt-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 max-w-xl">
              <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-[#e8a84a] uppercase">
                Why WhatNext
              </p>
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#ece8e1] sm:text-4xl lg:text-5xl">
                Stop asking what to do next.
              </h2>
              <p className="mt-5 font-mono text-sm leading-relaxed text-[#ece8e1]/55 lg:text-base">
                WhatNext replaces decision fatigue with one explained action —
                computed locally from everything it already knows about you.
              </p>
            </div>

            <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, body }) => (
                <article key={title}>
                  <div className="mb-4 text-[#e8a84a]">
                    <Icon className="h-5 w-5" strokeWidth={1.25} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#ece8e1] sm:text-xl">
                    {title}
                  </h3>
                  <p className="mt-3 font-mono text-xs leading-relaxed text-[#ece8e1]/50 lg:text-sm">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="install" className="relative px-6 pb-28 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 max-w-xl">
              <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-[#e8a84a] uppercase">
                Get started
              </p>
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#ece8e1] sm:text-4xl lg:text-5xl">
                Add it to Chrome
              </h2>
              <p className="mt-5 font-mono text-sm leading-relaxed text-[#ece8e1]/55 lg:text-base">
                Not on the Chrome Web Store yet — load it as an unpacked
                extension in under a minute.
              </p>
            </div>

            <ol className="mb-16 space-y-10">
              {installSteps.map(({ icon: Icon, title, body }, index) => (
                <li key={title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ece8e1]/15 font-mono text-xs text-[#e8a84a]">
                      {index + 1}
                    </span>
                    {index < installSteps.length - 1 && (
                      <div className="mt-3 w-px flex-1 bg-[#ece8e1]/10" />
                    )}
                  </div>
                  <div className="pb-2 pt-1">
                    <div className="mb-2 flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#ece8e1]/35" strokeWidth={1.25} />
                      <h3 className="font-display text-base font-semibold text-[#ece8e1] lg:text-lg">
                        {title}
                      </h3>
                    </div>
                    <p className="max-w-lg font-mono text-xs leading-relaxed text-[#ece8e1]/50 lg:text-sm">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-6 rounded-2xl border border-[#ece8e1]/10 bg-[#050505]/60 px-6 py-7 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <p className="font-display text-xl font-semibold text-[#ece8e1]">
                  Prefer a zip?
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-[#ece8e1]/45">
                  After{" "}
                  <span className="text-[#e8a84a]">npm run build</span>, run{" "}
                  <span className="text-[#e8a84a]">npm run pack:extension</span>{" "}
                  from the website folder, then download below.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ece8e1] px-6 py-3 font-mono text-xs font-medium text-[#050505] transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                  Download zip
                </button>
                <a
                  href="https://github.com/abhilash15498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ece8e1]/20 px-6 py-3 font-mono text-xs text-[#ece8e1]/80 transition-colors hover:border-[#ece8e1]/45 hover:text-[#ece8e1]"
                >
                  View source
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative px-6 pb-12 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-[#ece8e1]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-lg font-bold tracking-widest text-[#ece8e1] italic -skew-x-6">
              WhatNext?
            </span>
            <p className="font-mono text-[10px] text-[#ece8e1]/35">
              Stop scrolling. Start doing. · Privacy-first
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
