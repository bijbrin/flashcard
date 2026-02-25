import { TopicsPageClient } from './TopicsPageClient';
import { getTopics } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TopicsPageServer() {
  try {
    const topics = await getTopics();
    return <TopicsPageClient initialTopics={topics} />;
  } catch (error) {
    // Return empty state if DB not available during build
    return <TopicsPageClient initialTopics={[]} />;
  }
}
