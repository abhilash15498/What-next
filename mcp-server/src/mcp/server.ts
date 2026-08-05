import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerResources } from './resources.js';
import { registerTools } from './tools.js';
import { registerPrompts } from './prompts.js';

export function createWhatNextMcpServer(): McpServer {
  const server = new McpServer({
    name: 'whatnext',
    version: '1.0.0',
  });

  registerResources(server);
  registerTools(server);
  registerPrompts(server);

  return server;
}
