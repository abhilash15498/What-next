# Developer Guide

## Adding a new recommendation category

1. Add the category to the `Category` union in `packages/core/src/types.ts`.
2. Create `packages/core/src/providers/yourCategoryProvider.ts`:

   ```ts
   import type { Candidate } from '../types.js';
   import type { Provider } from './types.js';

   const items: Candidate[] = [
     {
       id: 'yourcat_example',
       title: '...',
       description: '...',
       category: 'your_category',
       tags: ['some_tag'],
       difficulty: 'beginner',
       estimatedMinutes: 30,
       popularity: 0.5,
       addedAt: Date.parse('2025-01-01'),
       suitedWindows: ['now'],
     },
   ];

   export const yourCategoryProvider: Provider = {
     category: 'your_category',
     name: 'Your Category Provider',
     getCandidates: () => items,
   };
   ```

3. Register it in `packages/core/src/providers/index.ts` — add it to `ALL_PROVIDERS`.
4. Add a label for it in `extension/src/components/Badges.tsx` and
   `extension/src/components/SettingsPanel.tsx` (`LABELS` maps).
5. Rebuild: `npm run build:core && cd extension && npm run build`.

That's the entire integration surface — ranking, explanations, timeline bucketing,
and diversity selection all work automatically because they operate on `Candidate[]`
generically.

## Adding a new interest tag

Interest tags are just strings — there's no fixed enum. To make the keyword
classifier recognize a new topic, add it to `TAG_KEYWORDS` in
`packages/core/src/interests/signals.ts`:

```ts
export const TAG_KEYWORDS: Record<string, string[]> = {
  // ...
  rock_climbing: ['rock climbing', 'bouldering', 'climbing gym'],
};
```

Any candidate whose `tags` array includes `'rock_climbing'` will now be matched
against real user signal for that topic.

## Adjusting the ranking formula

All ranking weights live in one place: `WEIGHTS` in
`packages/core/src/engine/rank.ts`. Each weight corresponds to a 0-1 sub-score
(interest similarity, context relevance, feedback adjustment, freshness, novelty,
popularity, estimated usefulness) that gets combined into a single 0-100 score. Tweak
the relative weights there; nothing else needs to change.

## Testing changes end-to-end

There's no separate test suite in v1 (see `FUTURE_IMPROVEMENTS.md`), but you can
sanity-check the engine directly in Node:

```bash
cd packages/core
npm run build
node -e "
const { generateRecommendations, ALL_PROVIDERS } = require('./dist/index.js');
console.log(ALL_PROVIDERS.map(p => p.name));
"
```

For the full pipeline, the most reliable check is:

```bash
npm run build   # from repo root — builds core, extension, and mcp-server
```

If this completes without errors, both runtimes compile against the exact same core
engine.

## Code style

- `npm run format` (Prettier) at the repo root.
- `npm run lint` in `extension/` (ESLint + `@typescript-eslint` + `react-hooks`).
- Strict TypeScript everywhere (`strict: true` in every `tsconfig.json`).

## Where things live (quick index)

| I want to change... | Look at... |
|---|---|
| How interests decay/grow | `packages/core/src/interests/profile.ts` |
| What counts as a "sensitive" page | `packages/core/src/interests/signals.ts` (`isSensitiveDomain`) + `extension/src/content/index.ts` |
| Ranking weights | `packages/core/src/engine/rank.ts` |
| Explanation wording | `packages/core/src/engine/explain.ts` |
| Now/Tonight/Tomorrow/Weekend logic | `packages/core/src/engine/timeline.ts` |
| The dashboard's visual language | `extension/tailwind.config.js`, `extension/src/styles/index.css` |
| MCP tools/resources/prompts | `mcp-server/src/mcp/*.ts` |
