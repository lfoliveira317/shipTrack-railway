# Railway Deployment Guide for ShipTrack

Complete guide for deploying ShipTrack to Railway.app with auto-detected build configuration.

---

## Overview

Railway will automatically detect your Node.js project and configure the build process. No custom configuration files needed!

**What Railway Auto-Detects:**
- ✅ Node.js 22 (from `package.json` engines or `.nvmrc`)
- ✅ pnpm (from `pnpm-lock.yaml`)
- ✅ Build command (`pnpm build`)
- ✅ Start command (`node dist/index.js` or from `package.json`)

---

## Prerequisites

- GitHub account with ShipTrack repository
- Railway account (sign up at https://railway.app)
- Credit card for Railway (free $5 credit/month)

---

## Step 1: Push Code to GitHub

1. **Export from Manus**:
   - Open Management UI (icon in top-right of chatbox)
   - Go to **Settings** → **GitHub**
   - Click **"Export"** to push all code

2. **Verify on GitHub**:
   - Visit https://github.com/lfoliveira317/beacon_mockup
   - Ensure all files are present

---

## Step 2: Create Railway Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select `lfoliveira317/beacon_mockup` repository
6. Railway will automatically start building

---

## Step 3: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway creates a MySQL instance and sets `DATABASE_URL` automatically
4. No manual configuration needed!

---

## Step 4: Configure Environment Variables

Click on your app service, go to **"Variables"** tab, and add:

### Required Variables

```bash
# Email Service (EmailJS)
EMAILJS_PRIVATE_KEY=your-emailjs-private-key
EMAIL_FROM=noreply@yourdomain.com

# JWT Authentication
JWT_SECRET=your-random-secret-string-at-least-32-chars

# App Configuration
VITE_APP_TITLE=ShipTrack
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

### Optional Variables (if using custom S3 storage)

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Note**: `DATABASE_URL` is automatically set by Railway when you add MySQL.

---

## Step 5: Run Database Migrations

After first deployment:

1. Go to your app service in Railway
2. Click **"Settings"** → **"Deploy Triggers"**
3. Or use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run pnpm db:push
```

---

## Step 6: Verify Deployment

1. **Check Build Logs**:
   - Click on your deployment
   - View logs to ensure build succeeded
   - Look for: `✓ built in X.XXs`

2. **Check Runtime Logs**:
   - Verify server starts without errors
   - Look for: `Server running on port 3000`

3. **Access Application**:
   - Railway provides a URL like: `https://beacon-mockup-production.up.railway.app`
   - Click **"Settings"** → **"Networking"** → **"Generate Domain"**

---

## Step 7: Custom Domain (Optional)

1. In Railway app settings, go to **"Networking"**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `shiptrack.yourdomain.com`)
4. Add CNAME record to your DNS:
   ```
   CNAME shiptrack.yourdomain.com → [railway-domain].up.railway.app
   ```
5. Wait for DNS propagation (5-30 minutes)

---

## What Railway Auto-Detects

Railway automatically configures:

| Detection | How It Works |
|-----------|--------------|
| **Node.js version** | From `package.json` `engines` field or `.nvmrc` |
| **Package manager** | Detects pnpm from `pnpm-lock.yaml` |
| **Install command** | Runs `pnpm install` |
| **Build command** | Runs `pnpm build` from `package.json` |
| **Start command** | Uses `pnpm start` or `node dist/index.js` |

---

## Build Process

Railway will automatically:

1. **Install dependencies**: `pnpm install`
2. **Build frontend**: `vite build` → `dist/public/`
3. **Build backend**: `esbuild server/_core/index.ts` → `dist/index.js`
4. **Start server**: `node dist/index.js`

Expected build time: **2-4 minutes**

---

## Cost Estimation

### Railway Pricing (2026)

**Free Tier:**
- $5 credit/month
- ~500 execution hours
- Enough for small projects

**Starter Plan ($5/month):**
- $5 credit included
- Additional usage pay-as-you-go
- ~$0.000231/minute for compute

**Typical Monthly Cost for ShipTrack:**
- Small usage (100 hours): **$0-2**
- Medium usage (500 hours): **$5-10**
- High usage (continuous): **$15-25**

**MySQL Add-on:**
- Included in usage-based pricing
- ~$5-10/month for typical usage

---

## Troubleshooting

### Issue: Build Fails

**Check build logs** for specific errors:

1. **Missing dependencies**: Ensure `package.json` is complete
2. **Build script fails**: Test `pnpm build` locally
3. **Memory issues**: Upgrade Railway plan if needed

### Issue: App Crashes on Start

**Check runtime logs**:

