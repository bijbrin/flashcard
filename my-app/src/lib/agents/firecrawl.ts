/**
 * Firecrawl API Client for web scraping
 */

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

interface ScrapeOptions {
  url: string;
  formats?: string[];
  onlyMainContent?: boolean;
}

export async function scrapeUrl(options: ScrapeOptions) {
  const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: options.url,
      formats: options.formats || ['markdown', 'html'],
      onlyMainContent: options.onlyMainContent ?? true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl API error: ${error}`);
  }

  return response.json();
}

/**
 * Crawl multiple pages from a documentation site
 */
export async function crawlDocs(baseUrl: string, maxPages: number = 10) {
  const response = await fetch(`${FIRECRAWL_API_URL}/crawl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: baseUrl,
      limit: maxPages,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl crawl error: ${error}`);
  }

  return response.json();
}

/**
 * Map a website to find all relevant URLs
 */
export async function mapWebsite(url: string) {
  const response = await fetch(`${FIRECRAWL_API_URL}/map`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      search: 'documentation',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firecrawl map error: ${error}`);
  }

  return response.json();
}
