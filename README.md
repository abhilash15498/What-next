# WhatNext? — Stop Scrolling. Start Doing.

![WhatNext Banner](docs/screenshots/promo.png)

> **WhatNext?** is an AI-powered, privacy-first, category-independent Chrome extension that tells you the **single most valuable thing to do next** — movies, books, GitHub repos, courses, coding projects, fitness, career, tools, and news — ranked against one shared local interest model.

---

## 📸 Interface Showcase

### Dashboard & Daily Recommendation
![WhatNext Dashboard](docs/screenshots/dashboard.png)

### Settings & BYOK API Integrations
![WhatNext Settings](docs/screenshots/settings.png)

---

## ✨ Features

- **🎯 Unified 9-Category Engine**: Evaluates Movies, Books, GitHub Repos, Courses, Side Projects, Fitness, Career, News, and Productivity Tools in parallel.
- **⚡ Live Data Providers (BYOK)**: Fetch real-time up-to-date recommendations using optional API keys:
  - **TMDB**: Live popular movies and TV shows matching your interest tags.
  - **Google Books**: Targeted book discovery based on your top reading topics.
  - **GitHub API**: Trending repositories matching your development interests.
  - **NewsAPI**: Personalised headlines and tech digests.
- **🤖 Groq LLM Reasoning**: Integrates Groq (`llama-3.3-70b-versatile`) via BYOK to generate personalised, natural-language *"Why Now?"* and *"AI Reasoning"* explanations for top recommendations.
- **🔒 100% Privacy-First & Local**:
  - Interest profile, recommendation history, and feedback live entirely in browser **IndexedDB**.
  - No login, no cloud server, zero tracking.
  - Banking, payment, and login pages are automatically excluded from browsing signal collection.
- **🔌 Local MCP Sync (Opt-In)**: Sync your context to a local Model Context Protocol (MCP) server on `localhost` so local AI tools (e.g. Claude Desktop) can query your interests safely.

---

## 📦 Quick Installation (No Build Tools Required)

1. Download the latest `whatnext-extension.zip` from our website or repository.
2. Unzip the file into a folder on your computer.
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable **Developer mode** in the top-right corner.
5. Click **Load unpacked** and select the unzipped folder.

---

## 🏗️ Monorepo Architecture

WhatNext? is structured as an `npm` workspace monorepo:

| Package / Folder | Purpose |
|---|---|
| [`core`](core) | Storage-agnostic core engine: interest profile modeling, providers, multi-factor ranking, timeline generator, and Groq LLM enrichment. Pure TypeScript. |
| [`extension`](extension) | Chrome Extension (MV3): background worker, content script for signal capture, popup UI, settings panel, and dashboard. |
| [`mcp-server`](mcp-server) | Standalone local Model Context Protocol (MCP) server for local AI client interoperability. |
| [`website`](website) | Next.js landing page with direct extension zip download and setup instructions. |

---

## 🛠️ Development & Building from Source

```bash
# Clone the repository
git clone https://github.com/abhilash15498/What-next.git
cd What-next

# Install dependencies
npm install

# Build core and extension
npm run build

# Start extension dev server
npm run dev

# Start landing page website dev server
npm run dev:web
```

---

## 📜 License

Open source under the [MIT License](LICENSE).