1. **Missing env vars**: Verify all required variables are set
2. **Database connection**: Ensure `DATABASE_URL` is set
3. **Port binding**: App should use `process.env.PORT`

### Issue: Database Connection Fails

**Solution**:
1. Verify MySQL service is running
2. Check `DATABASE_URL` format: `mysql://user:pass@host:port/db`
3. Run migrations: `railway run pnpm db:push`

### Issue: Email Notifications Don't Work

**Solution**:
1. Verify `EMAILJS_PRIVATE_KEY` is set
2. Check EmailJS dashboard for API usage
3. Ensure `EMAIL_FROM` is valid

---

## Authentication Warning

⚠️ **Important**: ShipTrack currently uses **Manus OAuth** which won't work on Railway.

**Options:**

1. **Remove authentication** (for internal use):
   - Comment out auth checks in `server/routers.ts`
   - Remove `protectedProcedure` usage

2. **Implement alternative auth**:
   - **Auth.js** (formerly NextAuth): https://authjs.dev
   - **Clerk**: https://clerk.com
   - **Supabase Auth**: https://supabase.com/auth

3. **Keep on Manus hosting**: Authentication works out-of-the-box

---

## File Storage

ShipTrack uses Manus built-in storage by default. For Railway:

**Option 1: Set up AWS S3** (Recommended)
- Follow `AWS_S3_SETUP_GUIDE.md`
- Add AWS credentials to Railway env vars
- See `STORAGE_MIGRATION_GUIDE.md`

**Option 2: Use Railway Volumes**
- Limited to single instance
- Not recommended for production

---

## Monitoring & Logs

### View Logs

1. Go to your Railway project
2. Click on deployment
3. View real-time logs

### Set Up Alerts

1. Go to **"Settings"** → **"Observability"**
2. Configure alerts for:
   - Deployment failures
   - High memory usage
   - Crash loops

---

## Scaling

Railway auto-scales based on traffic:

- **Horizontal scaling**: Add replicas in settings
- **Vertical scaling**: Upgrade plan for more resources
- **Database scaling**: Upgrade MySQL plan if needed

---

## CI/CD

Railway automatically deploys on every push to `main`:

1. Push to GitHub
2. Railway detects changes
3. Builds and deploys automatically
4. Zero-downtime deployment

**Disable auto-deploy**:
- Go to **"Settings"** → **"Deploy Triggers"**
- Toggle off "Automatic Deployments"

---

## Rollback

If deployment fails:

1. Go to **"Deployments"** tab
2. Find previous successful deployment
3. Click **"..."** → **"Redeploy"**

---

## Environment-Specific Configuration

### Development vs Production

Railway sets `NODE_ENV=production` automatically. Use it in code:

```typescript
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
```

---

## Security Checklist

- [ ] All secrets stored in Railway environment variables
- [ ] `JWT_SECRET` is strong and random (32+ characters)
- [ ] Database uses SSL (Railway MySQL has SSL by default)
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled (if needed)
- [ ] Input validation on all endpoints

---

## Performance Optimization

1. **Enable caching**: Use Redis for session storage
2. **CDN for static assets**: Use Cloudflare or CloudFront
3. **Database indexing**: Add indexes for frequent queries
4. **Connection pooling**: Already configured in Drizzle ORM

---

## Backup Strategy

### Database Backups

Railway provides automatic backups:
- Daily backups retained for 7 days
- Manual backups available in dashboard

### Manual Backup

```bash
# Export database
railway run mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup.sql

# Import database
railway run mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < backup.sql
```

---

## Additional Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Node.js Guide**: https://docs.railway.app/guides/nodejs
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Railway Community**: https://discord.gg/railway
- **ShipTrack Guides**:
  - `AWS_S3_SETUP_GUIDE.md` - S3 storage setup
  - `STORAGE_MIGRATION_GUIDE.md` - Migrate from Manus storage
  - `RAILWAY_BUILD_FIX.md` - Troubleshooting build issues

---

## Support

- **Railway Support**: https://railway.app/help
- **Railway Status**: https://status.railway.app
- **ShipTrack Issues**: GitHub repository

---

## Summary

✅ **Railway auto-detects everything** - no configuration files needed  
✅ **Push to GitHub** → Railway builds and deploys automatically  
✅ **Add MySQL** → `DATABASE_URL` configured automatically  
✅ **Set environment variables** → EmailJS, JWT, AWS (if needed)  
✅ **Run migrations** → `railway run pnpm db:push`  
✅ **Access your app** → Railway provides public URL  

**Deployment time**: ~5-10 minutes from start to finish!

---

**Ready to deploy?** Push your code to GitHub and create a Railway project. It's that simple!
