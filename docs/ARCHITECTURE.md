# Architecture

## The core idea: one engine, two runtimes

The hard part of this project isn't the UI — it's that the *same* recommendation
logic needs to run in two very different places:

1. **Inside the browser extension**, reading/writing IndexedDB, triggered by alarms,
   content-script signals, and user clicks.
2. **Inside the MCP server**, reading/writing a local JSON file, triggered by tool
   calls from an AI client like Claude Desktop.

Rather than duplicate the interest-scoring, ranking, and explanation logic in both
places (and have them drift apart), all of it lives in **`packages/core`**, which has
zero IO dependencies. Every function in core takes a `Storage` implementation as an
argument:

```ts
export interface Storage {
  getInterestProfile(): Promise<InterestProfile>;
  saveInterestProfile(profile: InterestProfile): Promise<void>;
  addRecommendations(recs: Recommendation[]): Promise<void>;
  // ...
}
```

- `extension/src/lib/storage/indexedDbAdapter.ts` implements `Storage` with Dexie/IndexedDB.
- `mcp-server/src/storage/jsonFileAdapter.ts` implements `Storage` with a local JSON file.

Both adapters satisfy the exact same interface, so `generateRecommendations(storage)`,
`recordFeedback(storage, rec, type)`, etc. run identically regardless of which runtime
called them.

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│         extension            │        │          mcp-server           │
│                              │        │                                │
│  background / content /     │        │  MCP tools/resources/prompts   │
│  popup / options / newtab    │        │  HTTP sync API (opt-in)        │
│           │                  │        │           │                    │
│  indexedDbAdapter (Dexie)    │        │  jsonFileAdapter (fs)          │
└───────────┼──────────────────┘        └───────────┼──────────────────┘
            │                                        │
            └────────────────┬───────────────────────┘
                              ▼
                     packages/core (pure TS)
      interests/  providers/  engine/  feedback/  storage/types.ts
```

## Data flow, end to end

1. **Signal capture.** The content script reads `document.title` + meta description
   (never body/forms) and messages the background worker. The background worker
   checks the domain blocklist from Preferences, and if the page isn't sensitive,
   calls `buildSignalFromPageVisit` (deterministic keyword classification) to turn it
   into weighted interest tags, then `applySignals` to fold that into the profile.

2. **Passive decay.** Every time recommendations are (re)generated, `decayProfile`
   is run first — interests cool off ~1.5%/day without reinforcement, confidence
   decays much more slowly.

3. **Candidate generation.** `ALL_PROVIDERS` (9 category providers, each a small
   curated dataset) produce every candidate. `scoreAllCandidates` ranks them against
   the profile, feedback history, current time context, and time budget.

4. **Selection.** `selectDiverseFeed` caps how many items per category can appear in
   the top-N feed, so the result isn't all-movies or all-GitHub.

5. **Explanation.** For every selected item, `buildWhyNow` / `buildAiReasoning`
   generate template-based, traceable text — every sentence can be tied back to a
   real matched tag, score, or dataset field. `buildWhyNot` does the same for
   rejected candidates.

6. **Timeline.** `buildTimeline` buckets the ranked feed into Now / Tonight /
   Tomorrow / Weekend based on each candidate's `suitedWindows` and the current
   time-of-day/weekend context.

7. **Feedback loop.** Feedback buttons call `recordFeedback`, which stores a
   `FeedbackRecord` and calls `reinforceTags` to nudge the relevant interests up or
   down — this is what makes future rankings actually respond to what you clicked.

## Why explanations are deterministic, not just an LLM call

`buildWhyNow` / `buildWhyNot` / `buildAiReasoning` are template functions over real
computed values (matched tags, scores, confidence, rank, candidate count) — not a
opaque LLM call. This means:

- Every explanation is honest and reproducible; the same inputs always produce the
  same explanation.
- There's no dependency on a hosted LLM for the core product to work at all.
- Users who *do* want richer prose can optionally add their own Anthropic API key in
  Settings, and `enhanceReasoningWithClaude` will rewrite the deterministic text into
  something warmer — strictly a rewrite, not a new source of facts (see
  `extension/src/lib/ai/enhanceReasoning.ts`).

## Why the extension has three separate Vite builds

MV3 service workers and content scripts need single, non-code-split bundles.
Mixing that with a multi-page HTML app (popup/options/newtab, which *should*
share chunks) in one Rollup config is fragile. So:

- `vite.config.ts` — multi-page build for `popup/`, `options/`, `newtab/` (ESM, shared chunks are fine here).
- `vite.background.config.ts` — single entry, ESM, `background.js` (MV3 supports `"type": "module"` service workers).
- `vite.content.config.ts` — single entry, IIFE, `content.js` (content scripts shouldn't assume ESM support).

`npm run build` in `extension/` runs all three in sequence, then copies `manifest.json`
into `dist/`.

## Why the MCP server uses a JSON file instead of SQLite

`better-sqlite3` is a native addon requiring a compiled binary per platform/Node
version — a real source of "works on my machine" install failures for a portfolio
project meant to be cloned and built by strangers. A JSON file store implements the
exact same `Storage` interface and is genuinely sufficient for a single-user local
companion process. See `docs/FUTURE_IMPROVEMENTS.md` for the upgrade path.
