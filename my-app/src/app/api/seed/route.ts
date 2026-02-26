import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

const sampleTopics = [
  {
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
    code_explanation: 'useTransition returns isPending (boolean) and startTransition (function). Wrap expensive state updates in startTransition to mark them as non-urgent.',
    real_world_example: 'Filtering a dashboard with 10,000+ rows while keeping the search input responsive.',
    gotchas: ["Cannot use for controlled inputs - cursor will jump", "May still show stale UI briefly if interrupted", "Only works with state updates, not side effects"],
  },
  {
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
    gotchas: ["Requires Suspense boundaries", "Experimental feature - API may change", "Not compatible with all Next.js features"],
  },
  {
    title: 'Server Actions with Optimistic UI',
    slug: 'server-actions-optimistic',
    category: 'server-side',
    difficulty: 4,
    plain_english_summary: 'Use useOptimistic hook with Server Actions for instant UI feedback before server confirms.',
    when_to_use: 'Forms, likes, comments where instant feedback matters and improves perceived performance.',
    when_not_to_use: 'When precise server state is required immediately or conflicts are likely.',
    code_snippet: `"use client";

const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (state, newItem) => [...state, newItem]
);

async function handleSubmit(formData) {
  addOptimistic({ id: "temp", content });
  await addItem(formData);
}`,
    code_explanation: 'addOptimistic updates UI immediately. The update function merges optimistic data with current state. Server confirmation replaces it.',
    real_world_example: 'Social media like buttons, comment sections, shopping cart updates.',
    gotchas: ["Handle error cases with rollback", "May show incorrect data briefly", "Requires careful state management"],
  },
  {
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
    gotchas: ["Handle streaming errors gracefully", "Configure proper API routes", "Consider rate limiting"],
  },
  {
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
    gotchas: ["Configure TypeScript project references", "Set up proper build pipeline", "Handle versioning carefully"],
  },
  {
    title: 'Stripe Webhooks in App Router',
    slug: 'stripe-webhooks',
    category: 'third-party-api',
    difficulty: 3,
    plain_english_summary: 'Handle Stripe webhooks in Next.js App Router with proper signature verification.',
    when_to_use: 'Processing payments, subscriptions, and invoice events securely.',
    when_not_to_use: 'Client-side only payment flows where webhooks are not needed.',
    code_snippet: `export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get("stripe-signature");
  
  const event = stripe.webhooks.constructEvent(
    payload, signature, webhookSecret
  );
  
  // Handle event
}`,
    code_explanation: 'Use req.text() to get raw body for signature verification. JSON parsing breaks signature validation.',
    real_world_example: 'Processing subscription renewals, payment failures, invoice generation.',
    gotchas: ["Must use raw body, not JSON", "Webhook secret must be secure", "Handle webhook retries idempotently"],
  },
];

const sampleFlashcards = [
  {
    topic_slug: 'use-transition',
    card_front: "You have a child component re-rendering every time its parent renders. You memoized the child with React.memo. It still re-renders. What's the likely cause and fix?",
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
  },
  {
    topic_slug: 'use-transition',
    card_front: "What's the difference between useTransition and useDeferredValue? When would you use each?",
    card_back: 'useTransition wraps state updates (you call it). useDeferredValue wraps values (React handles it). Use useTransition when you control the update. Use useDeferredValue when you receive a value from parent.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `// useTransition: You control
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(value));

// useDeferredValue: React handles
const deferredQuery = useDeferredValue(query);`,
    memory_hook: 'Transition = you start it. Deferred = React defers it.',
  },
];

/**
 * Seed endpoint to populate database with sample data
 * POST /api/seed - Insert sample topics and flashcards
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Check if data already exists
    const existingTopics = await query('SELECT COUNT(*) as count FROM new_topic');
    const existingCount = parseInt(existingTopics.rows[0].count);

    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        topics_count: existingCount,
      });
    }

    // Insert topics using parameterized queries
    const insertedTopics = [];
    for (const topic of sampleTopics) {
      const result = await query(
        `INSERT INTO new_topic (title, slug, category, difficulty, plain_english_summary, when_to_use, when_not_to_use, code_snippet, code_explanation, real_world_example, gotchas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id, slug`,
        [
          topic.title,
          topic.slug,
          topic.category,
          topic.difficulty,
          topic.plain_english_summary,
          topic.when_to_use,
          topic.when_not_to_use,
          topic.code_snippet,
          topic.code_explanation,
          topic.real_world_example,
          JSON.stringify(topic.gotchas),
        ]
      );
      if (result.rows[0]) {
        insertedTopics.push(result.rows[0]);
      }
    }

    // Insert flashcards
    let flashcardsInserted = 0;
    for (const card of sampleFlashcards) {
      const topicResult = await query('SELECT id FROM new_topic WHERE slug = $1', [card.topic_slug]);
      if (topicResult.rows[0]) {
        await query(
          `INSERT INTO flashcard (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            topicResult.rows[0].id,
            card.card_front,
            card.card_back,
            card.difficulty,
            card.has_code_snippet,
            card.code_snippet,
            card.memory_hook,
          ]
        );
        flashcardsInserted++;
      }
    }

    // Initialize user progress for all flashcards
    await query(`
      INSERT INTO user_card_progress (card_id, repetition, interval_days, easiness_factor)
      SELECT id, 0, 1, 2.5 FROM flashcards
      ON CONFLICT (card_id) DO NOTHING
    `);

    // Get final counts
    const finalTopics = await query('SELECT COUNT(*) as count FROM new_topic');
    const finalFlashcards = await query('SELECT COUNT(*) as count FROM flashcard');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      topics_inserted: insertedTopics.length,
      total_topics: parseInt(finalTopics.rows[0].count),
      total_flashcards: parseInt(finalFlashcards.rows[0].count),
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: error.message },
      { status: 500 }
    );
  }
}