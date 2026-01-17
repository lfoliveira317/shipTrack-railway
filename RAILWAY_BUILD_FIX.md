# Railway Build Fix Guide

This guide addresses all Nixpacks build failures encountered when deploying ShipTrack to Railway.

---

## Error 1: Corepack Signature Verification Failure

### The Error

```
Internal Error: Cannot find matching keyid
at verifySignature (/nix/store/.../corepack.cjs:21535:47)
ERROR: failed to build: process "/bin/bash -ol pipefail -c corepack prepare pnpm@latest --activate" did not complete successfully: exit code: 1
```

### Root Cause

Corepack's signature verification fails when trying to prepare `pnpm@latest` in the Nix environment. This is a known issue with corepack in certain Node.js builds.

### The Fix

**Remove corepack commands** - Railway's Nixpacks automatically handles pnpm:

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

**Key Change**: Removed `corepack enable` and `corepack prepare` commands. Nixpacks detects pnpm from `pnpm-lock.yaml` and installs it automatically.

---

## Error 2: nodejs-22_x Undefined Variable

### The Error

```
error: undefined variable 'nodejs-22_x'
at /app/.nixpacks/nixpkgs-*.nix:19:9:
```

### Root Cause

Incorrect package name. Nix uses underscores, not hyphens with `x` suffix.

### The Fix

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]  # Correct: nodejs_22, not nodejs-22_x
```

---

## Error 3: pnpm --frozen-lockfile (Earlier Issue)

### The Error

```
ERROR: failed to build: process did not complete successfully: exit code: 1
```

### Root Cause

The `--frozen-lockfile` flag can cause issues if `pnpm-lock.yaml` is out of sync.

### The Fix

Use `pnpm install` without flags - Railway handles lockfile validation.

---

## Complete Working Configuration

### `nixpacks.toml` (Final Version)

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

### `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## How to Apply the Fix

### Step 1: Update Configuration Files

The fixed `nixpacks.toml` and `railway.json` are already in your project.

### Step 2: Commit and Push

**Option A: Use Manus Management UI** (Recommended)
1. Open Management UI (click icon in top-right of chatbox)
2. Go to **Settings** → **GitHub**
3. Click **"Export"** to push changes

**Option B: Manual Git Commands**
```bash
git add nixpacks.toml railway.json
git commit -m "fix: Remove corepack commands to fix signature verification error"
git push origin main
```

### Step 3: Redeploy on Railway

1. Go to your Railway project
2. New commit will trigger automatic redeployment
3. Or manually: **Deployments** → **Deploy**

### Step 4: Monitor Build Logs

Watch for successful build:

```
✓ stage-0: RUN nix-env -if .nixpacks/nixpkgs-*.nix
✓ stage-0: COPY . /app/.
✓ stage-0: RUN pnpm install
✓ stage-0: RUN pnpm build
✓ Build complete
```

---

## Alternative Solutions

### Option 1: Let Railway Auto-Detect (Simplest)

Delete configuration files completely:

```bash
rm nixpacks.toml railway.json
git add -A
git commit -m "fix: Let Railway auto-detect build configuration"
git push origin main
```

Railway will automatically:
- Detect Node.js 22 from `.nvmrc` or `package.json`
- Detect pnpm from `pnpm-lock.yaml`
- Run `pnpm install` and `pnpm build`
- Start with `node dist/index.js`

### Option 2: Use Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port (Railway overrides with PORT env var)
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

Update `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

---

## Why This Works

1. **Nixpacks auto-detects pnpm**: When it sees `pnpm-lock.yaml`, it automatically installs pnpm
2. **No corepack needed**: Nixpacks uses its own pnpm installation method
3. **Simpler is better**: Fewer commands = fewer points of failure

---

## Common Nix Package Names

For different Node.js versions:

| Version | Correct Package Name |
|---------|---------------------|
| Node.js 18 | `nodejs_18` |
| Node.js 20 | `nodejs_20` |
| Node.js 22 | `nodejs_22` |
| Node.js Latest | `nodejs` |

**Note**: Always use underscores (`_`), never hyphens (`-`) or `x` suffix.

---

## Verification Checklist

After deployment:

- [ ] Build logs show no errors
- [ ] `pnpm install` completes successfully
- [ ] `pnpm build` generates `dist/index.js`
- [ ] Application starts without crashes
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] Application is accessible at Railway URL

---

## Testing Locally

Test the build before deploying:

```bash
# Clean previous build
rm -rf dist/ node_modules/

# Install dependencies
pnpm install

# Run build
pnpm build

# Verify output
ls -lh dist/

# Test start command
node dist/index.js
```

Expected output:
```
dist/
├── index.js (157KB)
└── public/
    ├── index.html
    └── assets/
```

---

## Troubleshooting

### Issue: "pnpm: command not found"

**Solution**: Railway should auto-install pnpm. If not, try the Dockerfile approach.

### Issue: "Cannot find module 'dist/index.js'"

**Solution**: 
1. Check build logs for errors during `pnpm build`
2. Verify `dist/index.js` exists after build
3. Ensure `vite build` and `esbuild` both complete

### Issue: "Port already in use"

**Solution**: Ensure your app uses Railway's `PORT` environment variable:

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue: Database connection fails

**Solution**:
1. Add MySQL service in Railway
2. Verify `DATABASE_URL` is set in environment variables
3. Run migrations: `pnpm db:push` or add to build command

### Issue: Build succeeds but app crashes

**Solution**:
1. Check Railway logs for runtime errors
2. Verify all required environment variables are set
3. Test locally with same environment variables

---

## Required Environment Variables

For ShipTrack to work on Railway:

```bash
# Database (required)
DATABASE_URL=mysql://user:pass@host:port/database

# Email (required for notifications)
EMAILJS_PRIVATE_KEY=your-private-key
EMAIL_FROM=noreply@yourdomain.com

# Authentication (required)
JWT_SECRET=your-random-secret-key

# AWS S3 (optional, only if using custom storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# App Configuration (optional)
VITE_APP_TITLE=ShipTrack
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

---

## Build Time Optimization

If builds are slow, add to `nixpacks.toml`:

```toml
[phases.install]
cmds = ["pnpm install --frozen-lockfile --prefer-offline"]
```

This uses cached packages when available.

---

## Additional Resources

- **Nixpacks Documentation**: https://nixpacks.com/docs
- **Nixpacks Package Search**: https://search.nixos.org/packages
- **Railway Node.js Guide**: https://docs.railway.app/guides/nodejs
- **Railway pnpm Guide**: https://docs.railway.app/guides/pnpm
- **Railway Support**: https://railway.app/help

---

## Summary of All Fixes

| Error | Fix |
|-------|-----|
| Corepack signature verification | Remove corepack commands, let Nixpacks handle pnpm |
| `nodejs-22_x` undefined | Change to `nodejs_22` (underscores) |
| `--frozen-lockfile` issues | Use `pnpm install` without flags |

---

## Need More Help?

If build still fails:

1. **Try auto-detect**: Delete `nixpacks.toml` and `railway.json`
2. **Try Dockerfile**: More control, avoids Nixpacks complexity
3. **Share logs**: Copy full build log from Railway
4. **Check Railway status**: https://status.railway.app
5. **Contact support**: https://railway.app/help

---

**Status**: ✅ Configuration simplified - corepack removed, Nixpacks auto-detects pnpm. Ready to deploy!
