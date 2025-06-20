# @rukuma/context

MCP (Model Context Protocol) server for gathering context from GitHub repositories and documentation websites. This server helps LLMs access comprehensive project context by fetching and formatting entire codebases or website documentation into a single, well-structured document.

## Features

### GitHub Repository Context
- Clones any public GitHub repository
- Generates a complete file tree structure
- Extracts and includes README documentation
- Compiles all source code files into a single document
- Provides reading instructions for easy navigation
- Supports branch selection and dotfile inclusion

### Website Documentation Context
- Crawls websites starting from a given URL
- Follows links to gather related pages (configurable depth)
- Converts HTML content to clean Markdown
- Consolidates multiple pages into a single document
- Supports domain restriction and page limits

## Installation

You can run this MCP server directly using npx without installing:

```bash
npx @rukuma/context
```

Or install globally:

```bash
npm install -g @rukuma/context
```

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "context": {
      "command": "npx",
      "args": ["@rukuma/context"]
    }
  }
}
```

After adding the configuration, restart Claude Desktop for the changes to take effect.

### Available Tools

#### fetch-github-context

Fetches complete context from a GitHub repository.

**Parameters:**
- `url` (required): GitHub repository URL
- `branch` (optional): Specific branch to clone
- `includeDotFiles` (optional): Include dotfiles in the context (default: false)
- `maxDepth` (optional): Maximum depth for file tree generation (default: 5)

**Example:**
```
Use the fetch-github-context tool with url "https://github.com/facebook/react"
```

#### fetch-website-context

Fetches and consolidates content from a website and its linked pages.

**Parameters:**
- `url` (required): Starting URL to scrape
- `maxDepth` (optional): Maximum depth to follow links (default: 2)
- `maxPages` (optional): Maximum number of pages to scrape (default: 50)
- `sameDomainOnly` (optional): Only scrape pages from the same domain (default: true)

**Example:**
```
Use the fetch-website-context tool with url "https://docs.example.com"
```

## Output Format

### GitHub Context Output
- Repository metadata and timestamp
- Complete README content
- Visual file tree structure
- All source code files with their content
- Instructions for navigating the document

### Website Context Output
- Website metadata and timestamp
- Table of contents with all scraped pages
- Each page's URL, title, and content in Markdown
- Organized in a single, searchable document

## Development

```bash
# Clone the repository
git clone <your-repo-url>
cd context

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```

## Technical Details

- Built with TypeScript and MCP SDK
- Uses `simple-git` for repository operations
- Web scraping with `axios` and `cheerio`
- HTML to Markdown conversion via `turndown`
- Supports all major programming languages and config files
- Respects robots.txt and implements reasonable scraping limits

## License

MIT