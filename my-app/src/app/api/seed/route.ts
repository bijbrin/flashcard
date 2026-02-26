import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

/**
 * Seed endpoint to populate database with sample data
 * POST /api/seed - Insert sample topics and flashcards
 */
export async function POST(request: Request) {
  // Verify authorization
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
    const existingTopics = await query('SELECT COUNT(*) as count FROM topics');
    const existingCount = parseInt(existingTopics.rows[0].count);

    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        topics_count: existingCount,
      });
    }

    // Insert sample topics
    const topicsResult = await query(`
      INSERT INTO topics (title, slug, category, difficulty, plain_english_summary, when_to_use, when_not_to_use, code_snippet, code_explanation, real_world_example, gotchas) VALUES
      ('useTransition: Non-Urgent State Updates', 'use-transition', 'react-hooks', 4, 'A hook that lets you mark state updates as non-urgent, keeping the UI responsive during heavy computations.', 'Use when you have expensive state updates that cause UI lag. Examples: filtering large datasets, sorting complex lists, updating charts.', 'Do not use for urgent updates like controlled text inputs, button hover states, or animation triggers.', 'const [isPending, startTransition] = useTransition();\n\nfunction handleClick() {\n  startTransition(() => {\n    setExpensiveState(newValue);\n  });\n}', 'useTransition returns isPending (boolean) and startTransition (function). Wrap expensive state updates in startTransition to mark them as non-urgent.', 'Filtering a dashboard with 10,000+ rows while keeping the search input responsive.', '["Cannot use for controlled inputs - cursor will jump", "May still show stale UI briefly if interrupted", "Only works with state updates, not side effects"]'),
      ('Partial Prerendering (PPR)', 'partial-prerendering', 'nextjs-core', 4, 'Next.js feature that combines static and dynamic content in the same page for optimal performance.', 'When you want fast static shells with dynamic data. E-commerce product pages, dashboards with static layout.', 'For fully static or fully dynamic pages where PPR overhead is not needed.', 'export const experimental_ppr = true;\n\nexport default async function Page() {\n  return (\n    <>\n      <StaticHeader />\n      <Suspense fallback={<Skeleton />}>\n        <DynamicContent />\n      </Suspense>\n    </>\n  );\n}', 'Suspense boundaries define the split. Content outside is prerendered statically. Content inside with async components becomes dynamic.', 'E-commerce product pages with static layout, dynamic inventory and pricing.', '["Requires Suspense boundaries", "Experimental feature - API may change", "Not compatible with all Next.js features"]'),
      ('Server Actions with Optimistic UI', 'server-actions-optimistic', 'server-side', 4, 'Use useOptimistic hook with Server Actions for instant UI feedback before server confirms.', 'Forms, likes, comments where instant feedback matters and improves perceived performance.', 'When precise server state is required immediately or conflicts are likely.', '\'use client\';\n\nconst [optimisticState, addOptimistic] = useOptimistic(\n  state,\n  (state, newItem) => [...state, newItem]\n);\n\nasync function handleSubmit(formData) {\n  addOptimistic({ id: \'temp\', content });\n  await addItem(formData);\n}', 'addOptimistic updates UI immediately. The update function merges optimistic data with current state. Server confirmation replaces it.', 'Social media like buttons, comment sections, shopping cart updates.', '["Handle error cases with rollback", "May show incorrect data briefly", "Requires careful state management"]'),
      ('Vercel AI SDK Streaming', 'vercel-ai-streaming', 'ai-integration', 3, 'Stream AI responses in real-time using the Vercel AI SDK for chat-like experiences.', 'Chatbots, content generation, any AI feature needing real-time feel.', 'Simple one-shot AI calls where streaming adds no value.', 'const { messages, input, handleInputChange, handleSubmit } = useChat();\n\nreturn (\n  <form onSubmit={handleSubmit}>\n    <input value={input} onChange={handleInputChange} />\n    {messages.map(m => <div key={m.id}>{m.content}</div>)}\n  </form>\n);', 'useChat hook handles streaming, state management, and error handling automatically.', 'ChatGPT-like interfaces, streaming code completion, real-time content generation.', '["Handle streaming errors gracefully", "Configure proper API routes", "Consider rate limiting"]'),
      ('Turborepo Shared Packages', 'turborepo-shared-packages', 'advanced', 5, 'Create shared UI packages in Turborepo for multiple Next.js apps.', 'Monorepos with multiple apps needing shared components and design systems.', 'Single app projects where Turborepo adds unnecessary complexity.', '// packages/ui/package.json\n{\n  "name": "@repo/ui",\n  "exports": {\n    ".": "./src/index.ts",\n    "./button": "./src/button.tsx"\n  }\n}', 'Named exports allow importing specific components. Configure TypeScript project references for proper type checking.', 'Design systems shared across web and mobile apps, multi-brand platforms.', '["Configure TypeScript project references", "Set up proper build pipeline", "Handle versioning carefully"]'),
      ('Stripe Webhooks in App Router', 'stripe-webhooks', 'third-party-api', 3, 'Handle Stripe webhooks in Next.js App Router with proper signature verification.', 'Processing payments, subscriptions, and invoice events securely.', 'Client-side only payment flows where webhooks are not needed.', 'export async function POST(req: Request) {\n  const payload = await req.text();\n  const signature = headers().get(\'stripe-signature\');\n  \n  const event = stripe.webhooks.constructEvent(\n    payload, signature, webhookSecret\n  );\n  \n  // Handle event\n}', 'Use req.text() to get raw body for signature verification. JSON parsing breaks signature validation.', 'Processing subscription renewals, payment failures, invoice generation.', '["Must use raw body, not JSON", "Webhook secret must be secure", "Handle webhook retries idempotently"]')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `);

    const insertedTopics = topicsResult.rows;

    // Insert flashcards for useTransition
    await query(`
      INSERT INTO flashcards (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook)
      SELECT 
        t.id,
        'You have a child component re-rendering every time its parent renders. You memoized the child with React.memo. It still re-renders. What''s the likely cause and fix?',
        'The child is receiving a new function or object reference on every parent render. Even though React.memo shallow-compares props, new references fail the comparison. Use useCallback for functions and useMemo for objects.',
        'hard',
        true,
        '// Bad: New reference every render\nfunction Parent() {\n  const handleClick = () => setCount(c => c + 1);\n  return <Child onClick={handleClick} />;\n}\n\n// Good: Memoized callback\nfunction Parent() {\n  const handleClick = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n  return <Child onClick={handleClick} />;\n}',
        'React.memo does shallow comparison. New references = new props = re-render.'
      FROM topics t WHERE t.slug = 'use-transition'
      ON CONFLICT DO NOTHING
    `);

    await query(`
      INSERT INTO flashcards (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook)
      SELECT 
        t.id,
        'What''s the difference between useTransition and useDeferredValue? When would you use each?',
        'useTransition wraps state updates (you call it). useDeferredValue wraps values (React handles it). Use useTransition when you control the update. Use useDeferredValue when you receive a value from parent.',
        'medium',
        true,
        '// useTransition: You control\nconst [isPending, startTransition] = useTransition();\nstartTransition(() => setExpensiveState(value));\n\n// useDeferredValue: React handles\nconst deferredQuery = useDeferredValue(query);',
        'Transition = you start it. Deferred = React defers it.'
      FROM topics t WHERE t.slug = 'use-transition'
      ON CONFLICT DO NOTHING
    `);

    // Initialize user progress for all flashcards
    await query(`
      INSERT INTO user_card_progress (card_id, repetition, interval_days, easiness_factor)
      SELECT id, 0, 1, 2.5 FROM flashcards
      ON CONFLICT (card_id) DO NOTHING
    `);

    // Get final counts
    const finalTopics = await query('SELECT COUNT(*) as count FROM topics');
    const finalFlashcards = await query('SELECT COUNT(*) as count FROM flashcards');

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