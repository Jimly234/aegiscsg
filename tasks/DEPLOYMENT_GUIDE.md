# AEGIS CSG — Complete Deployment Guide

> **System**: Community Safety Guardian — Emergency alert, AI threat analysis, real-time maps
> **Stack**: React + Vite + TypeScript · Supabase (DB + Edge Functions + Realtime) · Google Maps · Vercel
> **Repo**: https://github.com/Jimly234/aegiscsg
> **Supabase project**: `mnxeqxgesletaddvcouy`

### ✅ Completed — nothing left to do on these
| Step | Status |
|------|--------|
| GitHub — code pushed (2 commits) | ✅ Done |
| Supabase — `GEMINI_API_KEY` secret set | ✅ Done |
| Supabase — `oracle-analyze` Edge Function deployed (Gemini 2.5 Flash direct) | ✅ Done |
| Oracle AI — live-tested, Gemini API responding | ✅ Done |
| Maps API key — moved to `VITE_GOOGLE_MAPS_API_KEY` env var | ✅ Done |

### ⏳ One step remaining — Vercel (you do this in the browser, takes ~5 min)
See **Section 6** below for exact instructions with your real values pre-filled.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Push Code to GitHub](#3-step-1--push-code-to-github)
4. [Step 2 — Supabase Backend Setup](#4-step-2--supabase-backend-setup)
5. [Step 3 — Deploy Oracle AI Edge Function](#5-step-3--deploy-oracle-ai-edge-function)
6. [Step 4 — Vercel Web Deployment](#6-step-4--vercel-web-deployment)
7. [Step 5 — Mobile Deployment (PWA)](#7-step-5--mobile-deployment-pwa)
8. [Step 6 — Continuous Deployment](#8-step-6--continuous-deployment)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Testing Everything End-to-End](#10-testing-everything-end-to-end)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER DEVICES                           │
│  Web Browser (Vercel)  │  Mobile PWA  │  Android/iOS App   │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│               VERCEL CDN (Web Frontend)                     │
│  React + Vite SPA · vercel.json rewrites · auto-deploy      │
│  from GitHub main branch on every push                      │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          SUPABASE (mnxeqxgesletaddvcouy)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │  Realtime    │  │  Edge Functions  │  │
│  │  (8 tables)  │  │  (WebSocket) │  │  oracle-analyze  │  │
│  │  RLS active  │  │  alerts,     │  │  Gemini 2.5 Flash│  │
│  └──────────────┘  │  units       │  └──────────────────┘  │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE MAPS PLATFORM                           │
│  Maps JavaScript API · Advanced Markers · Custom styling    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
- **Alerts** are created in Supabase → Realtime pushes to all connected clients instantly
- **Oracle AI** is triggered from the frontend → Supabase Edge Function calls Gemini → SSE stream back
- **Maps** render live alert pins, unit positions, risk zones directly from Zustand store
- **Chat** messages persist to Supabase `chat_messages` table → Realtime sync across guardians

---

## 2. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Git | Any | Version control |
| Node.js | 18+ | Local dev server |
| Supabase CLI | 1.207+ | Edge Function deploy |
| Vercel CLI | Optional | Manual deploys |

Install Supabase CLI:
```bash
npm install -g supabase
```

---

## 3. Step 1 — Push Code to GitHub ✅ DONE

> **Status**: Already completed. Code is live at https://github.com/Jimly234/aegiscsg

If you ever need to push updates manually:

```bash
cd /path/to/project
git add -A
git commit -m "your update message"
git push origin master
```

> Vercel auto-deploys on every push to `main` or `master`.

---

## 4. Step 2 — Supabase Backend Setup ✅ DONE

> All tables, RLS policies, Realtime publications, secrets, and Edge Functions are already deployed.

### What was deployed
- **8 tables**: `alerts`, `response_units`, `risk_zones`, `guardians`, `community_reports`, `chat_messages`, `alert_log_entries`, `system_stats`
- **RLS policies**: public read on alerts/units/zones, authenticated write on chat/reports
- **Realtime**: `alerts` and `response_units` tables publish changes via WebSocket
- **Secret**: `GEMINI_API_KEY` set on project `mnxeqxgesletaddvcouy`
- **Edge Function**: `oracle-analyze` deployed, calling `gemini-2.5-flash` directly

### Verify in the Supabase dashboard
- Tables: https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/editor
- Edge Functions: https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/functions
- Secrets: https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/settings/vault

### If you ever need to re-run the migration
```bash
# Paste contents of supabase/migrations/00001_aegis_csg_core_schema.sql into:
# https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/sql
```

---

## 5. Step 3 — Deploy Oracle AI Edge Function ✅ DONE

> Already deployed. Function URL: `https://mnxeqxgesletaddvcouy.supabase.co/functions/v1/oracle-analyze`

### What's deployed
- **Function**: `oracle-analyze` — Gemini 2.5 Flash streaming threat analysis
- **Secret**: `GEMINI_API_KEY` set and verified (Gemini API responds live)
- **Model**: `gemini-2.5-flash` via direct Google AI REST API
- **CORS**: Configured for all origins (open for demo)

### Test it now
```bash
curl -X POST \
  https://mnxeqxgesletaddvcouy.supabase.co/functions/v1/oracle-analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVxeGdlc2xldGFkZHZjb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTkwNTcsImV4cCI6MjA5NjY5NTA1N30.xACkhvz6L5UoL6nYrnG0R19eSkLReahKagxY6nC4Urk" \
  -H "Content-Type: application/json" \
  -d '{"type":"alert","alert":{"id":"TEST001","victimName":"Jane Doe","priority":"critical","address":"Kaduna, Nigeria","aiThreatScore":0.85,"audioStreaming":true}}'
```

Expected: SSE stream with `threatScore`, `threatLevel`, `summary`, `recommendation` JSON fields.

### Logs dashboard
https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/functions/oracle-analyze/logs

### If you need to redeploy after a code change
```bash
# Login with your Supabase Management API token (sbp_...)
SUPABASE_ACCESS_TOKEN=<your-sbp-token> \
  supabase functions deploy oracle-analyze --project-ref mnxeqxgesletaddvcouy --no-verify-jwt
```

---

## 6. Step 4 — Vercel Web Deployment ⏳ YOUR NEXT ACTION (5 minutes)

> This is the **only remaining step**. Everything else is done.

### 6.1 Import the repo to Vercel

1. Open: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. If this is your first time: click **"Connect GitHub"** and authorise Vercel
4. Find and select **`Jimly234/aegiscsg`**
5. Click **"Import"**

### 6.2 Build settings (Vercel auto-detects these — just confirm)

| Setting | Value |
|---------|-------|
| Framework Preset | **Vite** |
| Root Directory | `.` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> The `vercel.json` already in the repo handles SPA rewrites, security headers, and asset caching.

### 6.3 Add environment variables — copy these exactly

In the **"Environment Variables"** section before clicking Deploy, add all three:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://mnxeqxgesletaddvcouy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVxeGdlc2xldGFkZHZjb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTkwNTcsImV4cCI6MjA5NjY5NTA1N30.xACkhvz6L5UoL6nYrnG0R19eSkLReahKagxY6nC4Urk` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyBDv4vLVRRPy9-zNjOOOdPGjEatcpuhWYs` |

Set all three for **Production**, **Preview**, and **Development** environments.

> ⚠️ Never add `service_role` key or `GEMINI_API_KEY` here — those stay server-side in Supabase only.

### 6.4 Deploy

Click **"Deploy"**. The build takes ~60–90 seconds. When it finishes:

- Your live URL will be: `https://aegiscsg.vercel.app` (or similar)
- Every future `git push origin master` will auto-deploy a new version

### 6.5 Post-deploy: add your Vercel URL to Supabase allowed origins

1. Go to: https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/auth/url-configuration
2. Set **Site URL** to your Vercel URL (e.g. `https://aegiscsg.vercel.app`)
3. Add to **Redirect URLs**: `https://aegiscsg.vercel.app/**`

### 6.6 Post-deploy: restrict the Google Maps API key (recommended)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find the key `AIzaSyBDv4vLVRRPy9-zNjOOOdPGjEatcpuhWYs`
3. Under **Application restrictions** → select **HTTP referrers**
4. Add: `https://aegiscsg.vercel.app/*`
5. Save

---

## 7. Step 5 — Mobile Deployment (PWA)

AEGIS CSG is a **Progressive Web App (PWA)**. Users on mobile get a native-app-like experience without any app store.

### 7.1 What users get on mobile

- Full-screen experience (no browser UI)
- Works offline with cached data
- Push notification ready (requires additional setup)
- Add to Home Screen prompt on iOS Safari and Android Chrome

### 7.2 Enable PWA (add manifest + service worker)

Add these two files to the project:

**`public/manifest.json`:**
```json
{
  "name": "AEGIS CSG",
  "short_name": "AEGIS",
  "description": "Community Safety Guardian — Emergency Response System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1628",
  "theme_color": "#ef4444",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`index.html` — add inside `<head>`:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#ef4444" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### 7.3 How to install on mobile

**iOS (Safari):**
1. Open `https://aegiscsg.vercel.app` in Safari
2. Tap the **Share** button (bottom toolbar)
3. Select **Add to Home Screen**
4. Tap **Add**

**Android (Chrome):**
1. Open `https://aegiscsg.vercel.app` in Chrome
2. Chrome will show "Add to Home screen" banner automatically
3. Or: tap the 3-dot menu → **Add to Home screen**

### 7.4 Native app packaging (optional — React Native / Capacitor)

For full native distribution on App Store / Play Store:

**Using Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "AEGIS CSG" com.aegis.csg
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # Opens in Android Studio
npx cap open ios       # Opens in Xcode
```

---

## 8. Step 6 — Continuous Deployment

Once Vercel is connected to GitHub, **every push to `main` branch automatically triggers a new deployment**.

### 8.1 Workflow

```
Local changes
     │
     ▼
git add . && git commit -m "feat: ..."
     │
     ▼
git push origin main
     │
     ▼
GitHub receives push → triggers Vercel webhook
     │
     ▼
Vercel builds (usually 60–120 seconds)
     │
     ▼
New version live at aegiscsg.vercel.app ✅
```

### 8.2 Preview deployments

Every pull request gets its own preview URL:
- `https://aegiscsg-git-feature-branch-jimly234.vercel.app`

This lets you test changes before merging to `main`.

### 8.3 Rollback

In Vercel Dashboard → Deployments, click any previous deployment → **Promote to Production** to instantly roll back.

---

## 9. Environment Variables Reference

### Web (Vercel) — add all three

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://mnxeqxgesletaddvcouy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVxeGdlc2xldGFkZHZjb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTkwNTcsImV4cCI6MjA5NjY5NTA1N30.xACkhvz6L5UoL6nYrnG0R19eSkLReahKagxY6nC4Urk` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyBDv4vLVRRPy9-zNjOOOdPGjEatcpuhWYs` |

### Supabase Edge Functions (set via `supabase secrets`)

| Secret | Required | Description |
|--------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key for Oracle analysis |

### Never expose

- `SUPABASE_SERVICE_ROLE_KEY` — only used server-side inside Edge Functions
- `GEMINI_API_KEY` — only used inside Edge Functions, never in frontend code

---

## 10. Testing Everything End-to-End

### 10.1 Web (browser)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Public portal loads | Visit `/` | Hero, live map with risk zones, community reports visible |
| Login | Click "Guardian" or "Commander", visit `/login`, enter credentials | Redirected to correct dashboard |
| Guardian dashboard | Login as guardian | Active alerts list, Google Maps per-alert, Oracle AI button |
| Oracle AI | Open any alert → click "Run Analysis" | Streaming text appears within 3s, JSON structured result |
| Command center | Login as admin | Live ops map with all units + alerts, risk zone table |
| Real-time alert update | Change alert status in Supabase SQL editor | UI updates within 1-2 seconds without refresh |
| Chat | Send message in Guardian coordination | Message appears immediately |

**Demo credentials:**
```
Guardian: Role = "guardian" (select from login page)
Commander: Role = "admin" (select from login page)
```

### 10.2 Mobile (PWA)

1. Open `https://aegiscsg.vercel.app` on your phone
2. Add to home screen (see Section 7.3)
3. Launch from home screen → should open full-screen, no browser chrome
4. Test: Guardian dashboard, maps, Oracle AI button all work on touch

### 10.3 Backend (Supabase)

```bash
# Test Edge Function directly
curl -X POST \
  https://mnxeqxgesletaddvcouy.supabase.co/functions/v1/oracle-analyze \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "alert",
    "alert": {
      "id": "ALT001",
      "victimName": "Test Victim",
      "priority": "critical",
      "address": "Kaduna, Nigeria",
      "aiThreatScore": 0.85,
      "audioStreaming": true
    }
  }'
```

Expected: SSE stream of JSON lines containing `threatScore`, `threatLevel`, `summary`, `recommendation`.

### 10.4 Realtime verification

1. Open two browser windows pointing at the app
2. In Supabase SQL editor, run:
```sql
UPDATE alerts SET status = 'dispatched' WHERE id = (SELECT id FROM alerts LIMIT 1);
```
3. Both browser windows should show the updated status within ~1 second

---

## 11. Troubleshooting

### Map shows blank / "For development purposes only" watermark
- The Maps key is read from `VITE_GOOGLE_MAPS_API_KEY` env var
- Ensure the key has **Maps JavaScript API** enabled: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
- Ensure no HTTP referrer restrictions block `localhost` during local dev
- In production, add `https://aegiscsg.vercel.app/*` as an allowed referrer

### Oracle AI returns "Oracle analysis failed"
- Check the Gemini API key is set: `supabase secrets list --project-ref mnxeqxgesletaddvcouy`
- Redeploy the function: `supabase functions deploy oracle-analyze --project-ref mnxeqxgesletaddvcouy`
- Check Edge Function logs: Supabase Dashboard → Edge Functions → oracle-analyze → Logs

### Realtime not updating
- Verify the tables are in the `supabase_realtime` publication (Section 4.4)
- Check browser console for WebSocket errors
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel env vars

### Vercel build fails
- Check `npm run lint` locally — must return 0 errors
- Ensure all `import` paths resolve (run `npm run build` locally to verify)
- Check Vercel build logs for the specific TypeScript error

### PWA not installing on iOS
- Must use **Safari** on iOS (Chrome on iOS cannot install PWAs)
- Site must be served over HTTPS (Vercel handles this automatically)
- `manifest.json` must be linked in `index.html`

### Login doesn't work / redirects loop
- The app uses demo auth (Zustand store). No Supabase Auth is required for login.
- If you added Supabase Auth, check the Site URL in Auth settings matches your Vercel URL

---

## Summary of Key URLs

| Resource | URL |
|----------|-----|
| Live Website | https://aegiscsg.vercel.app |
| GitHub Repo | https://github.com/Jimly234/aegiscsg |
| Supabase Dashboard | https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy |
| Supabase API Docs | https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/api |
| Edge Functions Logs | https://supabase.com/dashboard/project/mnxeqxgesletaddvcouy/functions/oracle-analyze/logs |
| Vercel Dashboard | https://vercel.com/jimly234/aegiscsg |
| Google Maps Console | https://console.cloud.google.com/apis/credentials |
| Google AI Studio | https://aistudio.google.com/app/apikey |
