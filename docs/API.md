# API Documentation — `@whatnext/core`

`packages/core` is the shared engine. Everything below is exported from
`@whatnext/core`'s barrel (`src/index.ts`).

## Types (`src/types.ts`)

- `Category` — the 9 recommendation categories.
- `TimeWindow` — `'now' | 'tonight' | 'tomorrow' | 'weekend'`.
- `FeedbackType` — `'useful' | 'not_interested' | 'save' | 'later' | 'more_like_this'`.
- `Interest` — one node in the interest graph (`score`, `confidence`, `recentActivity`, `trend`, `relationships`, `lastUpdated`).
- `InterestProfile` — `Record<string, Interest>`.
- `Signal` — a single classified behavioural event.
- `Candidate` — a raw item from a provider, before ranking.
- `RecommendationDNA` — metadata attached to a ranked recommendation.
- `Recommendation` — a fully ranked, explained item ready for the UI.
- `RejectionExplanation` — why a low-scoring candidate wasn't surfaced.
- `Preferences` — user settings (disabled categories, time budget, privacy, BYOK key, etc).
- `EngineResult` — the full output of one recommendation run (timeline + feed + rejections).
- `DailyDigest` — the daily summary shape.

## Storage (`src/storage/types.ts`)

```ts
interface Storage {
  getInterestProfile(): Promise<InterestProfile>;
  saveInterestProfile(profile: InterestProfile): Promise<void>;
  addSignal(signal: Signal): Promise<void>;
  getRecentSignals(limitMs: number): Promise<Signal[]>;
  addRecommendations(recs: Recommendation[]): Promise<void>;
  getRecommendationHistory(limit?: number): Promise<Recommendation[]>;
  updateRecommendationStatus(id: string, status: Recommendation['status']): Promise<void>;
  getSavedRecommendations(): Promise<Recommendation[]>;
  addFeedback(record: FeedbackRecord): Promise<void>;
  getFeedbackHistory(limit?: number): Promise<FeedbackRecord[]>;
  getPreferences(): Promise<Preferences>;
  savePreferences(prefs: Preferences): Promise<void>;
  saveDigest(digest: DailyDigest): Promise<void>;
  getDigest(date: string): Promise<DailyDigest | null>;
  clearAll(): Promise<void>;
}
```

Every function below takes a `Storage` instance as its first (or only) IO-touching
argument. `DEFAULT_PREFERENCES` is also exported from this module.

## Interests (`src/interests/`)

- `decayProfile(profile, now?)` → `InterestProfile` — applies passive time-decay.
- `applySignals(profile, signals)` → `InterestProfile` — folds signals into the profile (scores, confidence, trend, relationships).
- `reinforceTags(profile, tags, direction, magnitude?)` → `InterestProfile` — explicit up/down nudge, used by feedback.
- `topInterests(profile, n?)` → `Interest[]`.
- `buildInterestGraphEdges(profile, threshold?)` → `{ source, target, weight }[]` — for the Interest Graph view.
- `classifyText(text)` → `{ tag, weight }[]` — deterministic keyword classification.
- `guessCategory(text)` → `Category | undefined`.
- `isSensitiveDomain(url, blocklist)` → `boolean`.
- `buildSignalFromPageVisit({ url, title, description, blocklist })` → `Signal | null`.
- `buildSignalFromSearch(query)` → `Signal | null`.

## Providers (`src/providers/`)

- `ALL_PROVIDERS: Provider[]` — the 9 registered category providers.
- `Provider` interface: `{ category, name, getCandidates(): Candidate[] }`.

## Engine (`src/engine/`)

- `scoreCandidate(candidate, ctx)` / `scoreAllCandidates(candidates, ctx)` → ranked `ScoredCandidate[]`.
- `selectDiverseFeed(scored, topN, capPerCategory?)` → diversity-capped top-N selection.
- `buildWhyNow(scored, profile)` / `buildWhyNot(scored)` / `buildAiReasoning(scored, candidatesEvaluated, rank)` → explanation strings.
- `buildTimeline(recommendations, perWindow?)` → `Record<TimeWindow, Recommendation[]>`.
- `assignWindow(suitedWindows, isWeekend, hourOfDay)` → `TimeWindow`.
- `buildDailyDigest(recommendations, now?)` → `DailyDigest`.
- `generateRecommendations(storage)` → `Promise<EngineResult>` — the full orchestrator: gathers every candidate, scores, selects, explains, timelines, and persists.

## Feedback (`src/feedback/feedback.ts`)

- `recordFeedback(storage, recommendation, type)` — records a `FeedbackRecord`, updates the recommendation's status, and reinforces the matched interest tags.

## Utils (`src/utils/`)

- `makeId(prefix?)`, `clamp(value, min, max)`, `round(value, decimals?)`
- `getCurrentContext(now?)` → `CurrentContext`
- `todayKey(now?)`, `daysAgo(timestamp, now?)`, `freshnessFromAge(addedAt, halfLifeDays?, now?)`

---

For the extension-specific message contract (content script ↔ background ↔ UI),
see `extension/src/lib/messages.ts`. For the MCP-specific tool/resource/prompt
contracts, see [`docs/MCP.md`](MCP.md).
