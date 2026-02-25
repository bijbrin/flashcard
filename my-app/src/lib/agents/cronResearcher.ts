import { researchGitHubTopics } from './kimi';
import { Category } from '@/types';

const CATEGORY_QUERIES: Record<Category, string[]> = {
  'react-hooks': [
    'React hooks performance patterns 2025',
    'useTransition useDeferredValue real world',
    'custom hooks composition patterns',
  ],
  'nextjs-core': [
    'Next.js App Router patterns 2025',
    'Partial Prerendering PPR production',
    'Next.js middleware authentication',
  ],
  'third-party-api': [
    'Stripe webhooks Next.js App Router',
    'Clerk auth advanced patterns',
    'Prisma Supabase integration',
  ],
  'server-side': [
    'Server Actions mutations patterns',
    'React Server Components data fetching',
    'Edge Runtime vs Node.js trade-offs',
  ],
  'advanced': [
    'Turborepo monorepo patterns 2025',
    'Next.js Web Vitals optimization',
    'React testing patterns Playwright',
  ],
  'ai-integration': [
    'Vercel AI SDK streaming patterns',
    'RAG implementation Next.js',
    'OpenAI streaming React Suspense',
  ],
};

/**
 * Research new topics for a specific category
 */
export async function researchNewTopics(
  category: Category,
  count: number = 2
): Promise<any[]> {
  const queries = CATEGORY_QUERIES[category];
  const query = queries[Math.floor(Math.random() * queries.length)];
  
  console.log(`Researching ${category}: ${query}`);
  
  const result = await researchGitHubTopics(query);
  
  // Return up to 'count' topics
  return (result.topics || []).slice(0, count).map((t: any) => ({
    ...t,
    category,
    source_urls: ['https://github.com'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
