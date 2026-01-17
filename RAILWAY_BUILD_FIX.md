# Railway Build Fix Guide

This guide addresses the Nixpacks build failure you encountered when deploying to Railway.

---

## The Error

```
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636e7e301.nix && nix-collect-garbage -d" did not complete successfully: exit code: 1
Error: Docker build failed
```

---

## Root Cause

The original `nixpacks.toml` configuration had issues:
1. **`--frozen-lockfile` flag**: Can cause issues if `pnpm-lock.yaml` is out of sync
2. **pnpm package specification**: Nixpacks handles pnpm differently than expected
3. **Build command complexity**: Overcomplicated the build process

---

## The Fix

### Updated `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs-22_x"]

[phases.install]
cmds = ["corepack enable", "corepack prepare pnpm@latest --activate", "pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

### Key Changes

1. **Removed `pnpm` from nixPkgs**: Use corepack instead (built into Node.js 22)
2. **Removed `--frozen-lockfile`**: Allows pnpm to resolve dependencies flexibly
3. **Added corepack commands**: Properly enables and activates pnpm
4. **Simplified build**: Just run `pnpm build` without extra flags

### Updated `railway.json`

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

**Removed**: Custom `buildCommand` to let Nixpacks handle it automatically.

---

## How to Apply the Fix

### Step 1: Commit the Fixed Files

The updated `nixpacks.toml` and `railway.json` are already in your project. Commit them:

```bash
git add nixpacks.toml railway.json
git commit -m "fix: Update Nixpacks configuration for Railway deployment"
git push origin main
```

Or use **Manus Management UI** → Settings → GitHub → Export

### Step 2: Redeploy on Railway

1. Go to your Railway project
2. The new commit should trigger an automatic redeployment
3. Or manually trigger: **Deployments** → **Deploy**

### Step 3: Monitor the Build

Watch the build logs in Railway. You should see:

```
✓ stage-0: WORKDIR /app/
✓ stage-0: COPY .nixpacks/nixpkgs-*.nix .nixpacks/nixpkgs-*.nix
✓ stage-0: RUN nix-env -if .nixpacks/nixpkgs-*.nix
✓ stage-0: COPY . .
✓ stage-0: RUN corepack enable
✓ stage-0: RUN corepack prepare pnpm@latest --activate
✓ stage-0: RUN pnpm install
✓ stage-0: RUN pnpm build
✓ Build complete
```

---

## Alternative: Remove Nixpacks Configuration

If the issue persists, try letting Railway auto-detect the build:

### Option A: Delete Configuration Files

```bash
rm nixpacks.toml railway.json
git add -A
git commit -m "fix: Let Railway auto-detect build configuration"
git push origin main
```

Railway will automatically detect Node.js and configure the build.

### Option B: Use Dockerfile

Create a `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

Then update `railway.json`:

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

## Verification

After successful deployment, verify:

1. **Build logs show success**: No errors in Railway deployment logs
2. **Application starts**: Check Railway logs for startup messages
3. **Health check passes**: Visit your Railway URL
4. **Database connects**: Verify `DATABASE_URL` is set and working

---

## Common Issues After Fix

### Issue: "Cannot find module 'dist/index.js'"

**Cause**: Build didn't complete or output directory is wrong

**Solution**:
1. Check build logs for errors
2. Verify `pnpm build` completes successfully
3. Ensure `dist/index.js` exists after build

### Issue: "Port already in use"

**Cause**: Application trying to bind to fixed port

**Solution**: Update `server/_core/index.ts` to use Railway's `PORT` env var:

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue: Database connection fails

**Cause**: `DATABASE_URL` not set or incorrect

**Solution**:
1. Add MySQL service in Railway
2. Verify `DATABASE_URL` is in environment variables
3. Run migrations: Add to build command or run manually

---

## Testing Locally

Test the build process before deploying:

```bash
# Clean previous build
rm -rf dist/

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

## Additional Resources

- **Nixpacks Documentation**: https://nixpacks.com/docs
- **Railway Node.js Guide**: https://docs.railway.app/guides/nodejs
- **Railway Build Logs**: Check deployment details in Railway dashboard

---

## Need More Help?

If the build still fails:

1. **Share full build logs**: Copy entire log from Railway
2. **Check Railway status**: https://status.railway.app
3. **Try Dockerfile approach**: More control over build process
4. **Contact Railway support**: https://railway.app/help

---

**Status**: ✅ Fixed configuration files are ready. Push to GitHub and redeploy on Railway.
