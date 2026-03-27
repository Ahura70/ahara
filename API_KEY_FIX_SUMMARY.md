# Āhāra Image Analysis Fix - Root Cause & Solution

## Problem
The deployed Vercel app was showing "failed to analyze image" errors even though the `VITE_GEMINI_API_KEY` was added to Vercel's environment variables.

## Root Cause Identified
**Location:** `vite.config.ts` line 11

The Vite build configuration had a **broken environment variable define** that prevented the API key from being injected:

```typescript
// WRONG - This was trying to load env.GEMINI_API_KEY (no VITE_ prefix)
// But the .env file has VITE_GEMINI_API_KEY, so env.GEMINI_API_KEY was undefined
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

Meanwhile, the code in `src/lib/gemini.ts` expected:
```typescript
// This looks for import.meta.env.VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**The mismatch:** The manual define was never executed (undefined), and it was also looking in the wrong place (process.env vs import.meta.env).

## Solution Implemented
✅ **Commit:** `76945cc` pushed to GitHub

Removed the broken `define` from `vite.config.ts`. Vite automatically exposes all `VITE_*` prefixed environment variables via `import.meta.env.*`, so the custom define was unnecessary and incorrect.

**Before:**
```typescript
const env = loadEnv(mode, '.', '');
return {
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },
  // ... rest
```

**After:**
```typescript
return {
  plugins: [react(), tailwindcss()],
  // ... rest (no broken define)
```

## Next Steps to Deploy
1. **Pull the latest changes** from GitHub (commit 76945cc)
2. **Redeploy to Vercel** - This will trigger a new build with the fixed configuration
3. The `VITE_GEMINI_API_KEY` environment variable you already added to Vercel will now be **properly injected** into the build
4. Test the app - image analysis should now work

## Why This Fixes It
- Vite's build process now correctly injects `VITE_GEMINI_API_KEY` at build time
- The code accesses it via `import.meta.env.VITE_GEMINI_API_KEY` (which Vite provides automatically)
- In development: Uses `.env.local` file
- In Vercel: Uses the environment variable you set in Vercel's dashboard
- The API key will be embedded in the built JavaScript, allowing the GoogleGenAI client to authenticate with Google's API

## Verification
✅ Local build tested and successful (commit builds without errors)
✅ Fix matches how Vite is designed to work with environment variables
✅ Code in `src/lib/gemini.ts` already expects `import.meta.env.VITE_GEMINI_API_KEY`
