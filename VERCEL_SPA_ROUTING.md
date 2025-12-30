# Vercel SPA Routing Configuration

## Problem
Getting 404 errors when accessing routes like `/admin` directly or on hard refresh.

## Solution: Configure Rewrites in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Open your project on [vercel.com](https://vercel.com)
2. Go to **Settings** → **Rewrites**

### Step 2: Add Rewrite Rule
Click **Add Rewrite** and configure:

**Source:** `/(.*)`
**Destination:** `/index.html`

This tells Vercel to serve `index.html` for all routes, allowing React Router to handle routing client-side.

### Step 3: Verify Build Output
Make sure your build output directory is `dist` (Vite default).

In Vercel Dashboard → Settings → General:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Redeploy
After adding the rewrite rule, redeploy your project:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Or push a new commit to trigger redeploy

## Alternative: Using vercel.json (Not Recommended Per Your Request)

If dashboard rewrites don't work, you can create `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

But you specifically requested dashboard-only configuration, so use the dashboard method above.

## Verification

After configuring:
1. Visit `https://bytek-store.vercel.app/admin` - should load
2. Hard refresh (Ctrl+F5) - should still work
3. Direct URL access - should work
4. All routes (`/products`, `/cart`, etc.) - should work

## Troubleshooting

- **Still getting 404:** Clear browser cache, wait a few minutes for Vercel to update
- **Build failing:** Check build logs in Vercel Dashboard
- **Routes not working:** Verify rewrite rule is exactly `/(.*)` → `/index.html`

