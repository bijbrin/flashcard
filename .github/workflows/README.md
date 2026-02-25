# GitHub Actions Setup

## Required Secrets

Add these secrets to your GitHub repository:

### Vercel Secrets
1. `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
2. `VERCEL_ORG_ID` - From your Vercel project settings
3. `VERCEL_PROJECT_ID` - From your Vercel project settings

### App Secrets
4. `DATABASE_URL` - Your PostgreSQL connection string
5. `KIMI_API_KEY` - sk-kimi-frjm5M12yVIlaEG5cXli3ptRj9ZHJjNEovLeD7uQUhfzoyTeiAhCz6IWkmcL7Ttp
6. `FIRECRAWL_API_KEY` - fc-c8eab1af2ac54bd380a062d4d7f408fb
7. `CRON_SECRET` - Any random secret for cron auth

## How to Get Vercel Secrets

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (run in my-app/ directory)
cd my-app
vercel link

# Get the values from .vercel/project.json
cat .vercel/project.json
```

## Deployment Flow

1. Push to `main` branch
2. GitHub Actions triggers
3. Builds the Next.js app
4. Deploys to Vercel production

## Manual Deploy

```bash
cd my-app
vercel --prod
```
