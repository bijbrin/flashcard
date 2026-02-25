# DevLens — The Intelligent Next.js Learning OS

## Executive Summary

**Product Name:** DevLens  
**Version:** 1.0.0  
**Date:** 2025-02-25

### Problem Statement
Developers face skill decay in the rapidly evolving Next.js/React ecosystem. Official documentation is fragmented, and finding intermediate-to-advanced topics requires digging through scattered sources. Developers need a centralized, intelligent learning system that adapts to their progress.

### Solution Overview
DevLens is a multi-agent powered learning platform that:
- Continuously researches and extracts intermediate-to-advanced Next.js 16 + React 19 topics
- Presents topics through an elegant dark-mode-first UI with code snippets
- Generates spaced-repetition flashcards using SM-2 algorithm
- Runs autonomous research agents to inject fresh content every 72 hours

### Target Users
Intermediate-to-senior JavaScript/Next.js developers seeking structured, retention-focused learning.

### Success Metrics
- Daily active review sessions
- Topic mastery rate (cards reaching 5+ day intervals)
- User retention score (7-day, 30-day)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVLENS ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  DocScraper  │    │GitHubReviewer│    │CronResearcher│                   │
│  │   (AGENT_01) │    │  (AGENT_02)  │    │  (AGENT_06)  │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │ ContentArchitect │                                     │
│                    │    (AGENT_03)    │                                     │
│                    └────────┬─────────┘                                     │
│                             ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │  FlashcardEngine │                                     │
│                    │    (AGENT_04)    │                                     │
│                    └────────┬─────────┘                                     │
│                             ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │   Supabase DB    │                                     │
│                    │  (PostgreSQL)    │                                     │
│                    └────────┬─────────┘                                     │
│                             ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │   Next.js App    │                                     │
│                    │   (AGENT_05)     │                                     │
│                    └────────┬─────────┘                                     │
│                             ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │   User Browser   │                                     │
│                    └──────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Specifications

| Agent | Trigger | Input | Output | SLA |
|-------|---------|-------|--------|-----|
| DocScraper | Manual/Cron | URLs (nextjs.org/docs, react.dev) | Raw JSON topics | <30s |
| GitHubReviewer | Manual/Cron | GitHub Search API | Pattern JSON | <60s |
| ContentArchitect | Event | Raw JSON x2 | Structured Topic JSON | <120s |
| FlashcardEngine | Event | Topic JSON | Card JSON with SM-2 | <30s |
| AppBuilder | Once | All JSON | Next.js 16 App | N/A |
| CronResearcher | 0 9 */3 * * | GitHub API | 10 new topics | <180s |

---

## Topic Taxonomy (20/20/20/20/20/20 Distribution)

| Category | Weight | Color | Focus Areas |
|----------|--------|-------|-------------|
| React Hooks | 20% | cyan-400 | useTransition, useDeferredValue, useOptimistic, use() hook |
| Next.js Core | 20% | indigo-400 | App Router, PPR, Server Components, Middleware |
| Third-Party API | 20% | emerald-400 | Stripe, UploadThing, Resend, Clerk, Prisma |
| Server-Side Patterns | 20% | violet-400 | Server Actions, caching, Edge vs Node Runtime |
| Advanced Concepts | 20% | orange-400 | Turborepo, Testing, Web Vitals, i18n |
| AI Integration | 20% | rose-400 | Vercel AI SDK, RAG, Vector search, Streaming |

---

## Feature Requirements (MoSCoW)

### MUST HAVE
- [x] Topic list with category filter tabs
- [x] Code snippet viewer with syntax highlighting (Shiki)
- [x] Flashcard flip UI with 1/3/5/10/21 day SM-2 scheduling
- [x] User progress tracking (visited, mastered)
- [x] Dashboard with progress rings and streak counter
- [x] Dark-mode-first UI design

### SHOULD HAVE
- [ ] Streak counter and gamification
- [ ] Search topics by keyword
- [ ] Light/dark mode toggle
- [ ] Mobile-responsive design

### COULD HAVE
- [ ] AI "explain differently" button on flashcard back
- [ ] Social sharing of mastered topic milestones

### WON'T HAVE (v1)
- [ ] Video content
- [ ] Live coding sandboxes

---

## Database Schema

### Tables

