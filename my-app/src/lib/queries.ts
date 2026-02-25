import { Topic, Flashcard, FlashcardWithProgress } from '@/types';
import { query, isDatabaseConfigured } from './db';

// Sample data for when database is not available
const sampleTopics: Topic[] = [
  {
    id: '1',
    title: 'useTransition: Non-Urgent State Updates',
    slug: 'use-transition',
    category: 'react-hooks',
    difficulty: 4,
    plain_english_summary: 'A hook that lets you mark state updates as non-urgent, keeping the UI responsive during heavy computations.',
    when_to_use: 'Use when you have expensive state updates that cause UI lag. Examples: filtering large datasets, sorting complex lists, updating charts.',
    when_not_to_use: 'Do not use for urgent updates like controlled text inputs, button hover states, or animation triggers.',
    code_snippet: `const [isPending, startTransition] = useTransition();

function handleClick() {
  startTransition(() => {
    setExpensiveState(newValue);
  });
}`,
    code_explanation: 'useTransition returns isPending (boolean) and startTransition (function). Wrap expensive state updates in startTransition.',
    real_world_example: 'Filtering a dashboard with 10,000+ rows while keeping the search input responsive.',
    gotchas: ['Cannot use for controlled inputs - cursor will jump', 'May still show stale UI briefly if interrupted', 'Only works with state updates, not side effects'],
    related_topic_ids: [],
    source_urls: ['https://react.dev'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Partial Prerendering (PPR)',
    slug: 'partial-prerendering',
    category: 'nextjs-core',
    difficulty: 4,
    plain_english_summary: 'Next.js feature that combines static and dynamic content in the same page for optimal performance.',
    when_to_use: 'When you want fast static shells with dynamic data. E-commerce product pages, dashboards with static layout.',
    when_not_to_use: 'For fully static or fully dynamic pages where PPR overhead is not needed.',
    code_snippet: `export const experimental_ppr = true;

export default async function Page() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </>
  );
}`,
    code_explanation: 'Suspense boundaries define the split. Content outside is prerendered statically. Content inside with async components becomes dynamic.',
    real_world_example: 'E-commerce product pages with static layout, dynamic inventory and pricing.',
    gotchas: ['Requires Suspense boundaries', 'Experimental feature - API may change', 'Not compatible with all Next.js features'],
    related_topic_ids: [],
    source_urls: ['https://nextjs.org/docs'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Server Actions with Optimistic UI',
    slug: 'server-actions-optimistic',
    category: 'server-side',
    difficulty: 4,
    plain_english_summary: 'Use useOptimistic hook with Server Actions for instant UI feedback before server confirms.',
    when_to_use: 'Forms, likes, comments where instant feedback matters and improves perceived performance.',
    when_not_to_use: 'When precise server state is required immediately or conflicts are likely.',
    code_snippet: `const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (state, newItem) => [...state, newItem]
);

async function handleSubmit(formData) {
  addOptimistic({ id: 'temp', content });
  await addItem(formData);
}`,
    code_explanation: 'addOptimistic updates UI immediately. The update function merges optimistic data with current state. Server confirmation replaces it.',
    real_world_example: 'Social media like buttons, comment sections, shopping cart updates.',
    gotchas: ['Handle error cases with rollback', 'May show incorrect data briefly', 'Requires careful state management'],
    related_topic_ids: [],
    source_urls: ['https://react.dev'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Stripe Webhooks in App Router',
    slug: 'stripe-webhooks',
    category: 'third-party-api',
    difficulty: 3,
    plain_english_summary: 'Handle Stripe webhooks in Next.js App Router with proper signature verification.',
    when_to_use: 'Processing payments, subscriptions, and invoice events securely.',
    when_not_to_use: 'For client-side only payment flows where webhooks are not needed.',
    code_snippet: `export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get('stripe-signature');
  
  const event = stripe.webhooks.constructEvent(
    payload, signature, webhookSecret
  );
  
  // Handle event
}`,
    code_explanation: 'Use req.text() to get raw body for signature verification. JSON parsing breaks signature validation.',
    real_world_example: 'Processing subscription renewals, payment failures, invoice generation.',
    gotchas: ['Must use raw body, not JSON', 'Webhook secret must be secure', 'Handle webhook retries idempotently'],
    related_topic_ids: [],
    source_urls: ['https://stripe.com/docs'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Turborepo Shared Packages',
    slug: 'turborepo-shared-packages',
    category: 'advanced',
    difficulty: 5,
    plain_english_summary: 'Create shared UI packages in Turborepo for multiple Next.js apps.',
    when_to_use: 'Monorepos with multiple apps needing shared components and design systems.',
    when_not_to_use: 'Single app projects where Turborepo adds unnecessary complexity.',
    code_snippet: `// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx"
  }
}`,
    code_explanation: 'Named exports allow importing specific components. Configure TypeScript project references for proper type checking.',
    real_world_example: 'Design systems shared across web and mobile apps, multi-brand platforms.',
    gotchas: ['Configure TypeScript project references', 'Set up proper build pipeline', 'Handle versioning carefully'],
    related_topic_ids: [],
    source_urls: ['https://turbo.build'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Vercel AI SDK Streaming',
    slug: 'vercel-ai-streaming',
    category: 'ai-integration',
    difficulty: 3,
    plain_english_summary: 'Stream AI responses in real-time using the Vercel AI SDK for chat-like experiences.',
    when_to_use: 'Chatbots, content generation, any AI feature needing real-time feel.',
    when_not_to_use: 'Simple one-shot AI calls where streaming adds no value.',
    code_snippet: `const { messages, input, handleInputChange, handleSubmit } = useChat();

return (
  <form onSubmit={handleSubmit}>
    <input value={input} onChange={handleInputChange} />
    {messages.map(m => <div key={m.id}>{m.content}</div>)}
  </form>
);`,
    code_explanation: 'useChat hook handles streaming, state management, and error handling automatically.',
    real_world_example: 'ChatGPT-like interfaces, streaming code completion, real-time content generation.',
    gotchas: ['Handle streaming errors gracefully', 'Configure proper API routes', 'Consider rate limiting'],
    related_topic_ids: [],
    source_urls: ['https://sdk.vercel.ai'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sampleFlashcards: Flashcard[] = [
  {
    id: '1',
    topic_id: '1',
    card_front: 'You have a child component re-rendering every time its parent renders. You memoized the child with React.memo. It still re-renders. What is the likely cause and fix?',
    card_back: 'The child is receiving a new function or object reference on every parent render. Even though React.memo shallow-compares props, new references fail the comparison. Use useCallback for functions and useMemo for objects.',
    difficulty: 'hard',
    has_code_snippet: true,
    code_snippet: `// Bad: New reference every render
function Parent() {
  const handleClick = () => setCount(c => c + 1);
  return <Child onClick={handleClick} />;
}

// Good: Memoized callback
function Parent() {
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  return <Child onClick={handleClick} />;
}`,
    memory_hook: 'React.memo does shallow comparison. New references = new props = re-render.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    topic_id: '1',
    card_front: 'What is the difference between useTransition and useDeferredValue? When would you use each?',
    card_back: 'useTransition wraps state updates (you call it). useDeferredValue wraps values (React handles it). Use useTransition when you control the update. Use useDeferredValue when you receive a value from parent.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `// useTransition: You control
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(value));

// useDeferredValue: React handles
const deferredQuery = useDeferredValue(query);`,
    memory_hook: 'Transition = you start it. Deferred = React defers it.',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    topic_id: '2',
    card_front: 'In Next.js PPR, what determines the boundary between static and dynamic content?',
    card_back: 'Suspense boundaries determine the split. Content outside Suspense is prerendered statically. Content inside Suspense with async components becomes dynamic.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `export const experimental_ppr = true;

export default function Page() {
  return (
    <>
      {/* Static: Prerendered at build */}
      <Header />
      
      {/* Dynamic: Rendered at request */}
      <Suspense fallback={<Skeleton />}>
        <AsyncData />
      </Suspense>
    </>
  );
}`,
    memory_hook: 'Suspense = the "fence" between static and dynamic in PPR.',
    created_at: new Date().toISOString(),
  },
];

// In-memory storage for demo mode
let cardProgress: Record<string, any> = {};

// Database functions
async function getTopicsDB(category?: string): Promise<Topic[]> {
  let sql = 'SELECT * FROM topics';
  const params: string[] = [];
  
  if (category && category !== 'all') {
    sql += ' WHERE category = $1';
    params.push(category);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  try {
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      // Database is empty, return sample data
      return getTopicsSample(category);
    }
    return result.rows as Topic[];
  } catch (e) {
    // Table doesn't exist or other error, return sample data
    return getTopicsSample(category);
  }
}

async function getTopicBySlugDB(slug: string): Promise<Topic | null> {
  try {
    const result = await query('SELECT * FROM topics WHERE slug = $1', [slug]);
    return result.rows[0] as Topic || null;
  } catch (e) {
    return null;
  }
}

async function getFlashcardsWithProgressDB(): Promise<FlashcardWithProgress[]> {
  try {
    const result = await query(`
      SELECT f.*, 
        json_build_object(
          'id', ucp.id,
          'card_id', ucp.card_id,
          'repetition', ucp.repetition,
          'interval_days', ucp.interval_days,
          'easiness_factor', ucp.easiness_factor,
          'last_reviewed_at', ucp.last_reviewed_at,
          'next_review_date', ucp.next_review_date,
          'total_reviews', ucp.total_reviews,
          'quality_history', ucp.quality_history,
          'created_at', ucp.created_at
        ) as progress
      FROM flashcards f
      LEFT JOIN user_card_progress ucp ON f.id = ucp.card_id
    `);
    if (result.rows.length === 0) {
      return getFlashcardsWithProgressSample();
    }
    return result.rows.map(row => ({
      ...row,
      progress: row.progress?.id ? row.progress : undefined,
    })) as FlashcardWithProgress[];
  } catch (e) {
    return getFlashcardsWithProgressSample();
  }
}

async function getDueFlashcardsDB(): Promise<FlashcardWithProgress[]> {
  try {
    const result = await query(`
      SELECT f.*, 
        json_build_object(
          'id', ucp.id,
          'card_id', ucp.card_id,
          'repetition', ucp.repetition,
          'interval_days', ucp.interval_days,
          'easiness_factor', ucp.easiness_factor,
          'last_reviewed_at', ucp.last_reviewed_at,
          'next_review_date', ucp.next_review_date,
          'total_reviews', ucp.total_reviews,
          'quality_history', ucp.quality_history,
          'created_at', ucp.created_at
        ) as progress
      FROM flashcards f
      JOIN user_card_progress ucp ON f.id = ucp.card_id
      WHERE ucp.next_review_date IS NULL 
         OR ucp.next_review_date <= CURRENT_DATE
      ORDER BY ucp.easiness_factor ASC
    `);
    if (result.rows.length === 0) {
      return getDueFlashcardsSample();
    }
    return result.rows.map(row => ({
      ...row,
      progress: row.progress?.id ? row.progress : undefined,
    })) as FlashcardWithProgress[];
  } catch (e) {
    return getDueFlashcardsSample();
  }
}

async function updateCardProgressDB(
  cardId: string,
  repetition: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): Promise<void> {
  await query(`
    UPDATE user_card_progress 
    SET 
      repetition = $1,
      interval_days = $2,
      easiness_factor = $3,
      last_reviewed_at = CURRENT_TIMESTAMP,
      next_review_date = CURRENT_DATE + INTERVAL '${intervalDays} days',
      total_reviews = total_reviews + 1,
      quality_history = array_append(quality_history, $4)
    WHERE card_id = $5
  `, [repetition, intervalDays, easinessFactor, quality, cardId]);
}

async function getStatsDB() {
  try {
    const topicsResult = await query('SELECT COUNT(*) as total FROM topics');
    const masteredResult = await query(`
      SELECT COUNT(*) as count FROM user_card_progress 
      WHERE interval_days >= 5
    `);
    const dueResult = await query(`
      SELECT COUNT(*) as count FROM user_card_progress 
      WHERE next_review_date IS NULL OR next_review_date <= CURRENT_DATE
    `);
    
    return {
      totalTopics: parseInt(topicsResult.rows[0].total),
      masteredCards: parseInt(masteredResult.rows[0].count),
      dueToday: parseInt(dueResult.rows[0].count),
    };
  } catch (e) {
    return getStatsSample();
  }
}

// Sample data functions
async function getTopicsSample(category?: string): Promise<Topic[]> {
  if (category && category !== 'all') {
    return sampleTopics.filter(t => t.category === category);
  }
  return sampleTopics;
}

async function getTopicBySlugSample(slug: string): Promise<Topic | null> {
  return sampleTopics.find(t => t.slug === slug) || null;
}

async function getFlashcardsWithProgressSample(): Promise<FlashcardWithProgress[]> {
  return sampleFlashcards.map(card => ({
    ...card,
    progress: cardProgress[card.id] || {
      id: `p${card.id}`,
      card_id: card.id,
      repetition: 0,
      interval_days: 1,
      easiness_factor: 2.5,
      last_reviewed_at: null,
      next_review_date: null,
      total_reviews: 0,
      quality_history: [],
      created_at: new Date().toISOString(),
    },
  }));
}

async function getDueFlashcardsSample(): Promise<FlashcardWithProgress[]> {
  const cards = await getFlashcardsWithProgressSample();
  return cards.filter(c => {
    if (!c.progress?.next_review_date) return true;
    return c.progress.next_review_date <= new Date().toISOString().split('T')[0];
  });
}

async function updateCardProgressSample(
  cardId: string,
  repetition: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): Promise<void> {
  const existing = cardProgress[cardId] || {
    id: `p${cardId}`,
    card_id: cardId,
    repetition: 0,
    interval_days: 1,
    easiness_factor: 2.5,
    last_reviewed_at: null,
    next_review_date: null,
    total_reviews: 0,
    quality_history: [],
    created_at: new Date().toISOString(),
  };

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  cardProgress[cardId] = {
    ...existing,
    repetition,
    interval_days: intervalDays,
    easiness_factor: easinessFactor,
    last_reviewed_at: new Date().toISOString(),
    next_review_date: nextDate.toISOString().split('T')[0],
    total_reviews: existing.total_reviews + 1,
    quality_history: [...existing.quality_history, quality],
  };
}

async function getStatsSample() {
  return {
    totalTopics: sampleTopics.length,
    masteredCards: Object.values(cardProgress).filter((p: any) => p.interval_days >= 5).length,
    dueToday: (await getDueFlashcardsSample()).length,
  };
}

// Export functions that choose between DB and sample
export async function getTopics(category?: string): Promise<Topic[]> {
  if (isDatabaseConfigured()) {
    try {
      return await getTopicsDB(category);
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return getTopicsSample(category);
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  if (isDatabaseConfigured()) {
    try {
      return await getTopicBySlugDB(slug);
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return getTopicBySlugSample(slug);
}

export async function getFlashcardsWithProgress(): Promise<FlashcardWithProgress[]> {
  if (isDatabaseConfigured()) {
    try {
      return await getFlashcardsWithProgressDB();
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return getFlashcardsWithProgressSample();
}

export async function getDueFlashcards(): Promise<FlashcardWithProgress[]> {
  if (isDatabaseConfigured()) {
    try {
      return await getDueFlashcardsDB();
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return getDueFlashcardsSample();
}

export async function updateCardProgress(
  cardId: string,
  repetition: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      return await updateCardProgressDB(cardId, repetition, intervalDays, easinessFactor, quality);
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return updateCardProgressSample(cardId, repetition, intervalDays, easinessFactor, quality);
}

export async function getStats() {
  if (isDatabaseConfigured()) {
    try {
      return await getStatsDB();
    } catch (e) {
      console.warn('DB error, using sample data:', e);
    }
  }
  return getStatsSample();
}

export async function getCategoryDistribution() {
  const distribution: Record<string, number> = {};
  sampleTopics.forEach(t => {
    distribution[t.category] = (distribution[t.category] || 0) + 1;
  });
  return distribution;
}

export async function insertTopic(topic: Partial<Topic>): Promise<Topic> {
  const newTopic = { ...topic, id: String(sampleTopics.length + 1) } as Topic;
  sampleTopics.push(newTopic);
  return newTopic;
}

export async function insertFlashcard(flashcard: Partial<Flashcard>): Promise<void> {
  // No-op for demo mode
}
