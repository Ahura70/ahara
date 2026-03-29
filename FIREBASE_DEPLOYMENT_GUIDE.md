# Firebase Hosting Automated Deployment Guide

Your app is ready to deploy to Firebase Hosting with automated CI/CD using GitHub Actions.

## What's Configured

✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
✅ Firebase configuration (`.firebaserc`, `firebase.json`)
✅ All source code pushed to GitHub

## Setup Steps (5 minutes)

### Step 1: Generate Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ahara-116e0**
3. Click Settings (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file (keep it private!)

### Step 2: Add GitHub Secret

1. Go to your GitHub repo: `https://github.com/Ahura70/ahara`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT_JSON`
5. Value: Paste the entire contents of the JSON file from Step 1
6. Click **Add secret**

### Step 3: Add Environment Variables

Add these GitHub secrets (Settings → Secrets):

| Secret Name | Value |
|------------|-------|
| `VITE_GEMINI_API_KEY` | AIzaSyAGbbpNiEfkK6kWowU4or7DzRis8u1m47Y |
| `VITE_FIREBASE_API_KEY` | AIzaSyDeYseVfGyHuUv_GodgxvPMg85aovpoqyU |
| `VITE_FIREBASE_AUTH_DOMAIN` | ahara-116e0.firebaseapp.com |
| `VITE_FIREBASE_DATABASE_URL` | https://ahara-116e0-default-rtdb.firebaseio.com |
| `VITE_FIREBASE_PROJECT_ID` | ahara-116e0 |
| `VITE_FIREBASE_STORAGE_BUCKET` | ahara-116e0.firebasestorage.app |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 234239774853 |
| `VITE_FIREBASE_APP_ID` | 1:234239774853:web:e0458e2dd7929db57b99ec |

### Step 4: Push Workflow File

The workflow file is committed locally. You need to push with proper GitHub credentials:

```bash
cd ahara-app
git push origin main
```

(If you get a token error, use a Personal Access Token with `workflow` scope, or use SSH)

### Step 5: Verify Deployment

1. Push any change to `main` branch
2. Go to GitHub repo → **Actions** tab
3. Watch the workflow run
4. Once complete, your app is live at:
   ```
   https://ahara-116e0.web.app
   ```

## Future Deployments

Every push to `main` automatically builds and deploys! 🚀

No manual steps needed—just `git push`.

## Troubleshooting

**Q: Workflow fails with "Permission denied"**
- Check that `FIREBASE_SERVICE_ACCOUNT_JSON` secret is set correctly

**Q: Can't push workflow file**
- Your PAT needs `workflow` scope, or use SSH keys

**Q: Need to redeploy without code changes**
- Go to Actions → Select workflow run → Click **Re-run all jobs**

## Local Firebase Deployment (Alternative)

If you want to deploy locally instead:

```bash
firebase login:ci
# Copy the token it gives you
firebase deploy --token [TOKEN]
```
