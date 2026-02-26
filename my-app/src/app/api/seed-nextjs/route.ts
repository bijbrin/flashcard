import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

// 24 Topics covering NextJS 16 + TailwindCSS v4 complete skill reference
const nextjsTopics = [
  {
    title: 'NextJS 16 Foundation: Turbopack & Cache Components',
    slug: 'nextjs-16-foundation',
    category: 'nextjs-core',
    difficulty: 3,
    plain_english_summary: 'NextJS 16 brings Turbopack as the default bundler for 2-5× faster builds and introduces "use cache" directive for explicit component-level caching.',
    when_to_use: 'Use Turbopack for all new NextJS 16 projects. Use "use cache" when you need fine-grained control over what gets cached and for how long.',
    when_not_to_use: 'Avoid "use cache" for highly dynamic data that changes frequently or user-specific content that should not be shared.',
    code_snippet: `// app/page.tsx - Cache Component example
'use cache';
import { cacheTag } from 'next/cache';

export async function ProductList({ category }) {
  cacheTag(\`products-\${category}\`);
  const products = await db.products.findMany({ where: { category } });
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}`,
    code_explanation: 'The "use cache" directive marks this component as cacheable. cacheTag() allows targeted revalidation. The component caches the database query result.',
    real_world_example: 'An e-commerce product catalog where product listings are cached but can be revalidated when inventory changes.',
    gotchas: ['Turbopack requires Node 20+', 'Cache Components are experimental', 'cacheTag requires careful naming to avoid collisions', 'Cached components must be async functions'],
  },
  {
    title: 'Server Components vs Client Components',
    slug: 'server-vs-client-components',
    category: 'nextjs-core',
    difficulty: 4,
    plain_english_summary: 'Server Components render on the server and send zero JavaScript to the client. Client Components hydrate in the browser and can use hooks and browser APIs.',
    when_to_use: 'Default to Server Components. Use Client Components only for interactivity, browser APIs, or hooks.',
    when_not_to_use: 'Do not use Client Components for static content, data fetching that can happen server-side, or SEO-critical content.',
    code_snippet: `// Server Component (default)
export default async function ProductPage() {
  const products = await db.products.findMany();
  return products.map(p => (
    <article key={p.id}>
      <h2>{p.title}</h2>
      <AddToCartButton productId={p.id} />
    </article>
  ));
}

// Client Component
'use client';
function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  return <button onClick={() => addToCart(productId)}>Add to Cart</button>;
}`,
    code_explanation: 'ProductPage is a Server Component that fetches data directly. AddToCartButton is a Client Component that handles user interaction with useState.',
    real_world_example: 'A blog where posts are rendered server-side for SEO, but the like/comment buttons are client components for interactivity.',
    gotchas: ['Cannot use hooks in Server Components', 'Server Components cannot access browser APIs', 'Client Components increase bundle size', 'Mixing patterns incorrectly causes build errors'],
  },
  {
    title: 'useTransition: Non-Urgent State Updates',
    slug: 'use-transition',
    category: 'react-hooks',
    difficulty: 4,
    plain_english_summary: 'useTransition marks state updates as non-urgent, keeping the UI responsive during expensive computations by showing a pending state.',
    when_to_use: 'Use for expensive filtering, sorting large datasets, or any state update that causes UI lag. Ideal for search inputs that filter large lists.',
    when_not_to_use: 'Do not use for urgent updates like controlled text inputs, button hover states, or animation triggers where immediate feedback is critical.',
    code_snippet: `const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const [filtered, setFiltered] = useState(products);

const handleSearch = (value) => {
  setQuery(value); // Urgent - update input immediately
  startTransition(() => {
    setFiltered(filterProducts(value)); // Non-urgent - can be deferred
  });
};

return (
  <>
    <input value={query} onChange={e => handleSearch(e.target.value)} />
    {isPending && <Spinner />}
    <ProductList products={filtered} />
  </>
);`,
    code_explanation: 'The input updates immediately (urgent). The expensive filtering happens in a transition (non-urgent). isPending shows loading state during transition.',
    real_world_example: 'A dashboard with 10,000+ rows where the search input stays responsive while filtering happens in the background.',
    gotchas: ['Cannot use for controlled inputs - cursor will jump', 'May still show stale UI briefly if interrupted', 'Only works with state updates, not side effects', 'isPending only true during active transition'],
  },
  {
    title: 'useOptimistic: Instant UI Feedback',
    slug: 'use-optimistic',
    category: 'react-hooks',
    difficulty: 4,
    plain_english_summary: 'useOptimistic shows immediate UI updates while async operations are in progress, improving perceived performance.',
    when_to_use: 'Use for likes, comments, form submissions, shopping cart updates - any action where instant feedback improves UX.',
    when_not_to_use: 'Avoid for financial transactions, critical data where accuracy is paramount, or when rollback would confuse users.',
    code_snippet: `const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (state, newMessage) => [...state, { text: newMessage, sending: true }]
);

async function sendMessage(formData) {
  const text = formData.get('message');
  addOptimisticMessage(text); // Show immediately
  await api.sendMessage(text); // Then confirm with server
}

return (
  <ul>
    {optimisticMessages.map(msg => (
      <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
        {msg.text}
      </li>
    ))}
  </ul>
);`,
    code_explanation: 'addOptimisticMessage updates UI immediately. The optimistic item has sending: true for visual feedback. Server confirmation replaces it with real data.',
    real_world_example: 'Social media like buttons that show the like immediately, even before the API confirms, with rollback on error.',
    gotchas: ['Must handle error cases with rollback', 'May show incorrect data briefly', 'Requires careful state management', 'Not for critical financial operations'],
  },
  {
    title: 'Server Actions: Form Handling Without API Routes',
    slug: 'server-actions-forms',
    category: 'server-side',
    difficulty: 3,
    plain_english_summary: 'Server Actions let you call async server functions directly from forms and buttons, eliminating the need for separate API routes.',
    when_to_use: 'Use for form submissions, mutations, any server-side operation triggered by user interaction. Great for progressive enhancement.',
    when_not_to_use: 'Do not use for data fetching (use Server Components), file uploads (use Route Handlers), or when you need complex HTTP semantics.',
    code_snippet: `// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const post = await db.posts.create({ data: { title } });
  revalidatePath('/blog');
  redirect(\`/blog/\${post.slug}\`);
}

// app/blog/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create Post</button>
    </form>
  );
}`,
    code_explanation: 'The form action directly calls the Server Action. No fetch(), no useState(), no event handlers needed. Works without JavaScript for progressive enhancement.',
    real_world_example: 'A contact form that submits directly to a Server Action which validates, saves to database, and sends email - all in one function.',
    gotchas: ['Must be async functions', 'Cannot be called from Server Components', 'Error handling requires useFormState', 'Limited to POST semantics'],
  },
  {
    title: 'TanStack Query: Server State Management',
    slug: 'tanstack-query',
    category: 'advanced',
    difficulty: 4,
    plain_english_summary: 'TanStack Query manages server state with caching, synchronization, background updates, and optimistic updates built-in.',
    when_to_use: 'Use for all server state: data fetching, mutations, infinite scrolling, real-time updates. Replaces useEffect + fetch patterns.',
    when_not_to_use: 'Overkill for simple static data or client-only state. Use Zustand/Jotai for client state instead.',
    code_snippet: `// hooks/use-todos.ts
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todo) => fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todo)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
}

// Usage
const { data, isLoading } = useTodos();
const mutation = useCreateTodo();
mutation.mutate({ title: 'New Todo' });`,
    code_explanation: 'useQuery handles caching, refetching, and loading states. useMutation handles mutations with automatic cache invalidation on success.',
    real_world_example: 'A project management tool where tasks update in real-time across all users, with optimistic updates and background sync.',
    gotchas: ['Requires QueryClientProvider at app root', 'queryKey must be unique and stable', 'staleTime vs cacheTime confusion', 'DevTools essential for debugging'],
  },
  {
    title: 'TailwindCSS v4: CSS-First Configuration',
    slug: 'tailwindcss-v4',
    category: 'nextjs-core',
    difficulty: 3,
    plain_english_summary: 'TailwindCSS v4 eliminates tailwind.config.js in favor of CSS-based configuration using @theme and @import directives.',
    when_to_use: 'Use for all new projects. The CSS-first approach is simpler and more intuitive for developers familiar with CSS.',
    when_not_to_use: 'Stick with v3 if you have complex custom plugin ecosystems that are not yet v4 compatible.',
    code_snippet: `/* globals.css - No tailwind.config.js needed! */
@import "tailwindcss";

@theme {
  --color-brand: #4f46e5;
  --font-sans: "Geist", system-ui, sans-serif;
  --radius-lg: 0.75rem;
}

@variant dark (&:is(.dark *));

/* Usage */
<button class="bg-brand text-white rounded-lg px-4 py-2">
  Click me
</button>`,
    code_explanation: '@import "tailwindcss" replaces the old directives. @theme defines custom properties. @variant creates custom variants like dark mode.',
    real_world_example: 'A design system where colors, fonts, and spacing are defined once in globals.css and used consistently across components.',
    gotchas: ['No tailwind.config.js in v4', '@theme uses CSS custom properties syntax', 'Plugins work differently in v4', 'Migration from v3 requires changes'],
  },
  {
    title: 'Zustand: Simple Global State',
    slug: 'zustand-state',
    category: 'advanced',
    difficulty: 3,
    plain_english_summary: 'Zustand is a minimal, unopinionated state management library that uses hooks and requires no providers or boilerplate.',
    when_to_use: 'Use for simple global state: theme, sidebar state, user preferences. Perfect when Context feels like overkill.',
    when_not_to_use: 'For complex derived state, consider Jotai. For server state, use TanStack Query instead.',
    code_snippet: `// stores/app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'system',
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-storage' }
  )
);

// Usage in component
const { sidebarOpen, toggleSidebar } = useAppStore(
  state => ({ sidebarOpen: state.sidebarOpen, toggleSidebar: state.toggleSidebar })
);`,
    code_explanation: 'create() defines the store. set() updates state. get() reads current state. persist middleware saves to localStorage automatically.',
    real_world_example: 'A dashboard where sidebar collapse state, theme preference, and notification settings persist across sessions.',
    gotchas: ['No Provider needed unlike Redux/Context', 'Selectors prevent unnecessary re-renders', 'persist middleware handles hydration', 'DevTools available for debugging'],
  },
  {
    title: 'React Hook Form + Zod: Type-Safe Forms',
    slug: 'react-hook-form-zod',
    category: 'advanced',
    difficulty: 3,
    plain_english_summary: 'React Hook Form provides performant form handling with minimal re-renders. Zod adds runtime type validation with TypeScript inference.',
    when_to_use: 'Use for all forms with validation. Especially effective for complex forms with many fields and conditional validation.',
    when_not_to_use: 'Overkill for simple single-field forms. Native HTML validation may suffice for basic cases.',
    code_snippet: `const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
});

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema),
});

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('title')} />
    {errors.title && <p>{errors.title.message}</p>}
    <button disabled={isSubmitting}>Submit</button>
  </form>
);`,
    code_explanation: 'zodResolver connects Zod schema to React Hook Form. register() binds inputs. handleSubmit() validates before calling onSubmit.',
    real_world_example: 'A multi-step registration form with email validation, password strength, and conditional field validation based on user type.',
    gotchas: ['Always use resolver for validation', 'formState isProxy - destructure carefully', 'defaultValues prevent uncontrolled warnings', 'Controller needed for custom components'],
  },
  {
    title: 'Parallel Routes: Multiple Pages Simultaneously',
    slug: 'parallel-routes',
    category: 'nextjs-core',
    difficulty: 5,
    plain_english_summary: 'Parallel Routes render multiple pages in the same layout simultaneously, enabling complex dashboard layouts with independent navigation.',
    when_to_use: 'Use for dashboards with multiple independent sections, split-pane layouts, or modals that maintain their own URL state.',
    when_not_to_use: 'Avoid for simple layouts. Adds complexity that may not be needed for basic page structures.',
    code_snippet: `// app/layout.tsx
export default function Layout({
  children,
  dashboard,
  sidebar,
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <section>{dashboard}</section>
    </div>
  );
}

// File structure:
// app/
//   ├── layout.tsx
//   ├── page.tsx
//   ├── @dashboard/
//   │   └── page.tsx
//   └── @sidebar/
//       └── page.tsx`,
    code_explanation: 'Each slot (@dashboard, @sidebar) renders independently. They can have their own loading and error states. All slots MUST have a default.tsx.',
    real_world_example: 'An admin dashboard where the sidebar, main content, and preview panel each have independent routes and loading states.',
    gotchas: ['All slots need default.tsx', 'Slots are independent - no direct communication', 'URL structure affects all slots', 'Complex to debug routing issues'],
  },
  {
    title: 'Intercepting Routes: Modal Overlays',
    slug: 'intercepting-routes',
    category: 'nextjs-core',
    difficulty: 4,
    plain_english_summary: 'Intercepting Routes allow you to show a modal or overlay while keeping the underlying page visible, with URL synchronization.',
    when_to_use: 'Use for image galleries, product quick views, login modals - any overlay that should have its own URL but show over current page.',
    when_not_to_use: 'Not needed for simple modals that do not need URL state or shareable links.',
    code_snippet: `// app/photos/page.tsx - Main page
export default function PhotosPage() {
  return <PhotoGrid />;
}

// app/photos/(.)[id]/page.tsx - Intercepted route
export default function PhotoModal({ params }) {
  return (
    <Modal>
      <PhotoDetail id={params.id} />
    </Modal>
  );
}

// Convention: (.) = same level, (..) = one level up
// User sees modal over grid, but URL is /photos/123`,
    code_explanation: '(.) intercepts at the same level. When user clicks a photo, they see the modal overlay but the URL changes to /photos/123.',
    real_world_example: 'Instagram-style photo grid where clicking a photo opens a modal with comments, but the URL is shareable and refresh shows full page.',
    gotchas: ['Convention: (.) same level, (..) parent', 'Must handle both modal and full page routes', 'Browser refresh shows non-intercepted version', 'Complex state synchronization needed'],
  },
  {
    title: 'Custom Hooks Library: useDebounce',
    slug: 'custom-hook-debounce',
    category: 'react-hooks',
    difficulty: 2,
    plain_english_summary: 'Custom hooks extract reusable logic. useDebounce delays value updates, perfect for search inputs to reduce API calls.',
    when_to_use: 'Use for search inputs, resize handlers, scroll events - any rapid-fire event where you only need the final value.',
    when_not_to_use: 'Do not use when you need immediate feedback or real-time updates like chat typing indicators.',
    code_snippet: `export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

// Search only runs when user stops typing for 500ms
const { data } = useSearch(debouncedQuery);`,
    code_explanation: 'useEffect sets a timer when value changes. If value changes again before timer fires, cleanup clears it. Only final value after delay is returned.',
    real_world_example: 'An e-commerce search that only hits the API when the user pauses typing, reducing server load and improving perceived performance.',
    gotchas: ['Delay too short = still too many calls', 'Delay too long = feels unresponsive', 'Must cleanup timer to prevent memory leaks', 'Return type must match input type'],
  },
  {
    title: 'Custom Hooks Library: useLocalStorage',
    slug: 'custom-hook-localstorage',
    category: 'react-hooks',
    difficulty: 3,
    plain_english_summary: 'useLocalStorage persists state to localStorage with SSR safety, handling hydration mismatches and JSON serialization.',
    when_to_use: 'Use for persisting user preferences, draft forms, theme settings - any state that should survive page refreshes.',
    when_not_to_use: 'Do not use for sensitive data (use httpOnly cookies), or data that must be synchronized across tabs immediately.',
    code_snippet: `export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const item = window.localStorage.getItem(key);
    if (item) setStoredValue(JSON.parse(item));
    setIsInitialized(true);
  }, [key]);

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key]);

  return [storedValue, setValue, isInitialized] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');`,
    code_explanation: 'SSR-safe: checks typeof window. Lazy initialization from localStorage. JSON parse/stringify for object support. isInitialized prevents hydration mismatch.',
    real_world_example: 'A theme toggle that remembers user preference across sessions, with no flash of wrong theme on page load.',
    gotchas: ['Must handle SSR - check typeof window', 'JSON serialization loses Dates, Maps, Sets', 'Storage events not synced across tabs by default', 'QuotaExceededException possible'],
  },
  {
    title: 'Middleware Migration: proxy.ts in NextJS 16',
    slug: 'nextjs-16-proxy',
    category: 'nextjs-core',
    difficulty: 4,
    plain_english_summary: 'NextJS 16 replaces middleware.ts with app/proxy.ts for routing concerns. Authentication logic must move to layouts or Server Actions.',
    when_to_use: 'Use proxy.ts for rewrites, redirects, headers, and basic routing logic only.',
    when_not_to_use: 'Do NOT use for authentication - move auth checks to layout.tsx, Server Components, or Server Actions instead.',
    code_snippet: `// app/proxy.ts - CORRECT usage
import { proxy } from 'next/proxy';

export default proxy({
  matcher: ['/((?!_next|favicon.ico).*)'],
  async handle(request) {
    // Routing logic only - redirects, rewrites
    if (request.nextUrl.pathname.startsWith('/old-path')) {
      return Response.redirect(new URL('/new-path', request.url));
    }
    return NextResponse.next();
  },
});

// WRONG - Do not do auth here
// Move to: app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/login');
  return <>{children}</>;
}`,
    code_explanation: 'proxy.ts handles routing only. Authentication belongs in layouts where you have access to auth context and can render appropriate UI.',
    real_world_example: 'Migrating an app from NextJS 14 to 16: move auth checks from middleware.ts to individual route layouts for better type safety and UX.',
    gotchas: ['proxy.ts must be in app/ directory', 'No access to auth session in proxy', 'matcher syntax same as middleware', 'Breaking change from NextJS 15'],
  },
  {
    title: 'Partial Pre-Rendering (PPR)',
    slug: 'partial-prerendering',
    category: 'nextjs-core',
    difficulty: 5,
    plain_english_summary: 'PPR renders a static shell at build time and streams dynamic parts at request time, combining SSG and SSR in one HTTP request.',
    when_to_use: 'Use for pages with mostly static content but some dynamic data like e-commerce product pages, dashboards with static layout.',
    when_not_to_use: 'Avoid for fully static pages (pure SSG is simpler) or fully dynamic pages (pure SSR is clearer).',
    code_snippet: `export const experimental_ppr = true;

export default async function ProductPage({ params }) {
  return (
    <>
      {/* Static - prerendered at build */}
      <StaticHeader />
      <ProductInfo />
      
      {/* Dynamic - rendered at request */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>
      
      <Suspense fallback={<InventorySkeleton />}>
        <Inventory productId={params.id} />
      </Suspense>
    </>
  );
}`,
    code_explanation: 'Static parts render immediately from CDN. Dynamic parts stream in as they resolve. Suspense boundaries define the split between static and dynamic.',
    real_world_example: 'A product page where the description and images are static, but reviews and inventory are fetched dynamically for each request.',
    gotchas: ['Requires Suspense boundaries', 'Dynamic content must be async', 'Not compatible with all NextJS features', 'Experimental - API may change'],
  },
  {
    title: 'Error Boundaries and Error Handling',
    slug: 'error-boundaries',
    category: 'nextjs-core',
    difficulty: 3,
    plain_english_summary: 'Error boundaries catch JavaScript errors in child components, preventing the entire app from crashing and showing fallback UI.',
    when_to_use: 'Use for graceful degradation - wrap risky components like charts, maps, or third-party widgets that might fail.',
    when_not_to_use: 'Do not use for expected errors like 404s (use not-found.tsx) or form validation errors (handle in component).',
    code_snippet: `'use client';

export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <RiskyChart data={complexData} />
</ErrorBoundary>`,
    code_explanation: 'getDerivedStateFromError updates state when error occurs. componentDidCatch logs to error service. render shows fallback UI instead of crashing.',
    real_world_example: 'A dashboard where a failing chart component shows "Unable to load chart" instead of crashing the entire dashboard.',
    gotchas: ['Must be class components', 'Only catch errors in render/lifecycle', 'Cannot catch async errors', 'Must provide reset functionality'],
  },
  {
    title: 'Drizzle ORM: Type-Safe Database',
    slug: 'drizzle-orm',
    category: 'advanced',
    difficulty: 4,
    plain_english_summary: 'Drizzle is a lightweight, type-safe ORM designed for serverless with native Edge Runtime support and SQL-like syntax.',
    when_to_use: 'Use for performance-critical serverless apps, Edge Runtime deployments, or when you want SQL-like query syntax with TypeScript safety.',
    when_not_to_use: 'Prisma may be better for complex migrations, large teams, or when you need the Prisma Client ecosystem.',
    code_snippet: `import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
});

// Query
const result = await db
  .select()
  .from(users)
  .where(eq(users.email, 'john@example.com'));

// Insert
await db.insert(users).values({ name: 'John', email: 'john@example.com' });`,
    code_explanation: 'Define schema with type-safe columns. Query using SQL-like chained methods. eq() and other operators provide type-safe filtering.',
    real_world_example: 'A high-performance API that runs on Cloudflare Workers with Drizzle connecting to PostgreSQL via connection pooler.',
    gotchas: ['Smaller ecosystem than Prisma', 'Migrations handled differently', 'Raw SQL escape hatch always available', 'Bundle size much smaller than Prisma'],
  },
  {
    title: 'Authentication: Better Auth Integration',
    slug: 'better-auth',
    category: 'advanced',
    difficulty: 4,
    plain_english_summary: 'Better Auth is a modern, type-safe authentication library with built-in social providers, sessions, and database adapters.',
    when_to_use: 'Use for new projects wanting a modern auth solution with TypeScript safety, social login, and minimal configuration.',
    when_not_to_use: 'Clerk may be better for rapid prototyping. NextAuth v5 if you need specific OAuth providers or extensive customization.',
    code_snippet: `// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(db),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});

// Usage in Server Component
import { auth } from '@/lib/auth';

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect('/login');
  return <div>Welcome {session.user.name}</div>;
}`,
    code_explanation: 'Configure with database adapter and social providers. Check session in layouts or pages. Type-safe throughout with TypeScript inference.',
    real_world_example: 'A SaaS app with GitHub login, session management, and protected routes - all type-safe and running on Edge Runtime.',
    gotchas: ['Relatively new - ecosystem growing', 'Database adapter required', 'Social providers need OAuth setup', 'Session strategy configurable'],
  },
  {
    title: 'React Compiler: Auto-Memoization',
    slug: 'react-compiler',
    category: 'advanced',
    difficulty: 3,
    plain_english_summary: 'React Compiler automatically memoizes components and values, eliminating the need for manual useMemo, useCallback, and React.memo in most cases.',
    when_to_use: 'Enable for new projects to eliminate manual memoization boilerplate. Especially helpful for teams new to React performance optimization.',
    when_not_to_use: 'May cause issues with legacy code that relies on specific re-render behaviors. Test thoroughly before enabling on existing large apps.',
    code_snippet: `// next.config.ts
const nextConfig = {
  reactCompiler: true,
};

// Before: Manual memoization
const MemoizedComponent = React.memo(function Component({ data }) {
  const processed = useMemo(() => expensiveProcess(data), [data]);
  const handleClick = useCallback(() => doSomething(processed), [processed]);
  return <button onClick={handleClick}>{processed}</button>;
});

// After: React Compiler handles it automatically
function Component({ data }) {
  const processed = expensiveProcess(data); // Auto-memoized
  const handleClick = () => doSomething(processed); // Auto-memoized
  return <button onClick={handleClick}>{processed}</button>;
}`,
    code_explanation: 'With React Compiler enabled, you can delete most useMemo and useCallback calls. The compiler analyzes dependencies and adds memoization automatically.',
    real_world_example: 'A large dashboard app where developers no longer need to think about memoization - the compiler optimizes automatically without manual intervention.',
    gotchas: ['Requires React 19+', 'May change behavior of some edge cases', 'DevTools support still evolving', 'Not a silver bullet - still profile performance'],
  },
  {
    title: 'useActionState: Form State Management',
    slug: 'use-action-state',
    category: 'react-hooks',
    difficulty: 3,
    plain_english_summary: 'useActionState manages form action state including pending status, errors, and results - replacing useFormState from React DOM.',
    when_to_use: 'Use with Server Actions to handle form submission states, validation errors, and success feedback without manual state management.',
    when_not_to_use: 'Not needed for simple forms without Server Actions or when using React Hook Form for complex validation.',
    code_snippet: `const [state, formAction, isPending] = useActionState(submitForm, null);

return (
  <form action={formAction}>
    <input name="email" required />
    <button disabled={isPending}>
      {isPending ? 'Submitting...' : 'Submit'}
    </button>
    {state?.error && <p className="error">{state.error}</p>}
    {state?.success && <p className="success">Success!</p>}
  </form>
);

// Server Action
async function submitForm(prevState, formData) {
  const email = formData.get('email');
  if (!email.includes('@')) {
    return { error: 'Invalid email' };
  }
  await saveEmail(email);
  return { success: true };
}`,
    code_explanation: 'useActionState returns current state, form action function, and pending status. Server Action receives previous state and form data.',
    real_world_example: 'A newsletter signup form that shows loading state, validation errors, and success message without any useState hooks.',
    gotchas: ['Server Action must accept prevState as first arg', 'Returns null initially', 'Error handling in returned state', 'Replaces useFormState from React 18'],
  },
  {
    title: 'Infinite Scroll with TanStack Query',
    slug: 'infinite-scroll',
    category: 'advanced',
    difficulty: 4,
    plain_english_summary: 'Infinite scroll loads data incrementally as the user scrolls, providing a seamless browsing experience for large datasets.',
    when_to_use: 'Use for social media feeds, product listings, search results - any large dataset where users expect continuous scrolling.',
    when_not_to_use: 'Avoid for small datasets where pagination is clearer, or when SEO requires all content to be present initially.',
    code_snippet: `'use client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function InfinitePosts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  return (
    <>
      {data?.pages.map(page => 
        page.posts.map(post => <PostCard key={post.id} post={post} />)
      )}
      <button 
        onClick={() => fetchNextPage()} 
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Load More' : 'No more posts'}
      </button>
    </>
  );
}`,
    code_explanation: 'useInfiniteQuery manages paginated data. getNextPageParam extracts next cursor. fetchNextPage loads more data. Pages are automatically concatenated.',
    real_world_example: 'A Twitter-like feed where posts load automatically as you scroll, with 20 posts per page fetched from a cursor-based API.',
    gotchas: ['Cursor-based pagination preferred', 'Must handle duplicate items', 'Scroll position preservation tricky', 'SEO considerations for initial load'],
  },
  {
    title: 'Performance: Core Web Vitals',
    slug: 'core-web-vitals',
    category: 'advanced',
    difficulty: 3,
    plain_english_summary: 'Core Web Vitals are Google\'s metrics for user experience: LCP (loading), INP (interactivity), and CLS (visual stability).',
    when_to_use: 'Monitor and optimize for all production apps. These metrics affect SEO rankings and user satisfaction.',
    when_not_to_use: 'Less critical for internal tools or apps where performance is already acceptable and users are captive.',
    code_snippet: `// next.config.ts - Image optimization
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

// Component optimization
import Image from 'next/image';

<Image 
  src="/hero.jpg" 
  alt="Hero" 
  width={1200} 
  height={600}
  priority // For LCP images
  sizes="100vw"
/>;

// Font optimization
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });`,
    code_explanation: 'Image component optimizes format and size. Priority loads critical images immediately. Font display: swap prevents invisible text.',
    real_world_example: 'An e-commerce site optimizing product images, using Next.js Image component, achieving LCP under 2.5s and improving search rankings.',
    gotchas: ['LCP: Target < 2.5s', 'INP: Target < 200ms', 'CLS: Target < 0.1', 'Measure with real user data (CrUX)', 'Lab data (Lighthouse) differs from field data'],
  },
];

