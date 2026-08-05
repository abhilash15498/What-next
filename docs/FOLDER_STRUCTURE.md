# Folder Structure

```
whatnext/
├── package.json                  # root workspace (npm workspaces: packages/*, extension, mcp-server)
├── .prettierrc
├── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── DEVELOPER_GUIDE.md
│   ├── API.md
│   ├── MCP.md
│   ├── FOLDER_STRUCTURE.md        # this file
│   ├── FUTURE_IMPROVEMENTS.md
│   └── PORTFOLIO.md
│
├── packages/core/                 # @whatnext/core — pure TS, zero IO deps
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts               # public barrel export
│       ├── types.ts               # Category, Interest, Candidate, Recommendation, etc.
│       ├── storage/
│       │   └── types.ts           # the Storage interface + DEFAULT_PREFERENCES
│       ├── interests/
│       │   ├── profile.ts         # decay, applySignals, reinforceTags, graph edges
│       │   └── signals.ts         # keyword classification + domain blocklist
│       ├── providers/
│       │   ├── types.ts           # Provider interface
│       │   ├── index.ts           # ALL_PROVIDERS registry
│       │   ├── movieProvider.ts
│       │   ├── bookProvider.ts
│       │   ├── githubProvider.ts
│       │   ├── learningProvider.ts
│       │   ├── codingProjectProvider.ts
│       │   ├── fitnessProvider.ts
│       │   ├── careerProvider.ts
│       │   ├── toolProvider.ts
│       │   └── newsProvider.ts
│       ├── engine/
│       │   ├── rank.ts            # scoring + diversity selection
│       │   ├── explain.ts         # Why Now / Why Not / AI reasoning
│       │   ├── timeline.ts        # Now/Tonight/Tomorrow/Weekend bucketing
│       │   ├── digest.ts          # daily digest builder
│       │   └── engine.ts          # generateRecommendations() orchestrator
│       ├── feedback/
│       │   └── feedback.ts        # recordFeedback()
│       └── utils/
│           ├── id.ts
│           └── time.ts
│
├── extension/                      # the Chrome MV3 extension
│   ├── package.json
│   ├── manifest.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts              # multi-page build: popup/options/newtab
│   ├── vite.background.config.ts   # single-file ESM build: background.js
│   ├── vite.content.config.ts      # single-file IIFE build: content.js
│   ├── scripts/
│   │   ├── generate-icons.mjs      # hand-rolled PNG encoder for icon assets
│   │   └── copy-manifest.mjs
│   ├── public/icons/                # icon-16/32/48/128.png (generated)
│   └── src/
│       ├── vite-env.d.ts
│       ├── background/index.ts     # service worker: alarms, messages, context menu, MCP sync
│       ├── content/index.ts        # title/meta-only signal capture
│       ├── lib/
│       │   ├── messages.ts         # RuntimeMessage contract
│       │   ├── AppDataContext.tsx  # dashboard-wide data/actions context
│       │   ├── storage/indexedDbAdapter.ts   # Storage impl over Dexie/IndexedDB
│       │   ├── sync/mcpSync.ts     # pushes snapshots to the local MCP server
│       │   └── ai/enhanceReasoning.ts        # optional BYOK Claude rewrite
│       ├── components/             # shared UI: cards, badges, meters, settings panel
│       ├── popup/                  # quick-glance popup
│       ├── options/                # standalone settings page
│       └── newtab/                 # the full dashboard
│           ├── App.tsx             # sidebar + tab shell
│           ├── Onboarding.tsx
│           └── tabs/
│               ├── TodayTab.tsx
│               ├── FeedTab.tsx
│               ├── SavedTab.tsx
│               ├── HistoryTab.tsx
│               ├── GraphTab.tsx        # React Flow interest graph
│               ├── AnalyticsTab.tsx    # Recharts
│               ├── SearchTab.tsx
│               └── SettingsTab.tsx
│
└── mcp-server/                      # @whatnext/mcp-server
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                 # starts stdio MCP server + local HTTP sync API
        ├── storage/jsonFileAdapter.ts   # Storage impl over a local JSON file
        ├── sync/httpSyncServer.ts   # loopback-only Express sync API
        └── mcp/
            ├── server.ts            # createWhatNextMcpServer()
            ├── resources.ts
            ├── tools.ts
            └── prompts.ts
```
