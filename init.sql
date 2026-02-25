-- DevLens Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Category enum
CREATE TYPE category_enum AS ENUM (
  'react-hooks',
  'nextjs-core', 
  'third-party-api',
  'server-side',
  'advanced',
  'ai-integration'
);

-- Difficulty enum
CREATE TYPE card_difficulty_enum AS ENUM ('easy', 'medium', 'hard');

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category category_enum NOT NULL,
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),
  plain_english_summary text,
  when_to_use text,
  when_not_to_use text,
  code_snippet text,
  code_explanation text,
  real_world_example text,
  gotchas jsonb DEFAULT '[]',
  related_topic_ids uuid[],
  source_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  card_front text NOT NULL,
  card_back text NOT NULL,
  difficulty card_difficulty_enum DEFAULT 'medium',
  has_code_snippet boolean DEFAULT false,
  code_snippet text,
  memory_hook text,
  created_at timestamptz DEFAULT now()
);

-- User card progress table (simplified - single user)
CREATE TABLE IF NOT EXISTS user_card_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id uuid REFERENCES flashcards(id) ON DELETE CASCADE,
  repetition int DEFAULT 0,
  interval_days int DEFAULT 1,
  easiness_factor float DEFAULT 2.5,
  last_reviewed_at timestamptz,
  next_review_date date,
  total_reviews int DEFAULT 0,
  quality_history int[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(card_id)
);

-- Topic visits tracking
CREATE TABLE IF NOT EXISTS topic_visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  time_spent_seconds int,
  UNIQUE(topic_id)
);

-- Create indexes
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_difficulty ON topics(difficulty);
CREATE INDEX idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX idx_user_card_progress_next_review ON user_card_progress(next_review_date);
CREATE INDEX idx_user_card_progress_card_id ON user_card_progress(card_id);

-- Insert sample topics
INSERT INTO topics (title, slug, category, difficulty, plain_english_summary, when_to_use, when_not_to_use, code_snippet, code_explanation, real_world_example, gotchas) VALUES
('useTransition: Non-Urgent State Updates', 'use-transition', 'react-hooks', 4, 'A hook that lets you mark state updates as non-urgent, keeping the UI responsive during heavy computations.', 'Use when you have expensive state updates that cause UI lag. Examples: filtering large datasets, sorting complex lists, updating charts.', 'Do not use for urgent updates like controlled text inputs, button hover states, or animation triggers.', 'const [isPending, startTransition] = useTransition();

function handleClick() {
  startTransition(() => {
    setExpensiveState(newValue);
  });
}', 'useTransition returns isPending (boolean) and startTransition (function). Wrap expensive state updates in startTransition to mark them as non-urgent.', 'Filtering a dashboard with 10,000+ rows while keeping the search input responsive.', '["Cannot use for controlled inputs - cursor will jump", "May still show stale UI briefly if interrupted", "Only works with state updates, not side effects"]'),

('Partial Prerendering (PPR)', 'partial-prerendering', 'nextjs-core', 4, 'Next.js feature that combines static and dynamic content in the same page for optimal performance.', 'When you want fast static shells with dynamic data. E-commerce product pages, dashboards with static layout.', 'For fully static or fully dynamic pages where PPR overhead is not needed.', 'export const experimental_ppr = true;

export default async function Page() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </>
  );
}', 'Suspense boundaries define the split. Content outside is prerendered statically. Content inside with async components becomes dynamic.', 'E-commerce product pages with static layout, dynamic inventory and pricing.', '["Requires Suspense boundaries", "Experimental feature - API may change", "Not compatible with all Next.js features"]'),

('Server Actions with Optimistic UI', 'server-actions-optimistic', 'server-side', 4, 'Use useOptimistic hook with Server Actions for instant UI feedback before server confirms.', 'Forms, likes, comments where instant feedback matters and improves perceived performance.', 'When precise server state is required immediately or conflicts are likely.', ''use client'';

const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (state, newItem) => [...state, newItem]
);

