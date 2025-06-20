import { z } from 'zod';
import { scrapeWebsite } from '../utils/scraper.js';
import { formatWebsiteContext } from '../utils/formatter.js';
import type { ContextResult } from '../types.js';

export const websiteContextSchema = z.object({
  url: z.string().url().describe('Starting URL to scrape'),
  maxDepth: z.number().optional().default(2).describe('Maximum depth to follow links'),
  maxPages: z.number().optional().default(50).describe('Maximum number of pages to scrape'),
  sameDomainOnly: z.boolean().optional().default(true).describe('Only scrape pages from the same domain')
});

export async function fetchWebsiteContext(input: z.infer<typeof websiteContextSchema>): Promise<ContextResult> {
  const { url, maxDepth, maxPages, sameDomainOnly } = input;
  
  console.log(`Starting website scrape: ${url}`);
  console.log(`Config: maxDepth=${maxDepth}, maxPages=${maxPages}, sameDomainOnly=${sameDomainOnly}`);
  
  // Scrape the website
  const pages = await scrapeWebsite(url, maxDepth, maxPages, sameDomainOnly);
  
  if (pages.length === 0) {
    throw new Error('No pages could be scraped from the provided URL');
  }
  
  console.log(`Successfully scraped ${pages.length} pages`);
  
  // Format the context
  const content = formatWebsiteContext(url, pages);
  
  return {
    content,
    metadata: {
      source: url,
      timestamp: new Date().toISOString(),
      stats: {
        pages: pages.length,
        totalSize: Buffer.byteLength(content, 'utf-8')
      }
    }
  };
}