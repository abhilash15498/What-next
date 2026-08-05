# WhatNext?

**Stop Scrolling. Start Doing.**

WhatNext? is a privacy-first Chrome extension that answers one question every time you open a new tab:

> *Based on everything I currently know about you, what's the single most valuable thing you should do next?*

It's not a movie recommender, or a product recommender, or a course recommender — it's all of them, unified. Movies, books, GitHub repos, courses, side projects, fitness, career moves, tools, news: WhatNext ranks candidates from every category against one shared interest model and hands you **one** answer, with an explanation you can actually read.

Everything runs and stores data locally in your browser. There's no login, no cloud account, and no backend server that WhatNext controls.

---

## What's in this repo

This is an npm workspaces monorepo with three real, working pieces:

| Package | What it is |
|---|---|
| [`packages/core`](packages/core) | Storage-agnostic recommendation engine: interest modeling, 9 category providers, ranking, explanations, timeline, digest. Pure TypeScript, zero IO dependencies. |
| [`extension`](extension) | The Chrome MV3 extension itself — background worker, content script, popup, options page, and a full new-tab dashboard. |
| [`mcp-server`](mcp-server) | A local Model Context Protocol server that exposes your interest profile and recommendation history to any MCP-compatible AI client (e.g. Claude Desktop), synced from the extension only if you opt in. |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit together, and [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) for a full file tree.

## Quick start

```bash
npm install
npm run build
```

Then load `extension/dist` as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked). Full steps in [`docs/INSTALLATION.md`](docs/INSTALLATION.md).

## Why it's not random

Every recommendation carries:

- **A confidence score** (0-100)
- **A "Why Now?"** explanation, generated from the actual interests it matched and your actual recent activity
- **DNA metadata** — difficulty, estimated time, category, tags, popularity, freshness, interest match
- **An AI reasoning trail** — how many candidates were evaluated and why this one ranked where it did

Rejected candidates get a **"Why Not?"** explanation too, visible in the Feed tab.

## Privacy model

- All data — your interest profile, recommendation history, feedback, saved items — lives in this browser's IndexedDB. Nothing is sent anywhere by default.
- The content script only ever reads `document.title`, a meta description, and the hostname — never page body, form fields, or input values — and refuses to run on pages with a password field.
- A built-in domain blocklist (banking, government, payment, auth, email) is enforced in the background worker before any signal is stored.
- MCP sync (letting a local AI client see your profile) is **off by default** and, when enabled, only ever talks to `localhost`.
- An optional "enhance reasoning with Claude" feature in Settings uses your own Anthropic API key, called directly from your browser — WhatNext has no server of its own that ever sees that key or your data.

See [`docs/PORTFOLIO.md`](docs/PORTFOLIO.md) for the elevator pitch, and [`docs/FUTURE_IMPROVEMENTS.md`](docs/FUTURE_IMPROVEMENTS.md) for an honest list of what's intentionally scoped out of v1.
