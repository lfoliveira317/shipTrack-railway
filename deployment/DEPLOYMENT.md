# Beacon Shipment Tracking - Deployment Guide

This guide provides step-by-step instructions for deploying the Beacon shipment tracking application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
3. [Environment Variables](#environment-variables)
4. [Deploy to Vercel](#deploy-to-vercel)
5. [Post-Deployment Tasks](#post-deployment-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **GitHub account** with repository access: https://github.com/lfoliveira317/beacon_mockup
- **Vercel account** (free tier available): https://vercel.com
- **Neon database** (already configured): `postgresql://neondb_owner:npg_k0nvwlaex6ot@ep-royal-term-ahndc9oe-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Resend account** for email notifications: https://resend.com
- **AWS S3 bucket** for file storage (or use Manus built-in S3)

---

## Database Setup (Neon PostgreSQL)

### Step 1: Verify Neon Database Connection

Your Neon database is already configured with the connection string. The database includes the following tables:

- **users** - User accounts with role-based access control (admin, user, viewer)
- **shipments** - Container shipment tracking data
- **comments** - Comments on shipments
- **attachments** - File attachments with S3 storage
- **apiConfigs** - API configuration for carrier tracking
- **notifications** - In-app notifications for shipment updates

### Step 2: Database Schema

The schema is defined in `drizzle/schema.ts` with the following structure:

**Users Table:**
```typescript
- id: serial (primary key)
- openId: text (unique, from OAuth)
- name: text
- email: text
- avatar: text
- role: text (admin, user, viewer)
- createdAt: timestamp
```

**Shipments Table:**
```typescript
- id: serial (primary key)
- orderNumber: text
- supplier: text
- cro: text
- containerNumber: text (unique)
- mawbNumber: text
- carrier: text
- status: text
- atd: text (Actual Time of Departure)
- eta: text (Estimated Time of Arrival)
- ata: text (Actual Time of Arrival)
- label: text
- shipmentType: text (default: "ocean")
- createdAt: timestamp
- updatedAt: timestamp
```

**Comments Table:**
```typescript
- id: serial (primary key)
- shipmentId: integer (foreign key to shipments)
- userId: integer (foreign key to users)
- userName: text
- userAvatar: text
- comment: text
- createdAt: timestamp
```

**Attachments Table:**
```typescript
- id: serial (primary key)
- shipmentId: integer (foreign key to shipments)
- filename: text
- fileSize: integer
- fileType: text
- uploadedBy: text
- uploadedAt: timestamp
- s3Key: text (S3 storage key)
- s3Url: text (S3 presigned URL)
```

**API Configs Table:**
```typescript
- id: serial (primary key)
- configType: text (single or per_carrier)
- carrier: text (nullable, for per-carrier configs)
- apiUrl: text
- apiPort: text
- apiToken: text
- apiUser: text
- apiPassword: text
- createdAt: timestamp
- updatedAt: timestamp
```

**Notifications Table:**
```typescript
- id: serial (primary key)
- userId: integer (foreign key to users)
- type: text (status_change, delay, arrival, etc.)
- title: text
- message: text
- shipmentId: integer (nullable, foreign key to shipments)
- isRead: boolean (default: false)
- createdAt: timestamp
```

### Step 3: Push Schema to Database

If you need to recreate or update the database schema:

```bash
# Clone the repository
git clone https://github.com/lfoliveira317/beacon_mockup.git
cd beacon_mockup

# Install dependencies
pnpm install

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://neondb_owner:npg_k0nvwlaex6ot@ep-royal-term-ahndc9oe-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Push schema to database
pnpm db:push
```

This will create all tables and relationships in your Neon database.

---

## Environment Variables

### Required Environment Variables

Create a `.env` file or configure these in Vercel:

```bash
# Database
DATABASE_URL="postgresql://neondb_owner:npg_k0nvwlaex6ot@ep-royal-term-ahndc9oe-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Email Notifications (Resend)
RESEND_API_KEY="re_eeaEcjhr_E8Q1fJj2Zrgc28qaJvmHZys4"
EMAIL_FROM="onboarding@resend.dev"

# OAuth (Manus built-in)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-jwt-secret-here"

# S3 Storage (use Manus built-in or your own)
# These are typically auto-injected by Manus
BUILT_IN_FORGE_API_KEY="auto-injected"
BUILT_IN_FORGE_API_URL="auto-injected"

# ShipStation API (optional, for real-time tracking)
SHIPSTATION_API_KEY="your-shipstation-api-key"

# App Configuration
VITE_APP_TITLE="Beacon Shipment Tracking"
VITE_APP_LOGO="/logo.svg"
```

### Generating JWT Secret

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

---

## Deploy to Vercel

### Step 1: Connect GitHub Repository

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `lfoliveira317/beacon_mockup`
4. Vercel will auto-detect the framework (Vite + Express)

### Step 2: Configure Environment Variables

In Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add all required environment variables listed above
3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### Step 3: Configure Build Settings

Vercel should auto-detect the build settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, Vercel will provide a URL (e.g., `https://beacon-mockup.vercel.app`)

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## Post-Deployment Tasks

### 1. Create Admin User

After deployment, you need to create an admin user in the database:

```sql
-- Connect to your Neon database using psql or Neon SQL Editor
-- Replace with actual user details from OAuth login

INSERT INTO users (open_id, name, email, avatar, role, created_at)
VALUES (
  'your-oauth-open-id',
  'Admin User',
  'admin@yourdomain.com',
  'https://avatar-url.com/avatar.jpg',
  'admin',
  NOW()
);
```

Or update an existing user to admin:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@domain.com';
```

### 2. Test Email Notifications

1. Log in to the application
2. Edit a shipment and change its status
3. Check that email notifications are sent to admin users
4. Verify emails arrive in inbox (check spam folder)

### 3. Configure S3 Storage

If using custom S3 (not Manus built-in):

1. Create an S3 bucket in AWS
2. Configure CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. Add AWS credentials to Vercel environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`

### 4. Test User Roles

1. Create test users with different roles:
   - **Admin**: Full access, can manage users
   - **User**: Can modify shipments, cannot manage users
   - **Viewer**: Read-only access
2. Verify permissions work correctly

### 5. Set Up Monitoring

1. Enable Vercel Analytics in project settings
2. Monitor error logs in Vercel dashboard
3. Set up alerts for critical errors

---

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to Neon database

**Solution**:
- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Ensure SSL mode is set to `require` in connection string
- Check Neon dashboard for database status
- Verify IP allowlist in Neon (Vercel IPs should be allowed)

### Email Notifications Not Working

**Problem**: Emails not being sent

**Solution**:
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for API usage and errors
- Verify `EMAIL_FROM` domain is verified in Resend
- For testing, use `onboarding@resend.dev`
- Check Vercel function logs for email errors

### File Upload Failures

**Problem**: Cannot upload attachments

**Solution**:
- Verify S3 credentials are correct
- Check S3 bucket CORS configuration
- Ensure bucket has public read access (or presigned URLs enabled)
- Check Vercel function logs for S3 errors
- Verify file size is under 10MB limit

### Build Failures

**Problem**: Vercel build fails

**Solution**:
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compilation succeeds locally
- Check for missing environment variables
- Try clearing Vercel build cache and redeploying

### OAuth Login Issues

**Problem**: Cannot log in with OAuth

**Solution**:
- Verify `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are correct
- Check that OAuth redirect URLs are configured in Manus OAuth settings
- Ensure `JWT_SECRET` is set and consistent across deployments
- Clear browser cookies and try again

### Performance Issues

**Problem**: Application is slow

**Solution**:
- Enable Vercel Edge Caching
- Optimize database queries (add indexes if needed)
- Use Neon connection pooling (already enabled in connection string)
- Consider upgrading Vercel plan for better performance
- Monitor Vercel function execution times

---

## Database Migrations

### Running Migrations

When schema changes are made:

```bash
# Generate migration
pnpm drizzle-kit generate

# Push to database
pnpm db:push
```

### Rollback Migrations

To rollback to a previous schema version:

```bash
# List migrations
ls drizzle/

# Manually revert using SQL
psql $DATABASE_URL -f drizzle/0003_sleepy_gorilla_man.sql
```

---

## Backup and Recovery

### Database Backups

Neon provides automatic backups. To create manual backup:

1. Go to Neon dashboard
2. Select your project
3. Click **"Backups"**
4. Create manual backup

### Restore from Backup

1. Go to Neon dashboard
2. Select backup to restore
3. Click **"Restore"**
4. Confirm restoration

---

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] JWT secret is strong and random
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] S3 bucket has proper CORS and access policies
- [ ] Resend API key is kept secure
- [ ] Admin users are properly configured
- [ ] OAuth redirect URLs are whitelisted
- [ ] Rate limiting is enabled (if applicable)
- [ ] HTTPS is enforced on custom domain

---

## Support

For issues or questions:

- **GitHub Issues**: https://github.com/lfoliveira317/beacon_mockup/issues
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs
- **Resend Support**: https://resend.com/docs

---

## Version Information

- **Application Version**: 1.0.0
- **Database Schema Version**: 0004_steady_colonel_america
- **Node.js Version**: 22.x
- **pnpm Version**: 10.x
- **Last Updated**: January 13, 2026
