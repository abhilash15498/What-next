# Portfolio Overview

## The pitch

WhatNext? is a Chrome extension that replaces "what should I watch/read/build/do
next?" with a single, explained answer — pulled from a category-independent
recommendation engine that ranks movies, books, GitHub repos, courses, side
projects, fitness, career moves, tools, and news against one shared, continuously
updated interest model. Everything runs and stores data locally; there's no login
and no backend WhatNext controls.

## What this project demonstrates

- **System design** — a single storage-agnostic core (`packages/core`) consumed
  identically by two very different runtimes (a browser extension over IndexedDB,
  and a Node MCP server over a local JSON file), via one shared `Storage` interface.
- **Recommendation systems** — a real multi-signal ranking formula (interest
  similarity, context relevance, feedback-derived adjustment, freshness decay,
  novelty, popularity, and time-budget fit), plus category-diversity-capped
  selection so the feed doesn't collapse into one category.
- **User modeling** — an interest graph with per-tag score, confidence, trend, and
  co-occurrence relationships, updated via deterministic keyword-based signal
  classification (not a black box — every tag assignment is traceable).
- **Explainability as a first-class feature** — every recommendation carries a
  Why-Now explanation, an AI-reasoning trail, and DNA metadata; rejected candidates
  get a Why-Not explanation. All of it template-generated from real computed values,
  with an optional BYOK Claude rewrite for richer prose.
- **Browser extension development** — a full Manifest V3 build: background service
  worker (alarms, context menu, keyboard shortcut, notifications), a
  privacy-constrained content script, a popup, an options page, and a new-tab
  override dashboard — with a deliberately simple, robust Vite build pipeline (no
  fragile beta tooling).
- **MCP integration** — a real server built on the official TypeScript SDK, exposing
  5 resources, 5 tools, and 4 prompts per the spec, with a loopback-only sync path
  from the extension that's off by default.
- **Privacy-first engineering** — a domain blocklist enforced server-side (in the
  background worker, not just the content script), a content script that only ever
  reads page title + meta description, and every "send data somewhere" feature
  (MCP sync, BYOK Claude) opt-in and clearly labeled.
- **Product thinking** — a signature visual (the Today view's "ghost field") that
  literally shows the decision-fatigue-reduction pitch: dozens of candidates
  dissolving down to one.

## Try it yourself

```bash
npm install && npm run build
```

Then load `extension/dist` as an unpacked extension — see
[`docs/INSTALLATION.md`](INSTALLATION.md) for the full walkthrough.
