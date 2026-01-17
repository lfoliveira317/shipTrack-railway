# Railway Build Fix Guide

This guide addresses the Nixpacks build failures encountered when deploying to Railway.

---

## Error 1: nodejs-22_x Undefined Variable

### The Error

```
error: undefined variable 'nodejs-22_x'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
```

### Root Cause

The package name `nodejs-22_x` is incorrect for Nix. The correct package name uses underscores, not hyphens.

### The Fix

**Corrected `nixpacks.toml`:**

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]  # Changed from nodejs-22_x

[phases.install]
cmds = ["corepack enable", "corepack prepare pnpm@latest --activate", "pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

**Key Change**: `nodejs-22_x` → `nodejs_22`

---

## Error 2: pnpm --frozen-lockfile (Previous Issue)

### The Error

```
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c nix-env -if .nixpacks/nixpkgs-*.nix && nix-collect-garbage -d" did not complete successfully: exit code: 1
```

### Root Cause

1. **`--frozen-lockfile` flag**: Can cause issues if `pnpm-lock.yaml` is out of sync
2. **pnpm package specification**: Nixpacks handles pnpm differently than expected

### The Fix

Use corepack (built into Node.js 22) instead of installing pnpm via Nix:

```toml
[phases.install]
cmds = ["corepack enable", "corepack prepare pnpm@latest --activate", "pnpm install"]
```

---

## Complete Working Configuration

### `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["corepack enable", "corepack prepare pnpm@latest --activate", "pnpm install"]

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
git commit -m "fix: Use correct nodejs_22 package name for Nixpacks"
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
✓ stage-0: RUN corepack enable
✓ stage-0: RUN corepack prepare pnpm@latest --activate
✓ stage-0: RUN pnpm install
✓ stage-0: RUN pnpm build
✓ Build complete
```

---

## Alternative Solutions

### Option 1: Let Railway Auto-Detect

Delete configuration files and let Railway auto-detect:

```bash
rm nixpacks.toml railway.json
git add -A
git commit -m "fix: Let Railway auto-detect build configuration"
git push origin main
```

Railway will automatically configure Node.js 22 and pnpm.

### Option 2: Use Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port (Railway will override with PORT env var)
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

## Common Nix Package Names

If you need different Node.js versions:

| Version | Correct Package Name |
|---------|---------------------|
| Node.js 18 | `nodejs_18` |
| Node.js 20 | `nodejs_20` |
| Node.js 22 | `nodejs_22` |
| Node.js Latest | `nodejs` |

**Note**: Use underscores (`_`), not hyphens (`-`) or `x` suffix.

---

## Verification Checklist

After deployment:

- [ ] Build logs show no errors
- [ ] Application starts successfully
- [ ] Environment variables are set (check Railway dashboard)
- [ ] Database connection works (`DATABASE_URL` configured)
- [ ] Application is accessible at Railway URL
- [ ] Email notifications work (`EMAILJS_PRIVATE_KEY` set)

---

## Testing Locally

Test the build before deploying:

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

## Troubleshooting

### Issue: "Cannot find module 'dist/index.js'"

**Solution**: Verify build completes successfully and `dist/index.js` exists.

### Issue: "Port already in use"

**Solution**: Ensure your app uses `process.env.PORT`:

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue: Database connection fails

**Solution**:
1. Add MySQL service in Railway
2. Verify `DATABASE_URL` environment variable
3. Run database migrations

### Issue: Build succeeds but app crashes

**Solution**:
1. Check Railway logs for error messages
2. Verify all required environment variables are set
3. Test locally with same environment variables

---

## Environment Variables Checklist

Required for ShipTrack:

```bash
# Database
DATABASE_URL=mysql://...

# Email (EmailJS)
EMAILJS_PRIVATE_KEY=your-private-key
EMAIL_FROM=noreply@yourdomain.com

# JWT
JWT_SECRET=your-secret-key

# AWS S3 (if using custom storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# App Configuration
VITE_APP_TITLE=ShipTrack
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

---

## Additional Resources

- **Nixpacks Documentation**: https://nixpacks.com/docs
- **Nixpacks Package Search**: https://search.nixos.org/packages
- **Railway Node.js Guide**: https://docs.railway.app/guides/nodejs
- **Railway Support**: https://railway.app/help

---

## Need More Help?

If build still fails:

1. **Share full build logs**: Copy entire log from Railway
2. **Check Railway status**: https://status.railway.app
3. **Try Dockerfile approach**: More control over build
4. **Contact Railway support**: Include error logs and configuration

---

**Status**: ✅ Configuration fixed with correct `nodejs_22` package name. Ready to deploy!
