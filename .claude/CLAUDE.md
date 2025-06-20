# @rukuma/context MCP Server

This is an MCP (Model Context Protocol) server that provides context gathering capabilities for LLMs.

## Project Structure
- TypeScript-based MCP server
- Two main tools: fetch-github-context and fetch-website-context
- Uses simple-git for GitHub operations
- Web scraping with axios/cheerio and HTML-to-Markdown conversion

## Key Features
1. GitHub Repository Context:
   - Clones repos to temp directory
   - Generates file tree
   - Extracts all text files
   - Formats into single document with navigation instructions

2. Website Documentation Context:
   - Crawls websites with configurable depth
   - Converts HTML to Markdown
   - Consolidates multiple pages
   - Respects domain boundaries

## Development Commands
- `npm run build` - Compile TypeScript
- `npm run dev` - Run in development mode with tsx
- `npx @modelcontextprotocol/inspector dist/index.js` - Test with MCP Inspector

## Publishing
Ready to publish to npm as @rukuma/context