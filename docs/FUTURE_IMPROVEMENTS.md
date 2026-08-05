# Future Improvements

This is an honest list of what v1 intentionally does **not** do, and how it could be
extended. Nothing here is faked or stubbed in the current code — these are real
next steps, not hidden TODOs.

## Scoped out of v1 (by design)

- **True score-over-time evolution chart.** The interest profile stores `trend`
  (rising/falling/flat) and `recentActivity` timestamps, but not a full historical
  time series of scores. The Analytics tab's "Signal activity — last 14 days" chart
  is built from real `recentActivity` data; a proper score-over-time chart would
  need a periodic snapshot job (e.g. a daily alarm that appends `{date, profile}` to
  a bounded history table). Straightforward to add, intentionally left out to avoid
  unbounded IndexedDB growth in v1.
- **"If you continue with your current interests, what skills will you develop in 6
  months?" prediction.** This needs either a hand-written heuristic mapping interest
  trajectories to skill outcomes (which would be more decorative than genuinely
  predictive) or a real LLM call. Since the BYOK Claude integration already exists
  for reasoning enhancement, the natural v2 path is a dedicated prompt that feeds the
  6-month interest trend into Claude and asks for a grounded projection — done
  properly rather than hard-coded.
- **Weekly summary.** The daily digest is fully implemented; a weekly rollup is the
  same `buildDailyDigest`-style aggregation over 7 days of history and would take
  under an hour to add once there's real multi-week usage data to aggregate.
- **SQLite in the MCP server.** Currently a JSON file store (see
  `docs/ARCHITECTURE.md` for why). Swapping in `better-sqlite3` behind the same
  `Storage` interface is a drop-in change if this ever needs to run at real scale or
  with concurrent writers.
- **Automated test suite.** There's no Jest/Vitest suite yet. The engine is pure,
  synchronous-shaped, and storage-agnostic specifically so it's easy to unit test —
  that's the natural next addition.
- **Vendor chunk splitting for the dashboard bundle.** The `newtab` bundle is ~570KB
  (React + Recharts + React Flow + Lucide). It works fine, but lazy-loading each tab
  (`React.lazy` + `Suspense`) would cut initial load meaningfully — reasonable v2
  polish, not required for correctness.
- **Real external data sources.** Every provider currently ships a curated, static
  dataset (real movies, real GitHub repos, real courses — not placeholder text) so
  the product works fully offline with zero API keys. A natural v2 extension is
  pulling live data (e.g. a GitHub trending API, a movie database) behind the same
  `Provider` interface — no changes needed to ranking/explanation/timeline logic.

## Natural v2 directions

- OAuth-free personal integrations (e.g. reading a public GitHub activity feed) as
  additional signal sources, still fully local.
- A "why this ranked above that" side-by-side comparison view.
- Exporting/importing the full local profile as a single JSON file (portable across
  browsers/machines without any server).
- Multi-profile support (e.g. separate "work" and "personal" interest graphs).