async function handleSubmit(formData) {
  addOptimistic({ id: ''temp'', content });
  await addItem(formData);
}', 'addOptimistic updates UI immediately. The update function merges optimistic data with current state. Server confirmation replaces it.', 'Social media like buttons, comment sections, shopping cart updates.', '["Handle error cases with rollback", "May show incorrect data briefly", "Requires careful state management"]'),

('Vercel AI SDK Streaming', 'vercel-ai-streaming', 'ai-integration', 3, 'Stream AI responses in real-time using the Vercel AI SDK for chat-like experiences.', 'Chatbots, content generation, any AI feature needing real-time feel.', 'Simple one-shot AI calls where streaming adds no value.', 'const { messages, input, handleInputChange, handleSubmit } = useChat();

return (
  <form onSubmit={handleSubmit}>
    <input value={input} onChange={handleInputChange} />
    {messages.map(m => <div key={m.id}>{m.content}</div>)}
  </form>
);', 'useChat hook handles streaming, state management, and error handling automatically.', 'ChatGPT-like interfaces, streaming code completion, real-time content generation.', '["Handle streaming errors gracefully", "Configure proper API routes", "Consider rate limiting"]'),

('Turborepo Shared Packages', 'turborepo-shared-packages', 'advanced', 5, 'Create shared UI packages in Turborepo for multiple Next.js apps.', 'Monorepos with multiple apps needing shared components and design systems.', 'Single app projects where Turborepo adds unnecessary complexity.', '// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx"
  }
}', 'Named exports allow importing specific components. Configure TypeScript project references for proper type checking.', 'Design systems shared across web and mobile apps, multi-brand platforms.', '["Configure TypeScript project references", "Set up proper build pipeline", "Handle versioning carefully"]'),

('Stripe Webhooks in App Router', 'stripe-webhooks', 'third-party-api', 3, 'Handle Stripe webhooks in Next.js App Router with proper signature verification.', 'Processing payments, subscriptions, and invoice events securely.', 'Client-side only payment flows where webhooks are not needed.', 'export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get(''stripe-signature'');
  
  const event = stripe.webhooks.constructEvent(
    payload, signature, webhookSecret
  );
  
  // Handle event
}', 'Use req.text() to get raw body for signature verification. JSON parsing breaks signature validation.', 'Processing subscription renewals, payment failures, invoice generation.', '["Must use raw body, not JSON", "Webhook secret must be secure", "Handle webhook retries idempotently"]')
ON CONFLICT (slug) DO NOTHING;

-- Insert flashcards for useTransition
INSERT INTO flashcards (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook)
SELECT 
  t.id,
  'You have a child component re-rendering every time its parent renders. You memoized the child with React.memo. It still re-renders. What''s the likely cause and fix?',
  'The child is receiving a new function or object reference on every parent render. Even though React.memo shallow-compares props, new references fail the comparison. Use useCallback for functions and useMemo for objects.',
  'hard',
  true,
  '// Bad: New reference every render
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
}',
  'React.memo does shallow comparison. New references = new props = re-render.'
FROM topics t WHERE t.slug = 'use-transition'
ON CONFLICT DO NOTHING;

INSERT INTO flashcards (topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook)
SELECT 
  t.id,
  'What''s the difference between useTransition and useDeferredValue? When would you use each?',
  'useTransition wraps state updates (you call it). useDeferredValue wraps values (React handles it). Use useTransition when you control the update. Use useDeferredValue when you receive a value from parent.',
  'medium',
  true,
  '// useTransition: You control
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(value));

// useDeferredValue: React handles
const deferredQuery = useDeferredValue(query);',
  'Transition = you start it. Deferred = React defers it.'
FROM topics t WHERE t.slug = 'use-transition'
ON CONFLICT DO NOTHING;

-- Initialize user progress for all flashcards
INSERT INTO user_card_progress (card_id, repetition, interval_days, easiness_factor)
SELECT id, 0, 1, 2.5 FROM flashcards
ON CONFLICT (card_id) DO NOTHING;
