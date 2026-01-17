# Storage Migration Guide: Manus → AWS S3

This guide helps you migrate from Manus built-in storage to AWS S3 when deploying ShipTrack to Railway or other platforms.

---

## Overview

ShipTrack currently uses **Manus built-in storage** (`server/storage.ts`) which works seamlessly on Manus hosting. When deploying to Railway or other platforms, you need to switch to **AWS S3** (`server/storage-s3.ts`).

---

## When to Migrate

✅ **Migrate to S3 if:**
- Deploying to Railway, Render, or other external platforms
- Need more storage than Manus provides
- Want direct control over storage costs
- Require advanced S3 features (lifecycle policies, versioning, etc.)

❌ **Stay on Manus storage if:**
- Hosting on Manus platform (already configured)
- Don't want to manage AWS infrastructure
- Prefer simpler setup with no external dependencies

---

## Migration Steps

### Step 1: Set Up AWS S3

Follow the comprehensive **AWS_S3_SETUP_GUIDE.md** to:
1. Create AWS account
2. Create S3 bucket
3. Configure permissions and CORS
4. Create IAM user
5. Generate access keys

### Step 2: Update Environment Variables

Add these to your deployment environment:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=shiptrack-storage-your-id
```

### Step 3: Switch Storage Implementation

**Option A: Replace the file (Recommended)**

Rename files to switch implementations:

```bash
# Backup original Manus storage
mv server/storage.ts server/storage-manus.ts.backup

# Use S3 storage
mv server/storage-s3.ts server/storage.ts
```

**Option B: Conditional logic**

Update `server/storage.ts` to detect environment:

```typescript
// server/storage.ts
const USE_AWS_S3 = process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID;

if (USE_AWS_S3) {
  // Use AWS S3
  export * from './storage-s3';
} else {
  // Use Manus storage (original implementation)
  // ... existing code
}
```

### Step 4: Test the Integration

Run the S3 upload test:

```bash
# Set environment variables first
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_S3_REGION=us-east-1
export AWS_S3_BUCKET=your-bucket

# Run tests
pnpm test test-s3-upload
```

Expected output:
```
✅ Test file uploaded successfully!
   Key: test-uploads/test-1234567890-abc123.txt
   URL: https://your-bucket.s3.us-east-1.amazonaws.com/test-uploads/...
```

### Step 5: Update Application Code (if needed)

Most code should work without changes, but verify these areas:

**Document uploads:**
```typescript
// This should work with both storage implementations
import { storagePut } from './storage';

const fileKey = `documents/${userId}/${filename}-${randomSuffix()}.pdf`;
const { url } = await storagePut(fileKey, fileBuffer, 'application/pdf');
```

**Image uploads:**
```typescript
import { storagePut } from './storage';

const imageKey = `images/${userId}/${imageName}-${randomSuffix()}.jpg`;
const { url } = await storagePut(imageKey, imageBuffer, 'image/jpeg');
```

### Step 6: Deploy and Verify

1. Deploy to Railway with new environment variables
2. Test file upload functionality in the app
3. Verify files appear in S3 bucket
4. Check file URLs are accessible

---

## Code Changes Summary

### Files to Update

| File | Change Required | Description |
|------|----------------|-------------|
| `server/storage.ts` | Replace or add conditional | Switch to S3 implementation |
| Environment variables | Add AWS credentials | Configure S3 access |
| `.env.railway.example` | Already updated | Template includes S3 vars |

### Files Already Compatible

These files use the storage service and require **no changes**:
- `server/routers.ts` - tRPC procedures
- `server/db.ts` - Database helpers
- `client/src/**/*` - Frontend components

---

## API Compatibility

Both storage implementations (`storage.ts` and `storage-s3.ts`) provide the same API:

```typescript
// Upload file
storagePut(key: string, data: Buffer, contentType?: string): Promise<{ key: string; url: string }>

// Get file URL (signed for private access)
storageGet(key: string, expiresIn?: number): Promise<{ key: string; url: string }>
```

**Additional S3-only function:**
```typescript
// Get public URL without signing
storageGetPublicUrl(key: string): { key: string; url: string }
```

---

## Cost Comparison

### Manus Storage
- Included with hosting plan
- No separate billing
- Storage limits based on plan
- Simple, no configuration needed

### AWS S3
- **Free tier**: 5GB storage, 20K GET, 2K PUT requests/month (first 12 months)
- **After free tier**: ~$0.023/GB/month + request costs
- **Example**: 10GB + 10K requests = ~$1.20/month
- More control and scalability

---

## Troubleshooting

### Issue: "AWS_S3_BUCKET environment variable is not set"

**Solution**: Add AWS environment variables to your deployment:
```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### Issue: "Access Denied" when uploading

**Solution**: 
1. Verify IAM user has `s3:PutObject` permission
2. Check bucket policy allows uploads
3. Ensure credentials are correct

### Issue: Files upload but URLs don't work

**Solution**:
1. Check bucket policy allows public read (`s3:GetObject`)
2. Verify CORS configuration includes your domain
3. Ensure bucket name in URL matches actual bucket

### Issue: CORS errors in browser

**Solution**:
1. Add your domain to S3 CORS configuration
2. Include `http://localhost:3000` for local testing
3. Restart application after CORS changes

---

## Rollback Plan

If S3 migration causes issues:

### On Railway:
1. Remove AWS environment variables
2. Restore original `server/storage.ts` from backup
3. Redeploy application

### On Manus:
- No changes needed, original storage still works

---

## Best Practices

### File Key Structure

Use organized key patterns:

```typescript
// Good: Organized by type and user
`documents/${userId}/${filename}-${randomSuffix()}.pdf`
`images/${userId}/profile-${timestamp}.jpg`
`exports/${userId}/report-${date}.csv`

// Bad: Flat structure, predictable names
`file.pdf`
`image.jpg`
`document-1.pdf`
```

### Security

1. **Add random suffixes** to prevent enumeration:
   ```typescript
   import { randomSuffix } from './storage-s3';
   const key = `docs/${filename}-${randomSuffix()}.pdf`;
   ```

2. **Store metadata in database**:
   ```typescript
   // Save to database
   await db.insert(documents).values({
     userId,
     filename: originalName,
     s3Key: key,
     s3Url: url,
     mimeType: 'application/pdf',
     size: buffer.length,
   });
   ```

3. **Use signed URLs for private files**:
   ```typescript
   // For private documents
   const { url } = await storageGet(key, 3600); // 1 hour expiration
   ```

### Performance

1. **Compress files before upload**:
   ```typescript
   import { gzip } from 'zlib';
   const compressed = await gzip(buffer);
   await storagePut(key, compressed, 'application/gzip');
   ```

2. **Use CloudFront CDN** for frequently accessed files

3. **Set lifecycle policies** to auto-delete old files

---

## Next Steps

After successful migration:

1. ✅ Monitor S3 usage in AWS Console
2. ✅ Set up billing alerts
3. ✅ Configure lifecycle policies for old files
4. ✅ Consider CloudFront CDN for production
5. ✅ Document S3 bucket details for team
6. ✅ Schedule access key rotation (90 days)

---

## Support Resources

- **AWS S3 Setup Guide**: `AWS_S3_SETUP_GUIDE.md`
- **Railway Deployment**: `RAILWAY_DEPLOYMENT.md`
- **AWS Documentation**: https://docs.aws.amazon.com/s3/
- **ShipTrack Issues**: GitHub repository

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.
