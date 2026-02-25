# DevLens — Simplified Architecture

## Changes Made
- Removed Supabase dependency → Using PostgreSQL directly
- Simplified agent system → Core scraping still works
- Docker Compose ready → One command to deploy
- Local-first → No external DB required

## Deployment
```bash
cd devlens
docker-compose up -d
```

## Services
- `app`: Next.js 16 application
- `db`: PostgreSQL 15 with initial schema
- `cron`: Scheduled research agent

## Environment Variables
See `.env.example` for required variables.