```sql
-- Topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category topic_category_enum NOT NULL,
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
CREATE TABLE flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  card_front text NOT NULL,
  card_back text NOT NULL,
  difficulty card_difficulty_enum DEFAULT 'medium',
  has_code_snippet boolean DEFAULT false,
  code_snippet text,
  memory_hook text,
  created_at timestamptz DEFAULT now()
);

-- User card progress table
CREATE TABLE user_card_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES flashcards(id) ON DELETE CASCADE,
  repetition int DEFAULT 0,
  interval_days int DEFAULT 1,
  easiness_factor float DEFAULT 2.5,
  last_reviewed_at timestamptz,
  next_review_date date,
  total_reviews int DEFAULT 0,
  quality_history int[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Topic visits table
CREATE TABLE topic_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  time_spent_seconds int,
  UNIQUE(user_id, topic_id)
);
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/topics` | GET | List all topics (paginated) |
| `/api/topics/[slug]` | GET | Get single topic detail |
| `/api/flashcards` | GET | Get due cards for today |
| `/api/flashcards/[id]/review` | PATCH | Submit review rating |
| `/api/cron/research` | POST | Trigger research agent |
| `/api/seed` | POST | Seed initial topics (dev only) |

---

## UI Design System

### Theme
- **Background:** zinc-950 (primary), zinc-900 (cards)
- **Text:** zinc-100 (primary), zinc-400 (secondary)
- **Accents:** 
  - React Hooks: cyan-400
  - Next.js Core: indigo-500
  - Third-Party API: emerald-400
  - Server-Side: violet-400
  - Advanced: orange-400
  - AI Integration: rose-400

### Typography
- **Font:** Inter (via next/font)
- **Max sentence length:** 20 words

### Components
- **FlashCard:** 3D flip animation (600ms ease-in-out)
- **TopicCard:** Category color-coded border-left-4
- **ProgressRing:** Circular progress per category
- **CodeBlock:** Syntax highlighted with copy button

---

## Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI/LLM
KIMI_API_KEY=sk-kimi-frjm5M12yVIlaEG5cXli3ptRj9ZHJjNEovLeD7uQUhfzoyTeiAhCz6IWkmcL7Ttp
KIMI_API_URL=https://api.moonshot.cn/v1

# GitHub (for research agent)
GITHUB_TOKEN=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Acceptance Criteria

- [ ] DocScraper extracts ≥50 intermediate/advanced topics on first run
- [ ] Each topic has: summary, code snippet, when-to-use, 2+ flashcards
- [ ] FlashCard flip animation works on mobile and desktop
- [ ] SM-2 intervals correctly compute after rating
- [ ] CronResearcher injects exactly 10 topics per run with correct distribution
- [ ] Progress persists across sessions (Supabase RLS enabled)
- [ ] Lighthouse score ≥ 90 on Performance, Accessibility
- [ ] TypeScript strict mode, zero type errors

---

## SM-2 Algorithm Implementation

```typescript
interface SM2State {
  repetition: number;
  interval: number;
  easinessFactor: number;
}

function calculateNextReview(
  state: SM2State,
  quality: number // 0-5 rating
): SM2State {
  let { repetition, interval, easinessFactor } = state;
  
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) interval = 1;
    else if (repetition === 2) interval = 3;
    else if (repetition === 3) interval = 5;
    else interval = Math.round(interval * easinessFactor);
  }
  
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  return { repetition, interval, easinessFactor };
}
```

---

## Project Structure

```
devlens/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles
│   ├── topics/
│   │   ├── page.tsx             # Topic list
│   │   └── [slug]/
│   │       └── page.tsx         # Topic detail
│   ├── flashcards/
│   │   ├── page.tsx             # Today's due cards
│   │   └── review/
│   │       └── page.tsx         # Review session
│   └── api/
│       ├── topics/
│       │   └── route.ts
│       ├── flashcards/
│       │   └── route.ts
│       └── cron/
│           └── research/
│               └── route.ts
├── components/
│   ├── ui/                      # shadcn components
│   ├── TopicCard.tsx
│   ├── FlashCard.tsx
│   ├── CodeBlock.tsx
│   ├── ProgressRing.tsx
│   ├── CategoryFilter.tsx
│   └── SpacedRepBar.tsx
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── sm2.ts                   # SM-2 algorithm
│   ├── agents/
│   │   ├── docScraper.ts
│   │   ├── contentArchitect.ts
│   │   └── flashcardEngine.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── public/
│   └── (static assets)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Notes

1. **Kimi API Integration:** Using Moonshot AI's Kimi API for content generation and research tasks
2. **Research Strategy:** GitHub issues/PRs with "good first issue", "performance", "breaking change" labels
3. **Content Quality:** All code snippets must be TypeScript, max 40 lines, with inline comments
4. **Performance:** Use React Server Components for topic content, Server Actions for mutations
