# Production Image Fix Checklist

## IMMEDIATE ACTION: Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com
2. Navigate to your project → Settings → Environment Variables
3. **ADD THIS VARIABLE** (if missing):
   ```
   Name: NEXT_PUBLIC_GCS_BUCKET_NAME
   Value: masi-website
   Environment: Production, Preview, Development (check all)
   ```
4. After adding, **REDEPLOY** your site (Deployments tab → click "..." → Redeploy)

## Why Images Fail: The 4 Common Causes

### 1. Missing Environment Variables ⭐ MOST COMMON
- `.env.local` works locally but **doesn't deploy** to Vercel
- Must manually add each `NEXT_PUBLIC_*` variable in Vercel dashboard
- **Check**: Open browser DevTools → Network tab → Are images loading from `storage.googleapis.com` or from your Vercel domain?

### 2. Filename Mismatches in Google Cloud Storage
- GCS is **case-sensitive**: `Jim McKeown.jpg` ≠ `jim mckeown.jpg`
- **Spaces in filenames** can cause issues (even with URL encoding)
- **Check**: Go to Google Cloud Console → Storage → masi-website bucket → Verify exact filenames

### 3. Next.js Image Optimization API Failures
- `<Image>` component fetches through `/_next/image?url=...`
- Fails if source image returns 404 or has CORS issues
- **Solution**: Add `unoptimized` prop or use regular `<img>` tags

### 4. GCS Permissions
- Images must be **publicly readable**
- **Check**: Open image URL directly in browser: `https://storage.googleapis.com/masi-website/images/eastern_cape_photo.jpg`
- Should load without requiring login

## Quick Test

Visit this debug page after deploying:
https://your-site.vercel.app/image-debug

It will show:
- ✅ Environment variables are set
- ❌ Which images are failing to load
- 🔗 Exact URLs being generated

## Files with Spaces (Potential Issues)

These files have spaces in their names - consider renaming in GCS:
- `images/staff/Jim McKeown.jpg` → `images/staff/jim-mckeown.jpg`
- `images/staff/Ta Fiks Mahola.jpg` → `images/staff/ta-fiks-mahola.jpg`

Then update the code to match the new filenames.
