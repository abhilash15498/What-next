"use client";

import { useState } from "react";
import {
  Download,
  Shield,
  Sparkles,
  Layers,
  Eye,
  FolderOpen,
  Puzzle,
  FileArchive,
  Monitor,
  KeyRound,
  Cpu,
  Bot,
  Terminal,
  ShieldCheck,
  Lock,
  ExternalLink,
} from "lucide-react";
import HeroAsciiOne from "@/components/ui/hero-ascii-one";

const features = [
  {
    icon: Sparkles,
    title: "One answer, every time you ask",
    body: "A single ranked recommendation — not a feed of noise — with confidence score, Why Now? reason, and category metadata you can read.",
  },
  {
    icon: Layers,
    title: "Category-independent",
    body: "Movies, books, GitHub repos, courses, side projects, fitness, career moves, tools, and news — ranked against one shared interest model.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first & Blocklist",
    body: "Automatic sensitive page detection & default blocklist for banking, auth, and payment sites. 100% stored in local IndexedDB.",
  },
  {
    icon: Eye,
    title: "Explainable ranking",
    body: "Every pick carries a reasoning trail powered by optional Groq LLM. Rejected candidates get a Why Not? so you know what the model did.",
  },
  {
    icon: Cpu,
    title: "Native MCP Integration",
    body: "Built-in Model Context Protocol (MCP) server lets Claude Desktop, Cursor, or local AI tools query your interest profile directly.",
  },
  {
    icon: Bot,
    title: "Bring Your Own Key (BYOK)",
    body: "Use your own keys for Groq, TMDB, Google Books, GitHub, and NewsAPI. Your keys stay in local IndexedDB — never on our servers.",
  },
];

const blocklistTags = [
  "bank",
  "banking",
  "paypal",
  "stripe.com/pay",
  ".gov",
  "irs.gov",
  "login.",
  "signin.",
  "accounts.google.com",
  "mail.google.com",
  "outlook.",
  "auth0.com",
  "okta.com",
];

