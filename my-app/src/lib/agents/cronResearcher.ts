import { researchGitHubTopics } from './kimi';
import { Topic } from '@/types';

const GITHUB_RESEARCH_QUERIES = [
  'Next.js App Router performance issues 2025',
  'React Server Components common mistakes',
  'Next.js middleware authentication patterns',
  'React hooks performance optimization',
  'Next.js caching strategies production',
];

/**
 * Research GitHub for new topics and patterns
 */
export async function researchNewTopics(): Promise<Partial<Topic>[]> {
  const allTopics: Partial<Topic>[] = [];

  // Pick a random query for this run
  const query = GITHUB_RESEARCH_QUERIES[Math.floor(Math.random() * GITHUB_RESEARCH_QUERIES.length)];

  try {
    console.log(`Researching GitHub: ${query}`);
    
    const result = await researchGitHubTopics(query);

    if (result.topics?.length) {
      const topics = result.topics.map((t: any) => ({
        ...t,
        id: crypto.randomUUID(),
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        source_urls: ['https://github.com'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      allTopics.push(...topics);
    }
  } catch (error) {
    console.error('Error researching GitHub:', error);
  }

  return allTopics;
}
