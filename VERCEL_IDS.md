# Get Vercel Org ID and Project ID

## Method 1: Vercel Dashboard (Easiest)

### Get ORG_ID:
1. Go to https://vercel.com/dashboard
2. Click your profile picture (top right)
3. Click "Settings"
4. Look at the URL or page - your org ID is shown as:
   - Personal: `team_xxxxxxxxxx` or your username
   - Team: `team_xxxxxxxxxx`

### Get PROJECT_ID:
1. Go to https://vercel.com/dashboard
2. Click on your project (or create new)
3. Look at the URL: `vercel.com/username/project-name`
4. Click "Settings" tab
5. Scroll down to "Project ID" - copy the value (looks like `prj_xxxxxxxxxx`)

## Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login (opens browser)
vercel login

# Link your project
cd my-app
vercel link

# Read the IDs
cat .vercel/project.json
```

Output:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxx"
}
```

## Method 3: Environment Variables (If already deployed)

If you've deployed before, check your Vercel project:
1. Go to Project → Settings → Environment Variables
2. Look for `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

## Quick Steps

1. **Create project on Vercel:**
   - Go to https://vercel.com/new
   - Import from GitHub: `bijbrin/flashcard`
   - Framework: Next.js
   - Root Directory: `my-app`
   - Deploy

2. **Get the IDs from project settings:**
   - Org ID: Settings → General → Team ID (starts with `team_`)
   - Project ID: Settings → General → Project ID (starts with `prj_`)

3. **Add to GitHub secrets:**
   - Go to https://github.com/bijbrin/flashcard/settings/secrets/actions
   - Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

## Example IDs

```
VERCEL_ORG_ID=team_q1234567890abcdef
VERCEL_PROJECT_ID=prj_abcdefghijklmnop
```
