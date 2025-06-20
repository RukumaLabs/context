import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { URL } from 'url';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Configure turndown to handle common patterns better
turndown.addRule('pre-code', {
  filter: ['pre'],
  replacement: function(content, node) {
    const codeElement = node.querySelector('code');
    const lang = codeElement?.className?.match(/language-(\w+)/)?.[1] || '';
    return '\n```' + lang + '\n' + content + '\n```\n';
  }
});

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
}

export async function scrapeWebsite(
  startUrl: string,
  maxDepth: number = 2,
  maxPages: number = 50,
  sameDomainOnly: boolean = true
): Promise<ScrapedPage[]> {
  const visited = new Set<string>();
  const toVisit = [{ url: startUrl, depth: 0 }];
  const pages: ScrapedPage[] = [];
  const startDomain = new URL(startUrl).hostname;
  
  while (toVisit.length > 0 && pages.length < maxPages) {
    const { url, depth } = toVisit.shift()!;
    
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }
    
    visited.add(url);
    
    try {
      const page = await scrapePage(url);
      if (page) {
        pages.push(page);
        
        // Extract links if we haven't reached max depth
        if (depth < maxDepth) {
          const links = await extractLinks(url, page.content);
          for (const link of links) {
            const linkDomain = new URL(link).hostname;
            if (!sameDomainOnly || linkDomain === startDomain) {
              if (!visited.has(link)) {
                toVisit.push({ url: link, depth: depth + 1 });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
    }
  }
  
  return pages;
}

async function scrapePage(url: string): Promise<ScrapedPage | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContextBot/1.0)',
      },
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, noscript').remove();
    
    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    
    // Get main content
    let contentHtml = '';
    
    // Try to find main content areas
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '#content',
      '.content',
      '#main',
      '.main',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        contentHtml = element.html() || '';
        break;
      }
    }
    
    // Convert to markdown
    const content = turndown.turndown(contentHtml);
    
    return {
      url,
      title: title.trim(),
      content: content.trim()
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function extractLinks(baseUrl: string, html: string): Promise<string[]> {
  const $ = cheerio.load(html);
  const links: string[] = [];
  const base = new URL(baseUrl);
  
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      try {
        const absoluteUrl = new URL(href, base).href;
        // Filter out non-http(s) links and anchors
        if (absoluteUrl.startsWith('http') && !absoluteUrl.includes('#')) {
          links.push(absoluteUrl);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }
  });
  
  return [...new Set(links)]; // Remove duplicates
}