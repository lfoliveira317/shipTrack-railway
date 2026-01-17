# Railway Deployment Guide for ShipTrack

This guide will help you deploy ShipTrack to Railway.app.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (to connect your repository)
- EmailJS account (for email notifications)

## Step 1: Prepare Your Repository

1. **Export code to GitHub** (if not already done):
   - In Manus UI: Settings → GitHub
   - Select your GitHub account
   - Enter repository name (e.g., `shiptrack`)
   - Click Export

2. **Verify the following files are in your repository**:
   - ✅ `railway.json` - Railway configuration
   - ✅ `nixpacks.toml` - Build configuration
   - ✅ `.env.railway.example` - Environment variables template
   - ✅ `package.json` - Dependencies and scripts

## Step 2: Create Railway Project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your `shiptrack` repository
4. Railway will automatically detect the configuration

## Step 3: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "MySQL"**
3. Railway will automatically:
   - Create a MySQL instance
   - Set the `DATABASE_URL` environment variable
   - Connect it to your app

## Step 4: Configure Environment Variables

Go to your app service → **Variables** tab and add:

### Required Variables

```bash
# Database (automatically set by Railway MySQL service)
DATABASE_URL=mysql://...  # Auto-populated

# Security
JWT_SECRET=your-random-secret-min-32-characters
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# EmailJS (from https://dashboard.emailjs.com)
EMAILJS_PRIVATE_KEY=your-emailjs-private-key

# Application
NODE_ENV=production
PORT=3000
```

### Optional Variables

```bash
# Frontend
VITE_APP_TITLE=ShipTrack
VITE_APP_LOGO=/logo.svg

# Email
EMAIL_FROM=noreply@shiptrack.com

# Shipping APIs (if using)
MAERSK_CLIENT_ID=your-client-id
MAERSK_CLIENT_SECRET=your-client-secret
SHIPSTATION_API_KEY=your-api-key
```

## Step 5: Run Database Migrations

After the first deployment:

1. Go to your app service → **Settings** → **Deploy**
2. Add a custom build command (optional):
   ```bash
   pnpm install && pnpm db:push && pnpm build
   ```

Or run migrations manually via Railway CLI:
```bash
railway run pnpm db:push
```

## Step 6: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Wait for the build to complete (~2-3 minutes)
3. Your app will be available at: `https://your-app.railway.app`

## Step 7: Configure Custom Domain (Optional)

1. In Railway project → **Settings** → **Domains**
2. Click **"Generate Domain"** for a Railway subdomain
3. Or add your custom domain:
   - Click **"Custom Domain"**
   - Enter your domain (e.g., `shiptrack.com`)
   - Add the provided CNAME record to your DNS

## Important Notes

### Authentication

⚠️ **The current app uses Manus OAuth** which won't work on Railway. You have two options:

1. **Remove authentication** (for internal/demo use):
   - Comment out auth checks in `server/routers.ts`
   - Remove `protectedProcedure` usage

2. **Implement alternative auth** (recommended for production):
   - Add Auth.js (NextAuth)
   - Use Clerk
   - Use Supabase Auth
   - Implement custom JWT auth

### File Storage

⚠️ **S3 storage uses Manus credentials**. For Railway:

1. **Option A**: Create your own AWS S3 bucket
   - Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to Railway
   - Update `server/storage.ts` with your bucket name

2. **Option B**: Use Railway Volumes (for small files)
   - Add a volume in Railway
   - Update storage logic to use filesystem

### Email Service

✅ **EmailJS works on Railway** - no changes needed. Just add `EMAILJS_PRIVATE_KEY`.

### Scheduled Jobs

✅ **Digest emails run automatically** - the scheduler starts with the app.

## Troubleshooting

### Build Fails

- Check Railway logs: **Deployments** → Click on deployment → **View Logs**
- Verify all dependencies are in `package.json`
- Ensure Node.js version matches (22.x)

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check MySQL service is running
- Run migrations: `railway run pnpm db:push`

### App Crashes on Start

- Check environment variables are set
- Review startup logs in Railway
- Verify `dist/index.js` exists after build

## Cost Estimate

Railway pricing (as of 2026):
- **Hobby Plan**: $5/month + usage
  - Includes $5 credit
  - ~500 execution hours
  - Suitable for small apps

- **Pro Plan**: Pay-as-you-go
  - ~$5-20/month for this app size
  - Includes MySQL database
  - Better for production

## Alternative: Keep Using Manus

If Railway seems complex, consider staying on Manus:
- ✅ Everything already configured
- ✅ Custom domains supported
- ✅ Database included
- ✅ One-click publish
- ✅ No migration needed

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- ShipTrack Issues: GitHub repository issues

## Next Steps After Deployment

1. Test all features on Railway URL
2. Configure custom domain
3. Set up monitoring/alerts
4. Configure backups for MySQL
5. Update EmailJS allowed domains
6. Test email notifications
7. Load production data

---

**Need help?** Check Railway documentation or contact support.
