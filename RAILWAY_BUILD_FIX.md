# Railway Build Fix Guide

**TL;DR**: Delete `nixpacks.toml` and `railway.json` - let Railway auto-detect everything!

---

## Recommended Solution: Auto-Detect

Railway's auto-detection works best for Node.js + pnpm projects. **No configuration files needed.**

### What Railway Auto-Detects

- ✅ Node.js version from `package.json` or `.nvmrc`
- ✅ pnpm from `pnpm-lock.yaml`
- ✅ Install command: `pnpm install`
- ✅ Build command: `pnpm build`
- ✅ Start command: `node dist/index.js`

### How to Use Auto-Detect

**Simply don't include `nixpacks.toml` or `railway.json` in your repository.**

If you already have these files:

```bash
# Remove configuration files
rm nixpacks.toml railway.json

# Commit and push
git add -A
git commit -m "fix: Remove Nixpacks config, use Railway auto-detect"
git push origin main
```

Railway will automatically configure everything correctly.

---

## Common Errors (and why auto-detect fixes them)

### Error 1: "pnpm: command not found"

**Cause**: Nixpacks configuration doesn't properly install pnpm

**Fix**: Remove `nixpacks.toml` - Railway auto-detects pnpm from `pnpm-lock.yaml`

---

### Error 2: Corepack Signature Verification

```
Internal Error: Cannot find matching keyid
at verifySignature (/nix/store/.../corepack.cjs:21535:47)
```

**Cause**: Corepack fails in Nix environment

**Fix**: Remove `nixpacks.toml` - Railway uses its own pnpm installation

---

### Error 3: nodejs-22_x Undefined Variable

```
error: undefined variable 'nodejs-22_x'
```

**Cause**: Wrong Nix package name

**Fix**: Remove `nixpacks.toml` - Railway auto-detects Node.js version

---

### Error 4: --frozen-lockfile Issues

**Cause**: Lockfile out of sync or incompatible flags

**Fix**: Remove `nixpacks.toml` - Railway runs `pnpm install` without problematic flags

---

## Verification

After removing config files and redeploying, you should see:

```
✓ Detected Node.js
✓ Detected pnpm
✓ Running: pnpm install
✓ Running: pnpm build
✓ Build complete
✓ Starting: node dist/index.js
```

---

## Alternative: Dockerfile (If Auto-Detect Fails)

If auto-detect doesn't work, use a Dockerfile:

### Create `Dockerfile`

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

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

### No other configuration needed

Railway automatically detects the Dockerfile and uses it.

---

## Manual Nixpacks (Last Resort)

Only use custom Nixpacks if you have specific requirements.

### Minimal Working Configuration

**`nixpacks.toml`:**

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["npm install -g pnpm", "pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

**Key points:**
- Use `nodejs_22` (underscores, not hyphens)
- Install pnpm via npm, not corepack
- No `--frozen-lockfile` flag

---

## Troubleshooting

### Build still fails after removing config

**Try:**
1. Clear Railway build cache: Settings → "Clear Build Cache"
2. Trigger manual redeploy: Deployments → "Deploy"
3. Check Railway status: https://status.railway.app

### App builds but crashes on start

**Check:**
1. Environment variables are set
2. `DATABASE_URL` is configured
3. App uses `process.env.PORT` for port binding

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Database connection fails

**Solution:**
1. Add MySQL service in Railway
2. Verify `DATABASE_URL` is set automatically
3. Run migrations: `railway run pnpm db:push`

---

## Required Environment Variables

```bash
# Database (auto-set by Railway MySQL)
DATABASE_URL=mysql://...

# Email Service
EMAILJS_PRIVATE_KEY=your-key
EMAIL_FROM=noreply@yourdomain.com

# Authentication
JWT_SECRET=your-secret-32-chars-minimum

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

---

## Testing Locally

Ensure build works before deploying:

```bash
# Clean
rm -rf dist/ node_modules/

# Install
pnpm install

# Build
pnpm build

# Verify
ls -lh dist/
# Should show: index.js and public/

# Test start
node dist/index.js
```

---

## Summary of Fixes

| Error | Solution |
|-------|----------|
| pnpm not found | Remove nixpacks.toml, use auto-detect |
| Corepack signature | Remove nixpacks.toml, use auto-detect |
| nodejs-22_x undefined | Remove nixpacks.toml, use auto-detect |
| --frozen-lockfile | Remove nixpacks.toml, use auto-detect |
| Any Nixpacks error | **Remove nixpacks.toml, use auto-detect** |

---

## Additional Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Node.js Guide**: https://docs.railway.app/guides/nodejs
- **Railway pnpm Guide**: https://docs.railway.app/guides/pnpm
- **Nixpacks Documentation**: https://nixpacks.com/docs

---

**Bottom line**: Railway's auto-detection is the simplest and most reliable approach. Don't fight with Nixpacks configuration - let Railway handle it!
