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
  {
    topic_slug: 'partial-prerendering',
    card_front: "What is Partial Prerendering (PPR) and when should you use it?",
    card_back: 'PPR combines static and dynamic content in the same page. Static parts prerender at build time, dynamic parts render at request time. Use for pages with mostly static content but some dynamic data like e-commerce product pages.',
    difficulty: 'medium',
    has_code_snippet: true,
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
    memory_hook: 'PPR = Static shell + Dynamic islands',
  },
  {
    topic_slug: 'partial-prerendering',
    card_front: "What are the requirements for using PPR in Next.js?",
    card_back: '1. Enable experimental_ppr flag. 2. Use Suspense boundaries to define static vs dynamic splits. 3. Dynamic content must be inside async components or Suspense. 4. Not compatible with all Next.js features.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Suspense boundaries define the split between static and dynamic.',
  },
  {
    topic_slug: 'server-actions-optimistic',
    card_front: "How does useOptimistic work with Server Actions?",
    card_back: 'useOptimistic provides instant UI feedback before server confirms. You call addOptimistic with the expected result, UI updates immediately, then server response replaces it. Handle errors with rollback.',
    difficulty: 'hard',
    has_code_snippet: true,
    code_snippet: `const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (state, newItem) => [...state, newItem]
);

async function handleSubmit(formData) {
  addOptimistic({ id: "temp", content });
  await addItem(formData);
}`,
    memory_hook: 'Optimistic = Hope for the best, prepare for rollback.',
  },
  {
    topic_slug: 'server-actions-optimistic',
    card_front: "When should you NOT use optimistic UI?",
    card_back: 'Avoid optimistic UI when: 1. Precise server state is required immediately. 2. High chance of conflicts. 3. Financial transactions where accuracy is critical. 4. When rollback would be confusing to users.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Optimistic UI = good for likes, bad for bank transfers.',
  },
  {
    topic_slug: 'vercel-ai-streaming',
    card_front: "What does the useChat hook from Vercel AI SDK handle automatically?",
    card_back: 'useChat handles: message state management, streaming responses, input handling, form submission, error states, and loading states. You just render the messages and wire up the input.',
    difficulty: 'easy',
    has_code_snippet: true,
    code_snippet: `const { messages, input, handleInputChange, handleSubmit } = useChat();

return (
  <form onSubmit={handleSubmit}>
    <input value={input} onChange={handleInputChange} />
    {messages.map(m => <div key={m.id}>{m.content}</div>)}
  </form>
);`,
    memory_hook: 'useChat = All chat boilerplate handled for you.',
  },
  {
    topic_slug: 'vercel-ai-streaming',
    card_front: "When should you avoid streaming AI responses?",
    card_back: 'Avoid streaming when: 1. Response is short and instant anyway. 2. You need the full response for processing. 3. Token usage tracking per request. 4. Simple one-shot calls where UX gain is minimal.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Streaming = UX win for chat, overhead for simple calls.',
  },
  {
    topic_slug: 'turborepo-shared-packages',
    card_front: "How do you share UI components across apps in Turborepo?",
    card_back: 'Create a shared package in packages/ directory with proper exports. Use named exports for tree-shaking. Configure TypeScript project references. Import in apps using workspace protocol.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx"
  }
}

// apps/web/app/page.tsx
import { Button } from "@repo/ui/button";`,
    memory_hook: 'Named exports = tree-shaking friendly imports.',
  },
  {
    topic_slug: 'turborepo-shared-packages',
    card_front: "What are common pitfalls when setting up Turborepo shared packages?",
    card_back: '1. Not configuring TypeScript project references. 2. Missing build pipeline for packages. 3. Version mismatches between apps. 4. Circular dependencies. 5. Not setting up proper exports field.',
    difficulty: 'hard',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'TS config, build pipeline, versions = the big three.',
  },
  {
    topic_slug: 'stripe-webhooks',
    card_front: "Why must you use req.text() instead of req.json() for Stripe webhooks?",
    card_back: 'Stripe signature verification requires the exact raw body bytes. JSON parsing modifies the body (whitespace, encoding), breaking signature validation. Always use req.text() for webhooks.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `export async function POST(req: Request) {
  const payload = await req.text(); // NOT req.json()
  const signature = headers().get("stripe-signature");
  
  const event = stripe.webhooks.constructEvent(
    payload, signature, webhookSecret
  );
}`,
    memory_hook: 'Raw body = signature intact. JSON parsing = broken signature.',
  },
  {
    topic_slug: 'stripe-webhooks',
    card_front: "How should you handle webhook retries idempotently?",
    card_back: 'Store processed event IDs and check before processing. Use database transactions. Return 200 for processed events to stop retries. Handle the same event multiple times safely.',
    difficulty: 'hard',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Idempotency = same result whether called once or many times.',
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
    // Check existing topics and flashcards
    const existingTopics = await query('SELECT COUNT(*) as count FROM topics');
    const existingFlashcards = await query('SELECT COUNT(*) as count FROM flashcards');
    const topicsCount = parseInt(existingTopics.rows[0].count);
    const flashcardsCount = parseInt(existingFlashcards.rows[0].count);

    let insertedTopics = [];
    let flashcardsInserted = 0;

    // Insert topics only if none exist
    if (topicsCount === 0) {
      for (const topic of sampleTopics) {
        const result = await query(
          `INSERT INTO topics (title, slug, category, difficulty, plain_english_summary, when_to_use, when_not_to_use, code_snippet, code_explanation, real_world_example, gotchas, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
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
    }

    // Insert flashcards if none exist
    if (flashcardsCount === 0) {
      for (const card of sampleFlashcards) {
        const topicResult = await query('SELECT id FROM topics WHERE slug = $1', [card.topic_slug]);
        if (topicResult.rows[0]) {
          await query(
            `INSERT INTO flashcards (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
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
        INSERT INTO user_card_progress (card_id, repetition, interval_days, easiness_factor, created_at)
        SELECT id, 0, 1, 2.5, NOW() FROM flashcards
        ON CONFLICT (card_id) DO NOTHING
      `);
    }

    // Get final counts
    const finalTopics = await query('SELECT COUNT(*) as count FROM topics');
    const finalFlashcards = await query('SELECT COUNT(*) as count FROM flashcards');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      topics_inserted: insertedTopics.length,
      flashcards_inserted: flashcardsInserted,
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