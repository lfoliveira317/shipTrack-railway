# Google OAuth Setup Guide

Complete guide to set up Google OAuth authentication for ShipTrack on Railway or any deployment platform.

---

## Overview

ShipTrack now supports Google OAuth as an alternative to Manus OAuth, making it deployable on Railway, Render, or any hosting platform.

**What's included:**
- ✅ Google OAuth 2.0 authentication
- ✅ Automatic user creation and sync
- ✅ Session management
- ✅ Role-based access control
- ✅ Compatible with Railway deployment

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

Visit [Google Cloud Console](https://console.cloud.google.com/)

### 1.2 Create or Select a Project

1. Click the project dropdown (top-left)
2. Click **"New Project"**
3. Enter project name: `ShipTrack` (or any name)
4. Click **"Create"**

### 1.3 Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **"Enable"**

### 1.4 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in required fields:**
- **App name**: ShipTrack
- **User support email**: Your email
- **Developer contact email**: Your email

4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Select: `./auth/userinfo.email`
   - Select: `./auth/userinfo.profile`
6. Click **"Save and Continue"**
7. **Test users** (for development): Add your email
8. Click **"Save and Continue"**

### 1.5 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Web application
4. **Name**: ShipTrack Web Client

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-app-name.railway.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://your-app-name.railway.app/api/auth/callback/google
```

5. Click **"Create"**
6. **Copy** the Client ID and Client Secret (you'll need these)

---

## Step 2: Add Environment Variables

### For Local Development

Create `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-here

# App URL
AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://user:password@host:port/database
```

### For Railway Deployment

1. Go to Railway dashboard → Your project
2. Click **"Variables"** tab
3. Add the following variables:

```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
AUTH_SECRET=your-random-secret-here
AUTH_URL=https://your-app-name.railway.app
DATABASE_URL=${{MySQL.DATABASE_URL}}
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 3: Update Code to Use Google OAuth

### Option A: Use Google OAuth Context (Recommended)

Update `server/_core/index.ts`:

```typescript
import { createContext } from "./context-google"; // Change from "./context"
```

This switches from Manus OAuth to Google OAuth.

### Option B: Keep Both (Dual Auth Support)

You can support both Manus and Google OAuth by checking which environment variables are set:

```typescript
import { createContext as createManusContext } from "./context";
import { createContext as createGoogleContext } from "./context-google";

const createContext = process.env.GOOGLE_CLIENT_ID 
  ? createGoogleContext 
  : createManusContext;
```

---

## Step 4: Update Frontend Auth

### 4.1 Update Login URL

Create `client/src/lib/google-auth.ts`:

```typescript
export function getGoogleLoginUrl() {
  return "/api/auth/signin/google";
}

export function getLogoutUrl() {
  return "/api/auth/signout";
}
```

### 4.2 Update Components

Replace Manus login with Google login:

```typescript
// Before (Manus)
import { getLoginUrl } from "@/const";
window.location.href = getLoginUrl();

// After (Google)
import { getGoogleLoginUrl } from "@/lib/google-auth";
window.location.href = getGoogleLoginUrl();
```

### 4.3 Update useAuth Hook (Optional)

The existing `useAuth()` hook should work without changes since it uses `trpc.auth.me.useQuery()`.

---

## Step 5: Test Authentication

### Local Testing

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000

3. Click "Sign In" or navigate to http://localhost:3000/api/auth/signin/google

4. You should see Google's OAuth consent screen

5. Sign in with your Google account

6. You'll be redirected back to ShipTrack

7. Check the database - a new user should be created in the `users` table

### Railway Testing

1. Deploy to Railway

2. Add environment variables (Step 2)

3. Update authorized redirect URI in Google Cloud Console:
   ```
   https://your-app-name.railway.app/api/auth/callback/google
   ```

4. Visit your Railway app URL

5. Test sign-in flow

---

## Step 6: Verify Database User Creation

After signing in, check the `users` table:

```sql
SELECT * FROM users WHERE loginMethod = 'google';
```

You should see:
- `openId`: Google user ID
- `email`: Your Google email
- `name`: Your Google name
- `loginMethod`: "google"
- `role`: "user" (default)

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution**: Add the exact redirect URI to Google Cloud Console:
```
https://your-actual-domain.railway.app/api/auth/callback/google
```

### Error: "GOOGLE_CLIENT_ID not set"

**Solution**: Add environment variables to Railway (Step 2)

### Error: "Access blocked: This app's request is invalid"

**Solution**: 
1. Go to Google Cloud Console → OAuth consent screen
2. Add your email to "Test users"
3. Or publish the app (for production)

### Error: "Database not available"

**Solution**: Ensure `DATABASE_URL` is set in environment variables

### User not created in database

**Solution**:
1. Check server logs for errors
2. Verify database connection
3. Ensure `users` table exists (run migrations)

### Session not persisting

**Solution**:
1. Ensure `AUTH_SECRET` is set
2. Check that cookies are enabled in browser
3. For Railway, ensure `AUTH_URL` matches your actual domain

---

## Security Best Practices

### 1. Protect AUTH_SECRET

- Never commit to Git
- Use different secrets for dev/staging/production
- Rotate periodically

### 2. Restrict OAuth Consent Screen

- Start with "Testing" status
- Add only necessary test users
- Publish only when ready for production

### 3. Limit Redirect URIs

- Only add trusted domains
- Remove localhost URIs in production

### 4. Use HTTPS in Production

- Railway provides HTTPS by default
- Never use HTTP for OAuth in production

---

## Migration from Manus OAuth

### For Existing Users

Existing users with Manus OAuth will need to:
1. Sign in with Google
2. A new user account will be created
3. Old data remains in database (can be merged manually if needed)

### Merge User Data (Optional)

If you want to preserve user data:

```sql
-- Find old Manus user
SELECT * FROM users WHERE email = 'user@example.com' AND loginMethod != 'google';

-- Find new Google user
SELECT * FROM users WHERE email = 'user@example.com' AND loginMethod = 'google';

-- Transfer data (notifications, shipments, etc.) to new user ID
-- This is manual and depends on your data structure
```

---

## Advanced Configuration

### Custom Scopes

Add more Google API scopes in `server/_core/google-auth.ts`:

```typescript
Google({
  clientId: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile https://www.googleapis.com/auth/calendar",
    },
  },
}),
```

### Custom Redirect Pages

Update `authConfig` in `server/_core/google-auth.ts`:

```typescript
pages: {
  signIn: "/login",
  error: "/auth/error",
  signOut: "/goodbye",
},
```

### Role Assignment

Automatically assign admin role to specific emails:

```typescript
// In context-google.ts
const role = sessionUser.email === "admin@example.com" ? "admin" : "user";

await db.insert(users).values({
  // ...
  role,
});
```

---

## FAQ

**Q: Can I use both Manus and Google OAuth?**  
A: Yes, keep both context files and switch based on environment variables.

**Q: Do I need to pay for Google OAuth?**  
A: No, Google OAuth is free for most use cases.

**Q: Can users sign in with multiple Google accounts?**  
A: Yes, each Google account creates a separate user in your database.

**Q: How do I make someone an admin?**  
A: Update the `role` field in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

**Q: Can I use GitHub/Facebook/other OAuth providers?**  
A: Yes, Auth.js supports many providers. Add them in `google-auth.ts`.

---

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Add environment variables
3. ✅ Update code to use Google OAuth context
4. ✅ Test authentication locally
5. ✅ Deploy to Railway
6. ✅ Test authentication in production
7. ✅ Update frontend login buttons
8. ✅ Remove Manus OAuth code (optional)

**Your ShipTrack app is now ready for deployment with Google OAuth!**
