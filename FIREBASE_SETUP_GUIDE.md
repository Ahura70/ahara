# Firebase Setup Guide for Āhāra

## Overview
The app now includes:
- ✅ Google & Apple OAuth authentication
- ✅ Optional guest mode (no login required)
- ✅ Cloud data persistence with Firebase Realtime Database
- ✅ Auto-syncing of preferences and weekly plans across devices

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `ahara-ai`
4. Accept terms and click **"Create project"**
5. Wait for project to initialize (~1 minute)

## Step 2: Set Up Firebase Authentication

### Enable Google Sign-In
1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. On the **Sign-in method** tab, click **Google**
4. Enable it and select your project email
5. Click **"Save"**

### Enable Apple Sign-In
1. Still in **Authentication > Sign-in method**
2. Click **"Add new provider" > Apple**
3. Enable it
4. Click **"Save"**
   - Note: Apple sign-in requires a real domain (not localhost). For testing, use Google sign-in.

## Step 3: Set Up Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose region (e.g., `us-east1`)
4. Choose **"Start in test mode"** (for development)
5. Click **"Enable"**
6. Copy the **Database URL** (looks like: `https://your-project.firebaseio.com`)

### Set Database Rules (for production)
Replace the default rules with:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        ".validate": "newData.hasChildren(['preferences', 'weeklyPlan'])"
      }
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll to **"Your apps"** section
3. If no web app exists, click **"< >"** to create one
4. Register app with name `ahara-web`
5. Copy the configuration object

The config will look like:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ahara-ai.firebaseapp.com",
  databaseURL: "https://ahara-ai-default-rtdb.firebaseio.com",
  projectId: "ahara-ai",
  storageBucket: "ahara-ai.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

## Step 5: Configure Environment Variables

### Local Development (.env.local)
Create/update `.src/env.local`:
```
VITE_GEMINI_API_KEY="your_existing_gemini_key"

VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="ahara-ai.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://ahara-ai-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="ahara-ai"
VITE_FIREBASE_STORAGE_BUCKET="ahara-ai.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
```

### Vercel Deployment
1. Go to your Vercel project **Settings > Environment Variables**
2. Add all 7 Firebase variables with `VITE_` prefix:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. **Redeploy** your app from Vercel dashboard

## Step 6: Test Authentication Locally

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. You should see the login screen with:
   - **Sign in with Google** button
   - **Sign in with Apple** button (web only, may not work on localhost)
   - **Continue as Guest** button

### Test Flow
1. Click **"Sign in with Google"**
2. Complete Google authentication
3. You'll be redirected to preferences screen
4. Set preferences and click **"Save"**
5. App navigates to camera screen
6. Preferences auto-save to Firebase in real-time

### Test Data Sync
1. Go to **Perfect Matches** screen
2. Click settings icon (gear) in top right
3. Change a preference
4. Click **"Save"**
5. Check [Firebase Console > Realtime Database](https://console.firebase.google.com)
6. Expand **"users" > your_uid > "preferences"**
7. Verify your changes are there!

## Step 7: Deploy to Vercel

1. Commit and push your code to GitHub:
```bash
git add .
git commit -m "feat: Add Firebase authentication and cloud persistence"
git push
```

2. Vercel auto-deploys on push, OR manually redeploy:
   - Go to Vercel Dashboard
   - Select **ahara** project
   - Click **"Deployments"**
   - Click **"Redeploy"** on latest deployment

3. Wait for deployment (~2-3 minutes)

4. Test production app at your Vercel URL:
   - Open app and test Google sign-in
   - Verify preferences save to cloud
   - Test across devices/incognito windows

## Features Implemented

### 1. **Authentication**
- ✅ Google OAuth sign-in
- ✅ Apple OAuth sign-in
- ✅ Guest mode (optional login)
- ✅ Persistent login (survives page reloads)

### 2. **Data Persistence**
- ✅ User preferences saved to Firebase Realtime DB
- ✅ Weekly meal plan synced to cloud
- ✅ Real-time sync across browser tabs/devices
- ✅ Auto-sync when data changes

### 3. **User Experience**
- ✅ Direct navigation to camera after setup
- ✅ Edit preferences button on Perfect Matches screen
- ✅ Preferences auto-load for returning users
- ✅ Guest mode for quick testing (data not saved)

## Troubleshooting

### "Error: Missing or invalid VITE_FIREBASE_API_KEY"
**Solution:** Ensure all FIREBASE env vars are set in:
- `.env.local` for local dev
- Vercel Environment Variables for production

### "Auth error: code auth/configuration-not-found"
**Solution:** Check Firebase Console > Project Settings > ensure web app is registered

### "Database permission denied"
**Solution:** In Firebase Console > Realtime Database > Rules, replace with the provided rules (in Step 3)

### "Google sign-in not working"
**Solution:**
- Add `localhost:5173` to Firebase Console > Authentication > Settings > Authorized domains
- Or test with the actual domain after Vercel deployment

### Guest mode not saving data
**This is by design.** Guest mode doesn't persist data to Firebase. Users must sign in to save preferences.

## Files Modified/Created

**New files:**
- `src/config/firebase.ts` - Firebase initialization
- `src/lib/auth.ts` - Authentication functions
- `src/lib/persistence.ts` - Data sync with Firebase
- `src/components/LoginScreen.tsx` - New login UI

**Modified files:**
- `src/store.tsx` - Added auth state & Firebase sync
- `src/App.tsx` - Initialize auth & use LoginScreen
- `src/components/Matches.tsx` - Added edit preferences button
- `package.json` - Added firebase dependency
- `.env.example` - Added Firebase config documentation

## Next Steps

1. ✅ Create Firebase project
2. ✅ Configure authentication (Google & Apple)
3. ✅ Set up Realtime Database
4. ✅ Add environment variables to Vercel
5. ✅ Redeploy to Vercel
6. ✅ Test authentication flow
7. ✅ Verify cloud persistence
