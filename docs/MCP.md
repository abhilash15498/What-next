# MCP Documentation

WhatNext ships a real Model Context Protocol server (`mcp-server/`), built on the
official `@modelcontextprotocol/sdk`. It is entirely optional — the extension works
fully standalone without it — but when running, it lets any MCP-compatible AI client
(Claude Desktop, or any other MCP client) query your interest profile and
recommendation history, and even trigger the recommendation engine directly.

**MCP is not responsible for generating recommendations inside the extension.**
It's a read/act interface *on top of* the same data and engine, for external AI
clients.

## Running it

```bash
cd mcp-server
npm run build
npm run start
```

This starts two things in one process:
1. The MCP server, communicating over **stdio** with whatever spawned it.
2. A local HTTP sync API on `http://localhost:8787` (loopback-only), which the
   extension pushes snapshots to when **Settings → MCP sync** is enabled.

Its data lives in a plain JSON file at `~/.whatnext-mcp/store.json` (override with
the `WHATNEXT_DATA_DIR` env var).

## Connecting Claude Desktop

Add this to your Claude Desktop MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "whatnext": {
      "command": "node",
      "args": ["/absolute/path/to/whatnext/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, then in the extension go to **Settings → MCP sync**, enable
it, and hit **Regenerate** on the Today tab once so a snapshot gets pushed.

## Resources

| URI | Contents |
|---|---|
| `whatnext://interest-profile` | Full interest graph — scores, confidence, trend, relationships |
| `whatnext://recommendation-history` | Last 100 recommendations with scores and DNA |
| `whatnext://saved-recommendations` | Recommendations the user explicitly saved |
| `whatnext://preferences` | Disabled categories, time budget, privacy settings |
| `whatnext://current-context` | Time of day / day of week / top 5 current interests |

## Tools

| Tool | Input | What it does |
|---|---|---|
| `generate_recommendations` | *(none)* | Runs the full engine now — providers → ranking → timeline. Returns the ranked feed as JSON. |
| `update_interests` | `{ tags: string[], direction: 'up'\|'down', magnitude?: number }` | Manually reinforces or reduces interest tags — e.g. when a user states a preference in conversation. |
| `record_feedback` | `{ recommendationId: string, feedbackType: FeedbackType }` | Records feedback on a specific recommendation and feeds it back into the profile. |
| `search_interests` | `{ query: string }` | Substring search across tracked interests. |
| `explain_recommendation` | `{ recommendationId: string }` | Returns the Why-Now text, AI reasoning trail, and DNA for a specific recommendation. |

## Prompts

- **"What should I do next?"** (`what-should-i-do-next`) — picks the single best
  action across every category.
- **"Recommend a coding project."** (`recommend-a-coding-project`)
- **"Recommend a movie."** (`recommend-a-movie`)
- **"Recommend something useful."** (`recommend-something-useful`) — weighted
  toward career/learning/coding_project/tool categories.

Each prompt embeds a live summary of your current top interests, then instructs the
model to call `generate_recommendations` and reason over the real result — prompts
don't hard-code any recommendation content themselves.

## Security notes

- The HTTP sync API only accepts connections from `127.0.0.1`/`::1` (see the
  middleware guard in `mcp-server/src/sync/httpSyncServer.ts`).
- MCP sync is **off by default** in the extension; enabling it is an explicit,
  visible toggle in Settings.
- The MCP server has no outbound network calls of its own — it only reads/writes its
  local JSON file and answers requests over stdio/loopback HTTP.
