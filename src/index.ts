#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { fetchGitHubContext, githubContextSchema } from './tools/github.js';
import { fetchWebsiteContext, websiteContextSchema } from './tools/website.js';

// Create server instance
const server = new Server(
  {
    name: '@rukuma/context',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fetch-github-context',
        description: 'Fetch complete context from a GitHub repository including README, file tree, and all source files',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'GitHub repository URL',
            },
            branch: {
              type: 'string',
              description: 'Specific branch to clone (defaults to default branch)',
            },
            includeDotFiles: {
              type: 'boolean',
              description: 'Include dotfiles in the context',
              default: false,
            },
            maxDepth: {
              type: 'number',
              description: 'Maximum depth for file tree generation',
              default: 5,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'fetch-website-context',
        description: 'Fetch and consolidate content from a website and its linked pages into a single document',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Starting URL to scrape',
            },
            maxDepth: {
              type: 'number',
              description: 'Maximum depth to follow links',
              default: 2,
            },
            maxPages: {
              type: 'number',
              description: 'Maximum number of pages to scrape',
              default: 50,
            },
            sameDomainOnly: {
              type: 'boolean',
              description: 'Only scrape pages from the same domain',
              default: true,
            },
          },
          required: ['url'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'fetch-github-context': {
        const input = githubContextSchema.parse(args);
        const result = await fetchGitHubContext(input);
        
        return {
          content: [
            {
              type: 'text',
              text: result.content,
            },
          ],
        };
      }
      
      case 'fetch-website-context': {
        const input = websiteContextSchema.parse(args);
        const result = await fetchWebsiteContext(input);
        
        return {
          content: [
            {
              type: 'text',
              text: result.content,
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Context MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});