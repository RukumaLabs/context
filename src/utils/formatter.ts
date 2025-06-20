export function formatGitHubContext(
  repoUrl: string,
  readme: string,
  fileTree: string,
  files: Array<{ path: string; content: string }>
): string {
  const timestamp = new Date().toISOString();
  
  let output = `# GitHub Repository Context
Generated: ${timestamp}
Repository: ${repoUrl}

## How to Read This Document

This document contains the complete context of a GitHub repository structured as follows:
1. README - The main documentation
2. File Tree - Visual representation of the repository structure
3. Source Files - Complete content of all text files in the repository

When referencing code, use the format: \`filename:line_number\` for easy navigation.

---

## README

${readme}

---

## Repository Structure

\`\`\`
${fileTree}
\`\`\`

---

## Source Files

`;

  for (const file of files) {
    output += `\n### ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\`\n`;
  }

  return output;
}

export function formatWebsiteContext(
  startUrl: string,
  pages: Array<{ url: string; title: string; content: string }>
): string {
  const timestamp = new Date().toISOString();
  
  let output = `# Website Documentation Context
Generated: ${timestamp}
Starting URL: ${startUrl}
Total Pages: ${pages.length}

## How to Read This Document

This document contains scraped content from a website and its linked pages.
Each section represents a different page with its URL and content converted to Markdown.

---

## Table of Contents

`;

  pages.forEach((page, index) => {
    output += `${index + 1}. [${page.title || page.url}](#page-${index + 1})\n`;
  });

  output += '\n---\n\n## Pages\n\n';

  pages.forEach((page, index) => {
    output += `### Page ${index + 1}\n`;
    output += `**URL:** ${page.url}\n`;
    output += `**Title:** ${page.title || 'Untitled'}\n\n`;
    output += `${page.content}\n\n---\n\n`;
  });

  return output;
}