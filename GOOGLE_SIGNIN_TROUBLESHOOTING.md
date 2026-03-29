# Google Sign-In Troubleshooting Guide

## Error: "Failed to sign in with Google"

This guide walks through diagnosing and fixing Firebase Google authentication issues.

---

## Quick Checklist

- [ ] Web app registered in Firebase console
- [ ] Google provider enabled in Authentication → Sign-in method
- [ ] Authorized domains configured
- [ ] Environment variables loaded correctly
- [ ] API key has proper permissions

---

## Step 1: Verify Web App is Registered

**Firebase Console:**
1. Go to https://console.firebase.google.com/project/ahara-116e0/settings/general
2. Look for "Your apps" section
3. Should see a web app registered (looks like a `</>` icon)
4. If NOT listed, click "Add app" → "Web" and register your domain

**Expected Info:**
```
apiKey: AIzaSyDeYseVfGyHuUv_GodgxvPMg85aovpoqyU
authDomain: ahara-116e0.firebaseapp.com
projectId: ahara-116e0
```

---

## Step 2: Enable Google Sign-In Provider

**Firebase Console:**
1. Go to https://console.firebase.google.com/project/ahara-116e0/authentication/providers
2. Look for "Google" in the providers list
3. If not listed or says "Disabled":
   - Click on Google
   - Toggle "Enable" switch to ON
   - A dialog will appear asking for "Project support email"
   - Select an email address from dropdown
   - Click "Save"

**What you should see:**
- Google provider with "✓ Enabled" status

---

## Step 3: Authorize Your Domain

**Firebase Console:**
1. Still in Authentication → Providers
2. Scroll down to "Authorized domains"
3. Should list domains where auth will work:
   - `localhost` (for local testing)
   - `your-domain.com` (for production)
   - `*.vercel.app` (if deploying to Vercel)

**To add a domain:**
1. Click "Add domain"
2. Enter your domain (e.g., `ahara-116e0.web.app` for Firebase Hosting, or `yourdomain.vercel.app` for Vercel)
3. Click "Add"

---

## Step 4: Verify Environment Variables

**Run this in your project terminal:**

```bash
# Check if environment variables are loaded
npm run dev

# Then check browser console for initialization logs
# You should see something like:
# "Firebase initialized with project: ahara-116e0"
```

**If variables are missing:**
```bash
# Copy .env.local variables to .env.production for Vercel
cp .env.local .env.production

# Or set them manually:
export VITE_FIREBASE_API_KEY="AIzaSyDeYseVfGyHuUv_GodgxvPMg85aovpoqyU"
export VITE_FIREBASE_AUTH_DOMAIN="ahara-116e0.firebaseapp.com"
export VITE_FIREBASE_PROJECT_ID="ahara-116e0"
```

---

## Step 5: Check API Key Permissions

**Google Cloud Console:**
1. Go to https://console.cloud.google.com/apis/credentials?project=ahara-116e0
2. Find your API Key (looks like `AIzaSy...`)
3. Click on it to edit
4. Under "API restrictions", ensure it says:
   - "Don't restrict key" (recommended for development)
   - OR ensure "Identity and Access Management (IAM) API" is selected

---

## Step 6: Verify Code Configuration

**Check `src/config/firebase.ts`:**

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other fields
};
```

**This should match your Firebase console values exactly.**

---

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:5173
# Try Google sign-in
# Check browser console (F12) for detailed error messages
```

### Production Testing (Vercel/Firebase Hosting)
1. Deploy your app
2. Visit the live URL
3. Try Google sign-in
4. Check browser console for errors

---

## Common Error Messages & Fixes

### "Unauthorized Domain"
**Fix:** Add your domain to Authorized domains (Step 3)

### "Invalid API Key"
**Fix:**
- Verify API key in .env matches Firebase console
- Check API key has no IP/HTTP restrictions

### "Popup Blocked"
**Fix:**
- Allow popups in browser settings
- Or try in incognito/private mode
- The app has fallback to redirect method

### "Network Error"
**Fix:**
- Check internet connection
- Verify domain is accessible
- Check CORS settings if using custom domain

---

## Debug Mode

**Enable detailed logging:**

```typescript
// In src/lib/auth.ts, add this to signInWithGoogle():
console.log('🔍 Starting Google sign-in');
console.log('🔧 Auth Config:', {
  projectId: auth.app.options.projectId,
  authDomain: auth.app.options.authDomain,
});

try {
  const result = await signInWithPopup(auth, googleProvider);
  console.log('✅ Google sign-in successful:', result.user.email);
} catch (error: any) {
  console.error('❌ Google sign-in failed:', {
    code: error.code,
    message: error.message,
    custom: error.custom,
  });
  throw error;
}
```

---

## Still Not Working?

1. **Check browser console (F12)** for the exact error message
2. **Share the full error code** (e.g., `auth/popup-blocked`, `auth/unauthorized-domain`)
3. **Verify project ID** matches across:
   - Firebase console
   - .env.local
   - .env.production
   - firebaseConfig in code
4. **Try incognito/private mode** to bypass popup blockers
5. **Clear browser cache** and refresh

---

## For Deployed Apps (Vercel/Firebase Hosting)

If sign-in works locally but fails on production:

1. **Add your production domain to Authorized domains** (Step 3)
2. **Set environment variables** in Vercel/Firebase console:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
3. **Redeploy** after changing environment variables
4. **Wait 2-3 minutes** for domain whitelist to update

---

## Contact Firebase Support

If none of this works:
- Go to https://console.firebase.google.com/support
- Create a ticket with:
  - Project ID: `ahara-116e0`
  - Error message from browser console
  - Steps to reproduce