// 48 Flashcards (2 per topic) for revision
const nextjsFlashcards = [
  // Topic 1: NextJS 16 Foundation
  {
    topic_slug: 'nextjs-16-foundation',
    card_front: "What are the two major new features in NextJS 16 and what do they do?",
    card_back: '1. Turbopack: 2-5× faster builds, 10× faster Fast Refresh, now default. 2. Cache Components: "use cache" directive for explicit component-level caching with cacheTag() for targeted revalidation.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Turbopack = Speed. Cache Components = Control.',
  },
  {
    topic_slug: 'nextjs-16-foundation',
    card_front: "When should you use 'use cache' vs when should you avoid it?",
    card_back: 'Use for: Static data, shared content, expensive computations. Avoid for: Highly dynamic data, user-specific content that should not be shared, frequently changing data.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Cache = Shareable static content.',
  },
  // Topic 2: Server vs Client Components
  {
    topic_slug: 'server-vs-client-components',
    card_front: "What are the three key differences between Server and Client Components?",
    card_back: '1. Server: No JS sent to client, direct DB access, no hooks. 2. Client: JS bundle, browser APIs, all hooks. 3. Default to Server, use Client only for interactivity.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Server = lean, Client = interactive.',
  },
  {
    topic_slug: 'server-vs-client-components',
    card_front: "How do you pass a Server Component as a child to a Client Component without losing server benefits?",
    card_back: 'Pass Server Components as children prop to Client Components. The child remains a Server Component while the wrapper handles client-side interactivity.',
    difficulty: 'hard',
    has_code_snippet: true,
    code_snippet: `<ClientWrapper>
  <ServerContent /> {/* Still Server Component! */}
</ClientWrapper>`,
    memory_hook: 'Children prop preserves server benefits.',
  },
  // Topic 3: useTransition
  {
    topic_slug: 'use-transition',
    card_front: "What problem does useTransition solve and what does it return?",
    card_back: 'Problem: Expensive state updates blocking UI. Returns: [isPending, startTransition]. isPending shows loading state. startTransition marks updates as non-urgent.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Transition = Keep UI responsive during heavy work.',
  },
  {
    topic_slug: 'use-transition',
    card_front: "What's the difference between urgent and non-urgent updates in useTransition?",
    card_back: 'Urgent: Input value, hover states - update immediately. Non-urgent: Filtered results, sorted lists - can be deferred. Use startTransition() for non-urgent only.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `setQuery(value); // Urgent
startTransition(() => {
  setFiltered(filter(value)); // Non-urgent
});`,
    memory_hook: 'Urgent = user sees immediately. Non-urgent = can wait.',
  },
  // Topic 4: useOptimistic
  {
    topic_slug: 'use-optimistic',
    card_front: "What is useOptimistic and when should you use it?",
    card_back: 'useOptimistic shows immediate UI updates while async operations complete. Use for: likes, comments, form submissions - any action where instant feedback improves UX.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Optimistic = Hope for the best, prepare for rollback.',
  },
  {
    topic_slug: 'use-optimistic',
    card_front: "What are the three things you must handle when using useOptimistic?",
    card_back: '1. Show optimistic state immediately. 2. Handle error cases with rollback. 3. Replace optimistic data with server confirmation. Never use for financial transactions.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Optimistic UI = instant feedback + error handling.',
  },
  // Topic 5: Server Actions
  {
    topic_slug: 'server-actions-forms',
    card_front: "What are Server Actions and what problem do they solve?",
    card_back: 'Server Actions are async functions that run on the server but can be called directly from forms and buttons. They eliminate API route boilerplate and provide type safety.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Server Actions = No API routes needed.',
  },
  {
    topic_slug: 'server-actions-forms',
    card_front: "How do you handle form errors in Server Actions with progressive enhancement?",
    card_back: 'Use useActionState hook. It returns [state, formAction, isPending]. Return errors from Server Action, display in component. Works without JavaScript for progressive enhancement.',
    difficulty: 'hard',
    has_code_snippet: true,
    code_snippet: `const [state, formAction, isPending] = useActionState(createPost, null);
return (
  <form action={formAction}>
    {state?.error && <p>{state.error}</p>}
  </form>
);`,
    memory_hook: 'useActionState = Form state + errors + pending.',
  },
  // Topic 6: TanStack Query
  {
    topic_slug: 'tanstack-query',
    card_front: "What are the three key benefits of TanStack Query over useEffect + fetch?",
    card_back: '1. Automatic caching with configurable stale time. 2. Background refetching and synchronization. 3. Built-in loading, error, and mutation states.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'TanStack Query = Caching + Sync + State management.',
  },
  {
    topic_slug: 'tanstack-query',
    card_front: "How do you invalidate cache after a mutation in TanStack Query?",
    card_back: 'Use queryClient.invalidateQueries() in mutation onSuccess. Pass the queryKey of data that should be refetched. This triggers background refetch of stale data.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `onSuccess: () => queryClient.invalidateQueries({ 
  queryKey: ['todos'] 
})`,
    memory_hook: 'Invalidate = Mark stale → Auto refetch.',
  },
  // Topic 7: TailwindCSS v4
  {
    topic_slug: 'tailwindcss-v4',
    card_front: "What's the biggest change in TailwindCSS v4 configuration?",
    card_back: 'v4 eliminates tailwind.config.js. Configuration is now CSS-first using @import "tailwindcss" and @theme directive in globals.css.',
    difficulty: 'easy',
    has_code_snippet: true,
    code_snippet: `@import "tailwindcss";
@theme {
  --color-brand: #4f46e5;
}`,
    memory_hook: 'No JS config = Pure CSS configuration.',
  },
  {
    topic_slug: 'tailwindcss-v4',
    card_front: "How do you define custom colors and fonts in TailwindCSS v4?",
    card_back: 'Use @theme directive with CSS custom properties syntax. --color-* for colors, --font-* for fonts. Reference in classes with bg-brand, font-sans.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `@theme {
  --color-brand: #4f46e5;
  --font-sans: "Geist", system-ui;
}`,
    memory_hook: '@theme = CSS variables for Tailwind.',
  },
  // Topic 8: Zustand
  {
    topic_slug: 'zustand-state',
    card_front: "What makes Zustand different from Redux and Context?",
    card_back: '1. No Provider needed. 2. Minimal boilerplate. 3. Uses hooks directly. 4. Built-in middleware (persist, devtools). 5. Much smaller bundle size.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Zustand = Redux without the boilerplate.',
  },
  {
    topic_slug: 'zustand-state',
    card_front: "How do you persist Zustand state to localStorage?",
    card_back: 'Use persist middleware from zustand/middleware. Wrap your store creator with persist(). State automatically saves to localStorage and hydrates on load.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `import { persist } from 'zustand/middleware';
const useStore = create(persist(store, { name: 'app-storage' }));`,
    memory_hook: 'persist middleware = localStorage auto-save.',
  },
  // Topic 9: React Hook Form + Zod
  {
    topic_slug: 'react-hook-form-zod',
    card_front: "What does Zod provide that TypeScript alone doesn't?",
    card_back: 'Zod provides runtime validation. TypeScript only checks at compile time. Zod validates actual data at runtime, ensuring data from APIs/forms matches expected shape.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'TypeScript = compile time. Zod = runtime.',
  },
  {
    topic_slug: 'react-hook-form-zod',
    card_front: "How do you handle form submission errors with React Hook Form and Zod?",
    card_back: 'Zod validation errors are automatically mapped to formState.errors. Use errors.fieldName?.message to display errors. Handle submit errors in onError callback.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `const { formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
{errors.email && <p>{errors.email.message}</p>}`,
    memory_hook: 'zodResolver connects Zod to RHF errors.',
  },
  // Topic 10: Parallel Routes
  {
    topic_slug: 'parallel-routes',
    card_front: "What are Parallel Routes and what problem do they solve?",
    card_back: 'Parallel Routes render multiple pages in the same layout simultaneously using @folder convention. They enable complex dashboard layouts with independent navigation.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: '@folder = Parallel slot in layout.',
  },
  {
    topic_slug: 'parallel-routes',
    card_front: "What file is required for all parallel route slots and why?",
    card_back: 'default.tsx is required for all slots. It provides fallback content when the slot is not matched by the current URL. Without it, the build fails.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'default.tsx = Required fallback for slots.',
  },
  // Topic 11: Intercepting Routes
  {
    topic_slug: 'intercepting-routes',
    card_front: "What do (.) and (..) conventions mean in intercepting routes?",
    card_back: '(.) = intercept at same level. (..) = intercept one level up. (..)(..) = two levels up. (...) = root level. These control which layout the modal overlays.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: '(.) = same, (..) = up, (...) = root.',
  },
  {
    topic_slug: 'intercepting-routes',
    card_front: "Why do you need both an intercepted route AND a regular route for modals?",
    card_back: 'Intercepted route shows modal overlay. Regular route shows full page. When user refreshes or shares URL, they see the full page version. Both need to exist.',
    difficulty: 'hard',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Intercept = modal overlay. Regular = full page.',
  },
  // Topic 12: useDebounce
  {
    topic_slug: 'custom-hook-debounce',
    card_front: "What problem does useDebounce solve and when should you use it?",
    card_back: 'Prevents rapid-fire function calls. Use for search inputs, resize handlers, scroll events - any event that fires frequently where you only need the final value.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Debounce = Wait for pause, then act.',
  },
  {
    topic_slug: 'custom-hook-debounce',
    card_front: "Why must you cleanup the timeout in useDebounce's useEffect?",
    card_back: 'Without cleanup, rapid value changes create multiple timers. The earlier timers still fire, causing stale updates. Cleanup ensures only the last timer fires.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `return () => clearTimeout(timer); // Essential!`,
    memory_hook: 'Cleanup = Cancel old timers.',
  },
  // Topic 13: useLocalStorage
  {
    topic_slug: 'custom-hook-localstorage',
    card_front: "Why must you check typeof window in useLocalStorage?",
    card_back: 'Server-side rendering has no window object. Accessing window during SSR causes errors. Check ensures code only runs in browser.',
    difficulty: 'easy',
    has_code_snippet: true,
    code_snippet: `if (typeof window === 'undefined') return;`,
    memory_hook: 'typeof window = SSR safety check.',
  },
  {
    topic_slug: 'custom-hook-localstorage',
    card_front: "What data types are lost when storing to localStorage and how do you handle it?",
    card_back: 'localStorage only stores strings. JSON.stringify/parse handles objects but loses Date (becomes string), Map, Set, and undefined. Rehydrate Dates manually if needed.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'localStorage = strings only. JSON = limited types.',
  },
  // Topic 14: NextJS 16 Proxy
  {
    topic_slug: 'nextjs-16-proxy',
    card_front: "What is the breaking change with middleware in NextJS 16?",
    card_back: 'middleware.ts is replaced by app/proxy.ts. Authentication logic must move to layouts or Server Actions. proxy.ts is for routing only (redirects, rewrites).',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'proxy.ts = routing only. Auth in layouts.',
  },
  {
    topic_slug: 'nextjs-16-proxy',
    card_front: "Where should authentication checks go in NextJS 16 instead of proxy.ts?",
    card_back: 'Move auth to: 1) layout.tsx for route groups, 2) Server Components for page-level checks, 3) Server Actions for mutation authorization.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `// app/dashboard/layout.tsx
const session = await auth();
if (!session) redirect('/login');`,
    memory_hook: 'Auth in layouts, not proxy.',
  },
  // Topic 15: PPR
  {
    topic_slug: 'partial-prerendering',
    card_front: "What is Partial Pre-Rendering and what does it combine?",
    card_back: 'PPR combines SSG (static shell at build) and SSR (dynamic content at request) in a single HTTP request. Static renders immediately, dynamic streams in.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'PPR = SSG shell + SSR streaming.',
  },
  {
    topic_slug: 'partial-prerendering',
    card_front: "What defines the boundary between static and dynamic in PPR?",
    card_back: 'Suspense boundaries define the split. Content outside Suspense is static (prerendered). Content inside async components within Suspense is dynamic (fetched at request).',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `<Suspense fallback={<Skeleton />}>
  <DynamicContent /> {/* Fetched at request */}
</Suspense>`,
    memory_hook: 'Suspense = static/dynamic boundary.',
  },
  // Topic 16: Error Boundaries
  {
    topic_slug: 'error-boundaries',
    card_front: "What can Error Boundaries catch and what can't they catch?",
    card_back: 'Catch: Render errors, lifecycle errors, constructor errors. Cannot catch: Event handler errors, async errors, server errors, errors in the boundary itself.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Boundaries catch render, not events/async.',
  },
  {
    topic_slug: 'error-boundaries',
    card_front: "Why must Error Boundaries be class components and not functions?",
    card_back: 'Error boundaries require getDerivedStateFromError and componentDidCatch lifecycle methods. These are only available in class components, not hooks.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Class components only = lifecycle methods needed.',
  },
  // Topic 17: Drizzle ORM
  {
    topic_slug: 'drizzle-orm',
    card_front: "What are the three main advantages of Drizzle over Prisma?",
    card_back: '1. Smaller bundle size (~57KB vs ~2MB). 2. Native Edge Runtime support. 3. SQL-like syntax that feels familiar to SQL developers.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Drizzle = Small, Fast, SQL-like.',
  },
  {
    topic_slug: 'drizzle-orm',
    card_front: "How do you perform a type-safe WHERE clause in Drizzle?",
    card_back: 'Use operators like eq(), gt(), lt() from drizzle-orm. These provide type safety and compile-time checking of column references and value types.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `import { eq } from 'drizzle-orm';
.where(eq(users.email, 'john@example.com'))`,
    memory_hook: 'eq(), gt(), lt() = Type-safe SQL operators.',
  },
  // Topic 18: Better Auth
  {
    topic_slug: 'better-auth',
    card_front: "What are the three key features of Better Auth?",
    card_back: '1. Type-safe authentication with TypeScript inference. 2. Built-in social providers (GitHub, Google, etc.). 3. Database adapters for multiple ORMs.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Better Auth = Type-safe + Social + Flexible.',
  },
  {
    topic_slug: 'better-auth',
    card_front: "Where should you check authentication in a NextJS app using Better Auth?",
    card_back: 'Check in Server Components (layout.tsx or page.tsx) using await auth(). Redirect if no session. This provides type safety and proper SSR handling.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `const session = await auth();
if (!session) redirect('/login');`,
    memory_hook: 'await auth() in Server Components.',
  },
  // Topic 19: React Compiler
  {
    topic_slug: 'react-compiler',
    card_front: "What does React Compiler eliminate the need for?",
    card_back: 'React Compiler auto-memoizes components, eliminating manual useMemo, useCallback, and React.memo in most cases. You can delete most memoization code.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'React Compiler = Delete useMemo/useCallback.',
  },
  {
    topic_slug: 'react-compiler',
    card_front: "What is the requirement to enable React Compiler in NextJS?",
    card_back: 'Requires React 19+ and NextJS 16. Enable in next.config.ts with reactCompiler: true. May cause issues with legacy code relying on specific re-render behaviors.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `const nextConfig = { reactCompiler: true };`,
    memory_hook: 'React 19+ required. Enable in config.',
  },
  // Topic 20: useActionState
  {
    topic_slug: 'use-action-state',
    card_front: "What three values does useActionState return?",
    card_back: '[state, formAction, isPending]. state = current state from server. formAction = function to pass to form action. isPending = boolean for loading state.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'State, Action, Pending = useActionState.',
  },
  {
    topic_slug: 'use-action-state',
    card_front: "How does useActionState support progressive enhancement?",
    card_back: 'The form works without JavaScript because action is a Server Action. With JS: shows loading states and errors. Without JS: basic form submission still works.',
    difficulty: 'hard',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Works without JS = progressive enhancement.',
  },
  // Topic 21: Infinite Scroll
  {
    topic_slug: 'infinite-scroll',
    card_front: "What does getNextPageParam do in useInfiniteQuery?",
    card_back: 'Extracts the cursor/page number for the next page from the last page\'s response. Return undefined to indicate no more pages.',
    difficulty: 'easy',
    has_code_snippet: true,
    code_snippet: `getNextPageParam: (lastPage) => lastPage.nextCursor,`,
    memory_hook: 'getNextPageParam = Where to find next cursor.',
  },
  {
    topic_slug: 'infinite-scroll',
    card_front: "Why is cursor-based pagination preferred over offset for infinite scroll?",
    card_back: 'Offset pagination breaks when items are added/removed during scrolling (duplicate or skipped items). Cursor-based uses stable references (IDs/timestamps) avoiding this.',
    difficulty: 'medium',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'Cursor = stable. Offset = breaks on changes.',
  },
  // Topic 22: Core Web Vitals
  {
    topic_slug: 'core-web-vitals',
    card_front: "What are the three Core Web Vitals and their target values?",
    card_back: 'LCP (Largest Contentful Paint): < 2.5s. INP (Interaction to Next Paint): < 200ms. CLS (Cumulative Layout Shift): < 0.1.',
    difficulty: 'easy',
    has_code_snippet: false,
    code_snippet: '',
    memory_hook: 'LCP < 2.5s, INP < 200ms, CLS < 0.1',
  },
  {
    topic_slug: 'core-web-vitals',
    card_front: "What causes CLS and how do you prevent it?",
    card_back: 'CLS is caused by elements changing position after initial render. Prevent by: setting image dimensions, reserving space for ads/dynamic content, using font-display: swap.',
    difficulty: 'medium',
    has_code_snippet: true,
    code_snippet: `<Image width={800} height={600} /> {/* Prevents CLS */}`,
    memory_hook: 'CLS = jumping content. Fix with dimensions.',
  },
];

/**
 * Seed endpoint to populate database with NextJS 16 topics and flashcards
 * POST /api/seed-nextjs - Insert sample topics and flashcards
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
    // Insert topics
    const insertedTopics = [];
    for (const topic of nextjsTopics) {
      const result = await query(
        `INSERT INTO topics (id, title, slug, category, difficulty, plain_english_summary, when_to_use, when_not_to_use, code_snippet, code_explanation, real_world_example, gotchas, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id, slug`,
        [
          crypto.randomUUID(),
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
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      if (result.rows[0]) {
        insertedTopics.push(result.rows[0]);
      }
    }

    // Insert flashcards
    let flashcardsInserted = 0;
    for (const card of nextjsFlashcards) {
      const topicResult = await query('SELECT id FROM topics WHERE slug = $1', [card.topic_slug]);
      if (topicResult.rows[0]) {
        await query(
          `INSERT INTO flashcards (id, topic_id, card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT DO NOTHING`,
          [
            crypto.randomUUID(),
            topicResult.rows[0].id,
            card.card_front,
            card.card_back,
            card.difficulty,
            card.has_code_snippet,
            card.code_snippet,
            card.memory_hook,
            new Date().toISOString(),
          ]
        );
        flashcardsInserted++;
      }
    }

    // Initialize user progress for all flashcards
    await query(`
      INSERT INTO user_card_progress (id, card_id, repetition, interval_days, easiness_factor, last_reviewed_at, next_review_date, total_reviews, quality_history, created_at)
      SELECT 
        gen_random_uuid(),
        id, 
        0, 
        1, 
        2.5,
        null,
        null,
        0,
        '[]',
        NOW()
      FROM flashcards
      ON CONFLICT (card_id) DO NOTHING
    `);

    // Get final counts
    const finalTopics = await query('SELECT COUNT(*) as count FROM topics');
    const finalFlashcards = await query('SELECT COUNT(*) as count FROM flashcards');

    return NextResponse.json({
      success: true,
      message: 'NextJS 16 topics and flashcards seeded successfully',
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