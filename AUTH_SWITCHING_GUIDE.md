# Authentication Switching Guide

Quick guide to switch between Manus OAuth and Google OAuth in ShipTrack.

---

## Current Setup

ShipTrack supports **two authentication methods**:

1. **Manus OAuth** - For Manus platform deployment (default)
2. **Google OAuth** - For Railway, Render, or any external deployment

---

## Switch to Google OAuth

### Step 1: Update Server Context

Edit `server/_core/index.ts`:

```typescript
// Change this line:
import { createContext } from "./context";

// To this:
import { createContext } from "./context-google";
```

### Step 2: Add Environment Variables

Add to `.env` or Railway/Render environment variables:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
AUTH_SECRET=your-random-secret
AUTH_URL=https://your-app.railway.app
```

### Step 3: Update Frontend (Optional)

Replace Manus login URLs with Google:

```typescript
// Before (Manus)
import { getLoginUrl } from "@/const";
window.location.href = getLoginUrl();

// After (Google)
import { getGoogleLoginUrl } from "@/lib/google-auth";
window.location.href = getGoogleLoginUrl();
```

### Step 4: Restart Server

```bash
pnpm dev
```

---

## Switch Back to Manus OAuth

### Step 1: Update Server Context

Edit `server/_core/index.ts`:

```typescript
// Change this line:
import { createContext } from "./context-google";

// Back to this:
import { createContext } from "./context";
```

### Step 2: Remove Google Environment Variables

Remove from `.env`:

```bash
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# AUTH_SECRET=...
```

### Step 3: Restart Server

```bash
pnpm dev
```

---

## Dual Auth Support (Advanced)

Support both Manus and Google OAuth simultaneously:

### Update `server/_core/index.ts`:

```typescript
import { createContext as createManusContext } from "./context";
import { createContext as createGoogleContext } from "./context-google";

// Use Google OAuth if GOOGLE_CLIENT_ID is set, otherwise use Manus OAuth
const createContext = process.env.GOOGLE_CLIENT_ID 
  ? createGoogleContext 
  : createManusContext;

export { createContext };
```

Now the app automatically uses:
- **Google OAuth** when deployed to Railway (with GOOGLE_CLIENT_ID set)
- **Manus OAuth** when running on Manus platform (without GOOGLE_CLIENT_ID)

---

## Quick Reference

| Feature | Manus OAuth | Google OAuth |
|---------|-------------|--------------|
| **Platform** | Manus only | Any (Railway, Render, etc.) |
| **Setup** | Automatic | Manual (Google Cloud Console) |
| **Env Vars** | Auto-injected | Manual setup required |
| **Cost** | Free (included) | Free |
| **User Management** | Manus dashboard | Your database |
| **Context File** | `context.ts` | `context-google.ts` |

---

## Troubleshooting

### "GOOGLE_CLIENT_ID not set" warning

**Solution**: Either:
1. Add Google OAuth credentials (see `GOOGLE_OAUTH_SETUP.md`)
2. Switch back to Manus OAuth (use `context.ts`)

### Users can't log in after switching

**Solution**: 
- Switching auth creates new users in database
- Old users need to sign in again with new method
- Data migration required if you want to preserve user data

### Both auth methods not working

**Solution**:
1. Check which context file is imported in `server/_core/index.ts`
2. Verify environment variables are set correctly
3. Check server logs for errors

---

## Files Reference

| File | Purpose |
|------|---------|
| `server/_core/context.ts` | Manus OAuth context |
| `server/_core/context-google.ts` | Google OAuth context |
| `server/_core/oauth.ts` | Manus OAuth routes |
| `server/_core/google-auth.ts` | Google OAuth configuration |
| `client/src/const.ts` | Manus login URL |
| `client/src/lib/google-auth.ts` | Google login URL |

---

## Summary

- ✅ **Manus platform**: Use `context.ts` (default, no setup)
- ✅ **Railway/Render**: Use `context-google.ts` (requires Google OAuth setup)
- ✅ **Both**: Use conditional import based on `GOOGLE_CLIENT_ID`

For detailed Google OAuth setup, see `GOOGLE_OAUTH_SETUP.md`.
