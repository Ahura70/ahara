# Deploy to Vercel (Easiest Path)

Your app is ready to deploy to Vercel with zero configuration needed.

## What You Have

✅ GitHub repository: https://github.com/Ahura70/ahara
✅ Vite build configured
✅ vercel.json already set up
✅ All code committed

## Deploy in 2 Minutes

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/import
2. Click "Import Git Repository"
3. Select: `Ahura70/ahara`
4. Click "Import"

### Step 2: Set Environment Variables (Optional)

Vercel auto-detects your build and will deploy automatically.

If you want to add environment variables (Gemini API key, Firebase credentials):

1. In Vercel project → Settings → Environment Variables
2. Add these 8 variables (from your `.env.local`):
   - `VITE_GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Click "Save and Redeploy"

### Done! 🎉

Your app is now live. Every push to `main` auto-deploys.

Live URL: `https://ahara-*.vercel.app` (Vercel will show you the exact URL)

## Why Vercel?

- ✅ Zero configuration needed
- ✅ Auto-deploys on every push
- ✅ Serverless functions supported
- ✅ Free tier includes generous limits
- ✅ Custom domain support
- ✅ Better DX than Firebase Hosting

## Need to Deploy Now?

If you want to skip Vercel and deploy locally to Firebase instead:

```bash
npm run build
firebase login:ci
firebase deploy --token [TOKEN_YOU_GET]
```

The live URL will be: `https://ahara-116e0.web.app`
