# Get Vercel Secrets

## Step 1: Login to Vercel
```bash
npx vercel login
```
Follow the browser authentication.

## Step 2: Link Project
```bash
cd my-app
npx vercel link
```
This creates `.vercel/project.json` with your IDs.

## Step 3: Get the Values
```bash
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

## Step 4: Get Token
Go to https://vercel.com/account/tokens → Create Token

## Step 5: Add to GitHub
Go to https://github.com/bijbrin/flashcard/settings/secrets/actions

Add these secrets:
- `VERCEL_TOKEN` = your token
- `VERCEL_ORG_ID` = team_xxx from project.json
- `VERCEL_PROJECT_ID` = prj_xxx from project.json

## Alternative: Manual Deploy
If you don't want GitHub Actions:
```bash
cd my-app
npx vercel --prod
```
