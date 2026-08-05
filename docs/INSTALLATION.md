# Installation Guide

## Prerequisites

- Node.js ≥ 18
- Google Chrome (or any Chromium-based browser that supports Manifest V3)

## 1. Install dependencies

From the repo root:

```bash
npm install
```

This installs dependencies for all three workspaces (`packages/core`, `extension`,
`mcp-server`) in one pass via npm workspaces.

## 2. Build

```bash
npm run build
```

This runs, in order:

1. `packages/core` — compiles the shared engine to `packages/core/dist`.
2. `extension` — generates icons, type-checks, builds `popup/options/newtab` HTML,
   builds `background.js` and `content.js`, and copies `manifest.json` — everything
   lands in `extension/dist`.
3. `mcp-server` — compiles to `mcp-server/dist`.

If you only want to iterate on the extension:

```bash
npm run dev
```

This builds `packages/core` once and starts Vite's dev server for the HTML surfaces
(hot reload for popup/options/newtab). Background and content scripts don't hot
reload — after editing `src/background` or `src/content`, re-run:

```bash
cd extension
npx vite build --config vite.background.config.ts
npx vite build --config vite.content.config.ts
```

then click the reload icon for the extension in `chrome://extensions`.

## 3. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select `extension/dist`

Chrome will install WhatNext. Open a new tab to see the onboarding screen.

## 4. (Optional) Run the MCP server

The MCP server lets a local MCP-compatible AI client (like Claude Desktop) query your
WhatNext interest profile and recommendation history. It's entirely optional — the
extension works fully standalone without it.

```bash
cd mcp-server
npm run build
npm run start
```

This starts:
- The MCP server itself, communicating over stdio (for whatever process spawned it)
- A local HTTP sync API on `http://localhost:8787` (for the extension to push snapshots to)

To use it with Claude Desktop, add it to your MCP server config (see
[`docs/MCP.md`](MCP.md) for the exact config block), then in the extension go to
**Settings → MCP sync** and enable it.

## Troubleshooting

- **"Cannot find module '@whatnext/core'"** — run `npm install` and
  `npm run build:core` from the repo root first; the extension and mcp-server both
  depend on `packages/core`'s compiled `dist/` output.
- **Extension icon is a puzzle piece / broken** — re-run `npm run build` in
  `extension/`; icons are generated fresh into `extension/public/icons` by
  `scripts/generate-icons.mjs` on every build.
- **Chrome shows "Manifest file is missing or unreadable"** — make sure you selected
  `extension/dist`, not `extension/` itself.
