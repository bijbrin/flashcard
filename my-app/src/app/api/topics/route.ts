import { NextResponse } from 'next/server';
import { Topic } from '@/types';

// Mock data - will be replaced with DB fetch
const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'useTransition: Non-Urgent State Updates',
    slug: 'use-transition',
    category: 'react-hooks',
    difficulty: 4,
    plain_english_summary: 'A hook that lets you mark state updates as non-urgent, keeping the UI responsive during heavy computations.',
    when_to_use: 'Use when you have expensive state updates that cause UI lag.',
    when_not_to_use: 'Do not use for urgent updates like text input.',
    code_snippet: `const [isPending, startTransition] = useTransition();`,
    code_explanation: 'startTransition marks the state update as non-urgent.',
    real_world_example: 'Filtering a large list while keeping search input responsive.',
    gotchas: ['Cannot be used for controlled inputs', 'May still show stale UI briefly'],
    related_topic_ids: [],
    source_urls: ['https://react.dev'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // ... more topics
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let topics = mockTopics;

  if (category) {
    topics = topics.filter(t => t.category === category);
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedTopics = topics.slice(start, end);

  return NextResponse.json({
    topics: paginatedTopics,
    pagination: {
      page,
      limit,
      total: topics.length,
      totalPages: Math.ceil(topics.length / limit),
    },
  });
}
