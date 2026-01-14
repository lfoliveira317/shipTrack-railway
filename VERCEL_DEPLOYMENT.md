# Vercel Deployment Guide for Beacon Shipment Tracking

## Overview
This guide explains how to deploy the Beacon Shipment Tracking application to Vercel with proper API routing and database configuration.

## Prerequisites
- Vercel account (free tier works)
- Neon PostgreSQL database (already configured)
- GitHub repository with latest code
- Environment variables ready

## Deployment Steps

### 1. Connect GitHub Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `lfoliveira317/beacon_mockup`
4. Vercel will auto-detect the framework

### 2. Configure Build Settings

Vercel should auto-detect these settings from `vercel.json`:

```
Framework Preset: Other
Build Command: pnpm build
Output Directory: dist/client
Install Command: pnpm install
```

If not auto-detected, set them manually in the project settings.

### 3. Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_k0nvwlaex6ot@ep-royal-term-ahndc9oe-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Email Notifications
RESEND_API_KEY=re_eeaEcjhr_E8Q1fJj2Zrgc28qaJvmHZys4
EMAIL_FROM=onboarding@resend.dev

# JWT Secret (generate a new secure one!)
JWT_SECRET=your-secure-random-jwt-secret-change-this

# OAuth (Manus built-in)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# App Configuration
VITE_APP_TITLE=Beacon Shipment Tracking
VITE_APP_LOGO=/logo.svg
NODE_ENV=production

# Optional: ShipStation API
SHIPSTATION_API_KEY=your-shipstation-key-here
```

**Important**: Generate a new JWT_SECRET for production:
```bash
openssl rand -hex 32
```

### 4. Deploy

Click **"Deploy"** button. Vercel will:
1. Install dependencies with `pnpm install`
2. Build the client with `vite build`
3. Build the server with `esbuild`
4. Deploy both to Vercel's edge network

### 5. Post-Deployment

After successful deployment:

1. **Push Database Schema** (one-time):
   ```bash
   # From your local machine with DATABASE_URL set
   pnpm db:push
   ```
   
2. **Verify API Routes**:
   - Visit: `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok"}`

3. **Test the Application**:
   - Login with your account
   - Verify shipments load correctly
   - Test add/edit functionality
   - Check notifications work
   - Test file uploads

## Common Issues & Solutions

### Issue 1: "NOT_FOUND" Error for API Routes

**Cause**: Missing or incorrect `vercel.json` configuration

**Solution**: Ensure `vercel.json` exists with proper routing:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api" }
  ]
}
```

### Issue 2: Database Connection Fails

**Cause**: DATABASE_URL not set or incorrect

**Solution**:
1. Verify DATABASE_URL in Vercel environment variables
2. Check Neon database is active (not paused)
3. Ensure SSL mode is enabled: `?sslmode=require`

### Issue 3: Build Fails

**Cause**: Missing dependencies or build errors

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` scripts are correct
3. Test build locally: `pnpm build`

### Issue 4: OAuth/Login Issues

**Cause**: OAuth configuration mismatch

**Solution**:
1. Verify OAUTH_SERVER_URL and VITE_OAUTH_PORTAL_URL
2. Check OWNER_OPEN_ID matches your Manus account
3. Ensure JWT_SECRET is set

### Issue 5: Email Notifications Not Sending

**Cause**: Resend API key invalid or EMAIL_FROM not verified

**Solution**:
1. Verify RESEND_API_KEY is correct
2. Use `onboarding@resend.dev` for testing
3. For production, verify your domain in Resend dashboard

## Architecture on Vercel

```
Vercel Deployment Structure:
├── dist/client/          → Static frontend (served via CDN)
│   ├── index.html
│   ├── assets/
│   └── ...
├── dist/index.js         → Server bundle
└── api/index.js          → Vercel serverless function entry point
```

**How it works**:
1. Static files (HTML, CSS, JS) served from CDN
2. API requests (`/api/*`) routed to serverless function
3. Serverless function loads Express server
4. Database queries execute on-demand
5. S3 file uploads work via presigned URLs

## Performance Optimization

### 1. Enable Caching
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Database Connection Pooling
Neon automatically handles connection pooling with the `-pooler` endpoint.

### 3. Serverless Function Optimization
- Keep functions under 50MB
- Use environment variables for secrets
- Minimize cold start time

## Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Select a deployment
4. Click **"Functions"** or **"Runtime Logs"**

### Monitor Performance
- Use Vercel Analytics (free tier available)
- Monitor database queries in Neon dashboard
- Check email delivery in Resend dashboard

## Custom Domain Setup

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning (~5 minutes)

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

## Security Checklist

- [ ] JWT_SECRET is unique and secure (not default)
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] RESEND_API_KEY is kept secret
- [ ] Environment variables not exposed in client code
- [ ] CORS configured properly for production domain
- [ ] Rate limiting enabled for API endpoints

## Support

For issues:
1. Check Vercel deployment logs
2. Review Neon database logs
3. Test locally with production environment variables
4. Contact Vercel support if infrastructure issues

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domain
3. Enable Vercel Analytics
4. Set up automated backups for database
5. Implement CI/CD for automatic deployments

---

**Deployment Status**: Ready for Production ✅
**Last Updated**: 2026-01-13
