import { scrapeUrl, crawlDocs } from './firecrawl';
import { extractTopicsFromDocs } from './openai';
import { Topic } from '@/types';

const DOC_SOURCES = [
  {
    name: 'Next.js App Router',
    url: 'https://nextjs.org/docs/app',
    category: 'nextjs-core' as const,
  },
  {
    name: 'React Reference',
    url: 'https://react.dev/reference/react',
    category: 'react-hooks' as const,
  },
  {
    name: 'React Hooks',
    url: 'https://react.dev/reference/react/hooks',
    category: 'react-hooks' as const,
  },
];

/**
 * Scrape documentation and extract topics
 */
export async function scrapeAndExtractTopics(): Promise<Topic[]> {
  const allTopics: Topic[] = [];

  for (const source of DOC_SOURCES) {
    try {
      console.log(`Scraping ${source.name}...`);
      
      // Scrape the documentation
      const result = await scrapeUrl({
        url: source.url,
        formats: ['markdown'],
        onlyMainContent: true,
      });

      if (!result.data?.markdown) {
        console.warn(`No content found for ${source.name}`);
        continue;
      }

      // Extract topics using Kimi
      const extracted = await extractTopicsFromDocs(
        result.data.markdown,
        source.name
      );

      if (extracted.topics?.length) {
        const topics = extracted.topics.map((t: any) => ({
          ...t,
          id: crypto.randomUUID(),
          slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          source_urls: [source.url],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        allTopics.push(...topics);
        console.log(`Extracted ${topics.length} topics from ${source.name}`);
      }
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
    }
  }

  return allTopics;
}

/**
 * Scrape a specific URL for content
 */
export async function scrapeSingleUrl(url: string): Promise<string> {
  const result = await scrapeUrl({
    url,
    formats: ['markdown'],
    onlyMainContent: true,
  });

  return result.data?.markdown || '';
}
