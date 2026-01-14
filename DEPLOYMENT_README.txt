BEACON SHIPMENT TRACKING - DEPLOYMENT PACKAGE
==============================================

This deployment package contains all source code and configuration files
needed to deploy the Beacon Shipment Tracking application.

PACKAGE CONTENTS:
-----------------
- Source code (client/ and server/ directories)
- Database schema and migrations (drizzle/ directory)
- Configuration files (package.json, tsconfig.json, vite.config.ts, etc.)
- Deployment guide (DEPLOYMENT.md)
- Component library (client/src/components/)

EXCLUDED FROM PACKAGE:
----------------------
- node_modules/ (install with: pnpm install)
- dist/ (build with: pnpm build)
- .env files (configure separately - see below)
- .git/ (version control history)

DEPLOYMENT STEPS:
-----------------

1. EXTRACT FILES
   unzip deployment.zip
   cd beacon_mockup

2. INSTALL DEPENDENCIES
   pnpm install

3. CONFIGURE ENVIRONMENT VARIABLES
   Create a .env file with the following variables:

   # Database
   DATABASE_URL="postgresql://neondb_owner:npg_k0nvwlaex6ot@ep-royal-term-ahndc9oe-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

   # Email Notifications
   RESEND_API_KEY="re_eeaEcjhr_E8Q1fJj2Zrgc28qaJvmHZys4"
   EMAIL_FROM="onboarding@resend.dev"

   # OAuth (Manus built-in)
   OAUTH_SERVER_URL="https://api.manus.im"
   VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"

   # JWT Secret (generate new one for production!)
   JWT_SECRET="your-secure-jwt-secret-here"

   # App Configuration
   VITE_APP_TITLE="Beacon Shipment Tracking"
   VITE_APP_LOGO="/logo.svg"

4. PUSH DATABASE SCHEMA
   pnpm db:push

5. BUILD FOR PRODUCTION
   pnpm build

6. DEPLOY TO VERCEL (Recommended)
   - Connect GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on push

   OR DEPLOY TO OTHER PLATFORMS:
   - Railway: railway up
   - Render: render deploy
   - Self-hosted: pnpm start

IMPORTANT NOTES:
----------------
- Generate a NEW JWT_SECRET for production (use: openssl rand -hex 32)
- Verify Resend email domain or use onboarding@resend.dev for testing
- Database schema is already in Neon, just run pnpm db:push to sync
- All 40 unit tests pass (run: pnpm test)

FEATURES INCLUDED:
------------------
✅ Container shipment tracking
✅ Real-time status updates
✅ File attachments with S3 storage
✅ Comments and collaboration
✅ Email notifications (Resend)
✅ In-app notifications
✅ User management with role-based access control (Admin/User/Viewer)
✅ API configuration for carrier tracking
✅ PostgreSQL database (Neon)
✅ Responsive UI with dark mode support

DATABASE SCHEMA:
----------------
6 tables created in Neon PostgreSQL:
- users (9 columns) - User accounts with roles
- shipments (18 columns) - Container tracking data
- comments (5 columns) - Shipment comments
- attachments (9 columns) - File attachments with S3
- apiConfigs (10 columns) - API configuration
- notifications (8 columns) - User notifications

For detailed deployment instructions, see DEPLOYMENT.md

SUPPORT:
--------
GitHub: https://github.com/lfoliveira317/beacon_mockup
Documentation: See DEPLOYMENT.md in this package

Version: 1.0.0
Last Updated: January 13, 2026