const installSteps = [
  {
    icon: FileArchive,
    title: "Download & Extract ZIP",
    body: "Click 'Download Extension (.zip)' below and extract the downloaded zip file into a folder on your computer.",
  },
  {
    icon: Puzzle,
    title: "Open Chrome Extensions",
    body: "Open Chrome, navigate to chrome://extensions in the URL bar, and turn ON 'Developer mode' in the top-right corner.",
  },
  {
    icon: FolderOpen,
    title: "Click Load Unpacked",
    body: "Click the 'Load unpacked' button in Chrome and select your extracted extension folder. You're ready to go!",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");

  const scrollToInstall = () => {
    document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadZip = () => {
    const link = document.createElement("a");
    link.href = "/whatnext-extension.zip";
    link.download = "whatnext-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    scrollToInstall();
  };

  return (
    <div className="relative min-h-screen text-[#ece8e1]">
      {/* Fixed starfield behind the entire site */}
      <div aria-hidden className="site-stars pointer-events-none fixed inset-0 -z-10" />

      <HeroAsciiOne onDownload={handleDownloadZip} onLearnMore={scrollToFeatures} />

      <div className="relative">
        {/* Features Section */}
        <section id="features" className="relative px-6 pt-10 pb-20 lg:px-10 lg:pt-6">
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

            <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Privacy & Domain Blocklist Section */}
        <section className="relative px-6 pb-20 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-[#ece8e1]/15 bg-[#050505]/80 p-8 backdrop-blur-md lg:p-12">
              <div className="mb-8 max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Privacy First & Blocklist Protected
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-[#ece8e1] sm:text-3xl lg:text-4xl">
                  Your sensitive data never enters the model.
                </h3>
                <p className="mt-4 font-mono text-xs leading-relaxed text-[#ece8e1]/60 sm:text-sm">
                  WhatNext automatically ignores banking, auth, payment, and health pages. Password fields and login URLs are skipped instantly before any signal is captured.
                </p>
              </div>

              {/* Default Blocked Domain Tags Visual Box */}
              <div className="rounded-2xl border border-[#ece8e1]/10 bg-[#0d1117] p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#ece8e1]">
                    <Lock className="h-4 w-4 text-emerald-400" /> Default Domain Blocklist & Keyword Protection
                  </div>
                  <a
                    href="/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#e8a84a] hover:underline"
                  >
                    Privacy Policy <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mb-4 font-mono text-[11px] text-[#ece8e1]/45">
                  Pages on these domains (or matching these substrings) are strictly blocked by default in the background worker:
                </p>
                <div className="flex flex-wrap gap-2">
                  {blocklistTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-[#ece8e1]/15 bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#ece8e1]/70"
                    >
                      {tag} <span className="text-red-400/80 font-bold">×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MCP Capability Showcase Section */}
        <section className="relative px-6 pb-20 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-[#e8a84a]/25 bg-[#050505]/70 p-8 backdrop-blur-md lg:p-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8a84a]/30 bg-[#e8a84a]/10 px-3 py-1 font-mono text-[11px] text-[#e8a84a]">
                    <Cpu className="h-3.5 w-3.5" /> Model Context Protocol (MCP) Ready
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-[#ece8e1] sm:text-3xl lg:text-4xl">
                    Connect your AI tools to your local interest graph.
                  </h3>
                  <p className="mt-4 font-mono text-xs leading-relaxed text-[#ece8e1]/60 sm:text-sm">
                    WhatNext ships with a native MCP Server (<code className="text-[#e8a84a]">mcp-server/</code>) built on the official SDK. Enable local MCP sync in Settings and your AI tools (Claude Desktop, Cursor, local agents) can inspect your interest profile and answer <em className="text-[#ece8e1]">"What should I do next?"</em> directly in chat!
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl border border-[#ece8e1]/10 bg-[#0d1117] p-5 font-mono text-xs text-[#ece8e1]/80 shadow-xl">
                  <div className="mb-2 flex items-center gap-2 text-[11px] text-[#e8a84a]">
                    <Terminal className="h-3.5 w-3.5" /> MCP Prompt Example
                  </div>
                  <p className="text-[#ece8e1]/90 font-medium">"What should I do next?"</p>
                  <p className="mt-2 text-[11px] text-[#ece8e1]/45">→ Queries <code className="text-[#e8a84a]">whatnext://interest-profile</code></p>
                  <p className="text-[11px] text-[#ece8e1]/45">→ Runs <code className="text-[#e8a84a]">generate_recommendations</code></p>
                  <p className="mt-2 text-[11px] text-green-400">✓ 100% Local (stdio / localhost:8787)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo / Screenshots Section */}
        <section className="relative px-6 pb-28 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 max-w-xl">
              <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-[#e8a84a] uppercase">
                Interface Preview
              </p>
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#ece8e1] sm:text-4xl lg:text-5xl">
                Designed for absolute clarity.
              </h2>
              <p className="mt-4 font-mono text-sm leading-relaxed text-[#ece8e1]/55 lg:text-base">
                A clean, dark interface built to guide your focus, display confidence scores, and deliver AI-powered reasoning.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-xs transition-colors ${
                  activeTab === "dashboard"
                    ? "border-[#e8a84a] bg-[#e8a84a]/10 text-[#e8a84a]"
                    : "border-[#ece8e1]/15 text-[#ece8e1]/60 hover:border-[#ece8e1]/30 hover:text-[#ece8e1]"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Dashboard View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-xs transition-colors ${
                  activeTab === "settings"
                    ? "border-[#e8a84a] bg-[#e8a84a]/10 text-[#e8a84a]"
                    : "border-[#ece8e1]/15 text-[#ece8e1]/60 hover:border-[#ece8e1]/30 hover:text-[#ece8e1]"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Settings & API Keys
              </button>
            </div>

            {/* Screenshot Frame */}
            <div className="overflow-hidden rounded-2xl border border-[#ece8e1]/15 bg-[#050505]/80 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-[#ece8e1]/10 bg-[#0d1117] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-[11px] text-[#ece8e1]/40">
                  {activeTab === "dashboard" ? "WhatNext? Dashboard — chrome-extension://whatnext/newtab" : "WhatNext? Settings — chrome-extension://whatnext/options"}
                </span>
              </div>
              <div className="p-2 sm:p-4">
                {activeTab === "dashboard" ? (
                  <img
                    src="/screenshots/dashboard.png"
                    alt="WhatNext Dashboard Screenshot"
                    className="w-full rounded-xl border border-[#ece8e1]/10 object-cover"
                  />
                ) : (
                  <img
                    src="/screenshots/settings.png"
                    alt="WhatNext Settings Screenshot"
                    className="w-full rounded-xl border border-[#ece8e1]/10 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Installation Section */}
        <section id="install" className="relative px-6 pb-28 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 max-w-xl">
              <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-[#e8a84a] uppercase">
                Get started
              </p>
              <h2 className="font-display text-3xl leading-tight font-bold tracking-tight text-[#ece8e1] sm:text-4xl lg:text-5xl">
                Install in 3 simple steps
              </h2>
              <p className="mt-5 font-mono text-sm leading-relaxed text-[#ece8e1]/55 lg:text-base">
                No developer tools or build steps required. Download the extension ZIP and load it into Chrome in under 60 seconds.
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
                  Ready to install?
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-[#ece8e1]/45">
                  Download the pre-packaged extension zip file and follow the 3 quick steps above.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/whatnext-extension.zip"
                  download="whatnext-extension.zip"
                  onClick={scrollToInstall}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a84a] px-6 py-3 font-mono text-xs font-semibold text-[#050505] transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                  Download Extension (.zip)
                </a>
                <a
                  href="https://github.com/abhilash15498/What-next"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ece8e1]/20 px-6 py-3 font-mono text-xs text-[#ece8e1]/80 transition-colors hover:border-[#ece8e1]/45 hover:text-[#ece8e1]"
                >
                  View Source on GitHub
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
            <div className="flex items-center gap-4 font-mono text-[10px] text-[#ece8e1]/40">
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#ece8e1]">
                Privacy Policy
              </a>
              <span>·</span>
              <span>Stop scrolling. Start doing.</span>
              <span>·</span>
              <span>Open Source</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
