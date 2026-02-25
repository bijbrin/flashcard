# DevLens — Deployment Ready

## Quick Start

```bash
cd /root/.openclaw/workspace/devlens

# Set up environment
cp .env.example .env
# Edit .env with your keys (already provided in this case)

# Deploy
docker-compose up -d

# Access
open http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐   │
│  │   Next.js    │──────▶  PostgreSQL  │◀─────│   Cron   │   │
│  │   App :3000  │      │    :5432     │      │  (72h)   │   │
│  └──────────────┘      └──────────────┘      └──────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────┐                   │
│  │         External APIs                 │                   │
│  │  • Kimi (content generation)         │                   │
│  │  • Firecrawl (web scraping)          │                   │
│  │  • GitHub (research)                 │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Learning Platform
- **6 Topic Categories**: React Hooks, Next.js Core, Third-Party API, Server-Side, Advanced, AI Integration
- **Spaced Repetition**: SM-2 algorithm with 1d/3d/5d/10d/21d intervals
- **3D Flashcards**: Flip animation with code snippets and memory hooks
- **Progress Tracking**: Category rings, streak counter, mastery levels

### Content Pipeline
- **DocScraper**: Extracts topics from Next.js/React docs via Firecrawl
- **FlashcardEngine**: Generates recall-focused cards via Kimi API
- **CronResearcher**: Discovers new topics from GitHub every 72 hours

## Database Schema

```sql
topics (id, title, slug, category, difficulty, ...)
flashcards (id, topic_id, card_front, card_back, memory_hook, ...)
user_card_progress (card_id, repetition, interval_days, easiness_factor, ...)
```

## Environment Variables

```env
KIMI_API_KEY=sk-kimi-frjm5M12yVIlaEG5cXli3ptRj9ZHJjNEovLeD7uQUhfzoyTeiAhCz6IWkmcL7Ttp
FIRECRAWL_API_KEY=fc-c8eab1af2ac54bd380a062d4d7f408fb
CRON_SECRET=your-secret-key-here
```

## Project Structure

```
devlens/
├── docker-compose.yml      # Orchestrates all services
├── init.sql                # PostgreSQL schema + sample data
├── .env.example            # Environment template
├── cron/
│   └── Dockerfile          # Research agent scheduler
├── my-app/
│   ├── Dockerfile          # Next.js app
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   ├── lib/
│   │   │   ├── agents/     # AI agents (Kimi, Firecrawl)
│   │   │   ├── db.ts       # PostgreSQL client
│   │   │   ├── queries.ts  # Database queries
│   │   │   └── sm2.ts      # SM-2 algorithm
│   │   └── types/          # TypeScript types
│   └── next.config.ts      # Standalone output
└── docs/
    └── PRD.md              # Full specification
```

## Sample Data Included

| Topic | Category | Difficulty |
|-------|----------|------------|
| useTransition | React Hooks | 4/5 |
| Partial Prerendering | Next.js Core | 4/5 |
| Server Actions + Optimistic UI | Server-Side | 4/5 |
| Stripe Webhooks | Third-Party API | 3/5 |
| Turborepo Shared Packages | Advanced | 5/5 |
| Vercel AI SDK Streaming | AI Integration | 3/5 |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/topics` | GET | List topics (optional ?category=) |
| `/api/flashcards?due=today` | GET | Get due cards |
| `/api/flashcards/[id]/review` | PATCH | Submit review rating |
| `/api/cron/research` | POST | Trigger research agent |
| `/api/seed` | POST | Populate with scraped topics (dev) |

## Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Database shell
docker-compose exec db psql -U devlens -d devlens

# Stop
docker-compose down

# Clean slate
docker-compose down -v
docker-compose up -d
```

## Next Steps

1. **Deploy**: `docker-compose up -d`
2. **Verify**: Visit http://localhost:3000
3. **Review**: Start a flashcard session
4. **Extend**: Add more topics via `/api/seed` or wait for cron

---

Built in ~30 minutes. Ready to ship.
