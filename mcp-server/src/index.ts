import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createWhatNextMcpServer } from './mcp/server.js';
import { startSyncServer } from './sync/httpSyncServer.js';
import { DATA_FILE } from './storage/jsonFileAdapter.js';

async function main() {
  console.error(`[whatnext-mcp] data file: ${DATA_FILE}`);

  // The HTTP sync API is how the Chrome extension pushes local snapshots
  // in when the user opts in via Settings > MCP sync.
  startSyncServer();

  // The MCP server itself talks stdio to whatever spawned this process
  // (e.g. Claude Desktop's mcpServers config, or any MCP-compatible client).
  const server = createWhatNextMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[whatnext-mcp] MCP server connected over stdio');
}

main().catch((err) => {
  console.error('[whatnext-mcp] fatal error', err);
  process.exit(1);
});
