# Google Sign-In: Quick Fix Steps

## The Problem
You're getting "Failed to sign in with Google" when trying to authenticate.

## Root Causes (in order of likelihood)

1. **Web app not registered in Firebase** ← Most common
2. **Google provider not enabled** ← Second most common
3. **Domain not in authorized list** ← Very common
4. **Google OAuth credentials missing/invalid**
5. **Popup blocker interfering**

---

## IMMEDIATE FIX (5 minutes)

### 1. Register Your Web App

**Go to:** https://console.firebase.google.com/project/ahara-116e0/settings/general

**Look for:** "Your apps" section with `</>` icon

**If NOT present:**
1. Click "Add app"
2. Select "Web"
3. Name it: `Ahara Web`
4. Check "Also set up Firebase Hosting"
5. Click "Register app"

**This gives you the API credentials needed for sign-in.**

---

### 2. Enable Google Provider

**Go to:** https://console.firebase.google.com/project/ahara-116e0/authentication/providers

**Find Google in the list:**
1. If says "Disabled" or missing: Click on "Google"
2. Toggle "Enable" switch to **ON**
3. Set "Project support email" (select from dropdown)
4. Click "Save"

**Expected result:** Google shows "✓ Enabled"

---

### 3. Add Your Domain to Authorized List

**Still in Authentication → Providers page:**

Scroll to "Authorized domains" section.

**Add these domains:**
- If testing locally: `localhost`
- If using Vercel: `yourdomain.vercel.app`
- If using Firebase Hosting: `ahara-116e0.web.app`

**To add:**
1. Click "Add domain"
2. Type your domain
3. Click "Add"

---

### 4. Update Environment Variables

If you changed anything in Firebase settings, update your `.env.local`:

```bash
VITE_FIREBASE_API_KEY="AIzaSyDeYseVfGyHuUv_GodgxvPMg85aovpoqyU"
VITE_FIREBASE_AUTH_DOMAIN="ahara-116e0.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ahara-116e0"
VITE_FIREBASE_APP_ID="1:234239774853:web:e0458e2dd7929db57b99ec"
```

**Stop** your dev server and **restart** for changes to take effect:
```bash
npm run dev
```

---

## Test the Fix

### Option A: Quick Diagnostic
1. Copy `firebase-diagnostics.html` from your project
2. Open it in a browser (double-click the file)
3. It will run checks and let you test Google Sign-In

### Option B: Test in Your App
1. Go to http://localhost:5173 (or your deployed URL)
2. Click "Sign in with Google"
3. Check browser console (F12) for any error messages

---

## If Still Not Working

**Check browser console for the exact error:**

| Error Code | Fix |
|-----------|-----|
| `unauthorized-domain` | Add your domain to Authorized domains (Step 3) |
| `invalid-api-key` | Verify API key in Firebase matches your `.env` |
| `popup-blocked` | Allow popups or use incognito mode |
| `operation-not-supported` | Don't use `file://` URLs, use `http://localhost:5173` |
| `auth/configuration-not-found` | Web app not registered (Step 1) |

---

## Verify Everything is Connected

**Run this in your browser console while at your app:**

```javascript
// Check if Firebase is initialized
console.log(window.__FIREBASE_DEVTOOLS__)

// Or check auth config
// (Your app should log this on startup)
// Look for: "Firebase initialized with project: ahara-116e0"
```

---

## Deployment Checklist

If deploying to **Vercel** or **Firebase Hosting**:

- [ ] Web app registered in Firebase
- [ ] Google provider enabled
- [ ] Your deployment domain in Authorized domains
- [ ] Environment variables set in deployment platform
- [ ] Redeployed after changes
- [ ] Waited 2-3 minutes for changes to propagate

---

## Still Having Issues?

1. **Check the troubleshooting guide:** `GOOGLE_SIGNIN_TROUBLESHOOTING.md`
2. **Run diagnostics:** Use `firebase-diagnostics.html`
3. **Check browser console (F12)** for detailed error messages
4. **Verify each step above** is completed
5. **Try incognito/private mode** to bypass extensions/blockers

---

## Common Mistake

❌ **WRONG:** Testing from `file://` protocol
```
file:///Users/username/ahara-app/index.html
```

✅ **RIGHT:** Use local dev server
```
npm run dev
# Then visit: http://localhost:5173
```

Firebase auth ONLY works on `http://` or `https://` URLs.

---

## Firebase Documentation

- [Enable Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Authorized Domains](https://firebase.google.com/docs/auth/web/manage-users#sign_in_a_user_with_a_google_account)
- [Troubleshooting](https://firebase.google.com/docs/auth/troubleshoot-auth)
