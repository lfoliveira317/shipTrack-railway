# AWS S3 Setup Guide for ShipTrack

This guide walks you through setting up an AWS S3 bucket for file storage in ShipTrack, including creating IAM users, configuring permissions, and integrating with your application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create AWS Account](#step-1-create-aws-account)
3. [Step 2: Create S3 Bucket](#step-2-create-s3-bucket)
4. [Step 3: Configure Bucket Settings](#step-3-configure-bucket-settings)
5. [Step 4: Set Up CORS Configuration](#step-4-set-up-cors-configuration)
6. [Step 5: Create IAM User](#step-5-create-iam-user)
7. [Step 6: Configure IAM Permissions](#step-6-configure-iam-permissions)
8. [Step 7: Generate Access Keys](#step-7-generate-access-keys)
9. [Step 8: Update ShipTrack Configuration](#step-8-update-shiptrack-configuration)
10. [Step 9: Test the Integration](#step-9-test-the-integration)
11. [Security Best Practices](#security-best-practices)
12. [Cost Estimation](#cost-estimation)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS account (free tier eligible)
- Credit card for AWS account verification
- Access to ShipTrack project environment variables

---

## Step 1: Create AWS Account

1. Go to https://aws.amazon.com
2. Click **"Create an AWS Account"**
3. Fill in your email, password, and account name
4. Choose **"Personal"** account type
5. Enter payment information (free tier available)
6. Verify your identity via phone
7. Select **"Basic Support - Free"** plan
8. Complete sign-up

**Cost**: Free tier includes 5GB storage, 20,000 GET requests, and 2,000 PUT requests per month for 12 months.

---

## Step 2: Create S3 Bucket

1. **Sign in to AWS Console**: https://console.aws.amazon.com
2. **Navigate to S3**:
   - Search for "S3" in the top search bar
   - Click on **"S3"** service

3. **Create Bucket**:
   - Click **"Create bucket"** button
   - Enter bucket name: `shiptrack-storage-[your-unique-id]`
     - Example: `shiptrack-storage-prod-2026`
     - Must be globally unique and lowercase
     - No spaces or special characters except hyphens

4. **Choose AWS Region**:
   - Select region closest to your users
   - Recommended: `us-east-1` (N. Virginia) or `eu-west-1` (Ireland)
   - **Note**: Remember this region for later configuration

5. **Object Ownership**:
   - Select **"ACLs disabled (recommended)"**
   - Keep **"Bucket owner enforced"** selected

6. **Block Public Access Settings**:
   - **UNCHECK** "Block all public access"
   - Check the acknowledgment box
   - ⚠️ **Important**: We need public read access for uploaded files

7. **Bucket Versioning**:
   - Keep **"Disable"** (optional: enable for version history)

8. **Default Encryption**:
   - Select **"Server-side encryption with Amazon S3 managed keys (SSE-S3)"**
   - Keep **"Bucket Key"** enabled

9. Click **"Create bucket"**

---

## Step 3: Configure Bucket Settings

### 3.1 Enable Public Read Access for Objects

1. Click on your newly created bucket
2. Go to **"Permissions"** tab
3. Scroll to **"Bucket policy"**
4. Click **"Edit"**
5. Paste the following policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

6. Click **"Save changes"**

**What this does**: Allows anyone with the URL to view uploaded files (needed for images, documents, etc.)

---

## Step 4: Set Up CORS Configuration

CORS (Cross-Origin Resource Sharing) allows your web application to upload files directly to S3.

1. In your bucket, go to **"Permissions"** tab
2. Scroll to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**
4. Paste the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-app.railway.app",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
  }
]
```

5. **Update AllowedOrigins** with your actual domains
6. Click **"Save changes"**

---

## Step 5: Create IAM User

IAM (Identity and Access Management) users provide programmatic access to AWS services.

1. **Navigate to IAM**:
   - Search for "IAM" in AWS Console
   - Click **"IAM"** service

2. **Create User**:
   - In left sidebar, click **"Users"**
   - Click **"Create user"** button
   - Enter user name: `shiptrack-s3-user`
   - Click **"Next"**

3. **Set Permissions**:
   - Select **"Attach policies directly"**
   - Click **"Create policy"** (opens new tab)

---

## Step 6: Configure IAM Permissions

### 6.1 Create Custom Policy

In the new policy tab:

1. Click **"JSON"** tab
2. Paste the following policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ShipTrackS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

3. Click **"Next"**
4. Enter policy name: `ShipTrackS3Policy`
5. Enter description: "Allows ShipTrack to manage files in S3 bucket"
6. Click **"Create policy"**

### 6.2 Attach Policy to User

1. Go back to the user creation tab
2. Click the refresh button next to **"Filter policies"**
3. Search for `ShipTrackS3Policy`
4. Check the box next to your policy
5. Click **"Next"**
6. Review and click **"Create user"**

---

## Step 7: Generate Access Keys

1. Click on the newly created user (`shiptrack-s3-user`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Check the confirmation box
7. Click **"Next"**
8. (Optional) Add description tag: "ShipTrack Production"
9. Click **"Create access key"**

10. **⚠️ IMPORTANT**: Copy and save these credentials immediately:
    - **Access key ID**: `AKIA...` (20 characters)
    - **Secret access key**: `wJalrXUtnFEMI/K7MDENG/...` (40 characters)
    - **You cannot retrieve the secret key again!**

11. Click **"Download .csv file"** as backup
12. Store credentials securely (password manager, env file, etc.)

---

## Step 8: Update ShipTrack Configuration

### 8.1 Add Environment Variables

Add these variables to your deployment environment:

**For Railway:**
1. Go to your Railway project
2. Select your app service
3. Go to **"Variables"** tab
4. Add the following:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=shiptrack-storage-your-unique-id
```

**For Manus (if staying):**
1. Go to Management UI → Settings → Secrets
2. Add the same variables above

**For Local Development:**
1. Create `.env.local` file (already in `.gitignore`)
2. Add the variables above

### 8.2 Update Storage Service

The storage service (`server/storage.ts`) will automatically use your AWS credentials from environment variables. No code changes needed if you set the variables correctly.

**Verify the configuration:**

```typescript
// server/storage.ts should read from environment
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_REGION = process.env.AWS_S3_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
```

---

## Step 9: Test the Integration

### 9.1 Test Upload via Code

Create a test file: `server/test-s3-upload.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { storagePut } from './storage';

describe('S3 Upload Test', () => {
  it('should upload a test file to S3', async () => {
    const testContent = 'Hello from ShipTrack!';
    const testKey = `test-uploads/test-${Date.now()}.txt`;
    
    const result = await storagePut(
      testKey,
      Buffer.from(testContent),
      'text/plain'
    );
    
    expect(result.url).toContain('s3.amazonaws.com');
    console.log('✅ Test file uploaded:', result.url);
  });
});
```

Run the test:
```bash
pnpm test test-s3-upload
```

### 9.2 Test via Application

1. Deploy your application with new S3 credentials
2. Try uploading a document in ShipTrack
3. Verify the file appears in your S3 bucket:
   - Go to AWS Console → S3
   - Click on your bucket
   - Check for uploaded files

---

## Security Best Practices

### ✅ Do's

1. **Use IAM users** - Never use root account credentials
2. **Principle of least privilege** - Only grant necessary permissions
3. **Rotate access keys** - Change keys every 90 days
4. **Enable MFA** - Add multi-factor authentication to AWS account
5. **Monitor usage** - Set up CloudWatch alarms for unusual activity
6. **Use HTTPS** - Always access S3 over secure connections
7. **Encrypt sensitive files** - Use server-side encryption
8. **Set lifecycle policies** - Auto-delete old files to save costs

### ❌ Don'ts

1. **Never commit credentials** - Don't put keys in code or Git
2. **Don't make bucket fully public** - Only objects should be public
3. **Don't use wildcards in policies** - Be specific with permissions
4. **Don't share access keys** - Create separate IAM users for each service
5. **Don't ignore AWS security alerts** - Review all notifications

---

## Cost Estimation

### AWS S3 Pricing (as of 2026)

**Free Tier (First 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer out

**After Free Tier:**
- **Storage**: $0.023 per GB/month (first 50 TB)
- **PUT/POST requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer out**: $0.09 per GB (first 10 TB)

**Example Monthly Costs:**

| Usage Scenario | Storage | Requests | Transfer | Total |
|---------------|---------|----------|----------|-------|
| Small (10 GB, 10K requests) | $0.23 | $0.05 | $0.90 | **~$1.20** |
| Medium (50 GB, 50K requests) | $1.15 | $0.25 | $4.50 | **~$6.00** |
| Large (200 GB, 200K requests) | $4.60 | $1.00 | $18.00 | **~$24.00** |

**Cost Optimization Tips:**
1. Use S3 Intelligent-Tiering for automatic cost savings
2. Set lifecycle rules to delete old files
3. Enable S3 Transfer Acceleration only if needed
4. Compress files before uploading
5. Use CloudFront CDN for frequently accessed files

---

## Troubleshooting

### Issue: "Access Denied" Error

**Cause**: Incorrect IAM permissions or bucket policy

**Solution**:
1. Verify IAM policy includes `s3:PutObject` and `s3:GetObject`
2. Check bucket policy allows public read
3. Ensure AWS credentials are correct in environment variables
4. Verify bucket name matches in code and AWS

### Issue: CORS Error in Browser

**Cause**: CORS configuration not set or incorrect

**Solution**:
1. Add your domain to `AllowedOrigins` in CORS config
2. Include `http://localhost:3000` for local development
3. Ensure `AllowedMethods` includes `PUT` and `POST`
4. Clear browser cache and retry

### Issue: "Bucket Not Found"

**Cause**: Incorrect bucket name or region

**Solution**:
1. Double-check `AWS_S3_BUCKET` environment variable
2. Verify `AWS_S3_REGION` matches bucket region
3. Ensure bucket name is lowercase with no spaces
4. Check bucket exists in AWS Console

### Issue: High Costs

**Cause**: Excessive requests or data transfer

**Solution**:
1. Review CloudWatch metrics in AWS Console
2. Enable S3 request logging to identify sources
3. Implement caching to reduce GET requests
4. Use CloudFront CDN for static assets
5. Set up billing alerts in AWS

### Issue: Slow Upload/Download

**Cause**: Network latency or region mismatch

**Solution**:
1. Choose S3 region closest to your users
2. Enable S3 Transfer Acceleration (additional cost)
3. Use multipart upload for large files (>100MB)
4. Consider CloudFront CDN for global distribution

---

## Alternative: Cloudflare R2

If AWS S3 seems expensive, consider **Cloudflare R2**:

**Advantages:**
- ✅ S3-compatible API (minimal code changes)
- ✅ No egress fees (free data transfer out)
- ✅ Lower storage costs ($0.015/GB vs $0.023/GB)
- ✅ 10 GB free storage

**Setup is similar:**
1. Create Cloudflare account
2. Enable R2 in dashboard
3. Create bucket
4. Generate API tokens
5. Update `AWS_S3_ENDPOINT` to R2 endpoint

---

## Next Steps After Setup

1. ✅ Test file uploads in ShipTrack
2. ✅ Verify files are accessible via URLs
3. ✅ Set up CloudWatch monitoring
4. ✅ Configure billing alerts
5. ✅ Document bucket name and region for team
6. ✅ Schedule access key rotation (90 days)
7. ✅ Consider CloudFront CDN for production

---

## Additional Resources

- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **IAM Best Practices**: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- **S3 Pricing Calculator**: https://calculator.aws/
- **AWS Free Tier**: https://aws.amazon.com/free/
- **Cloudflare R2**: https://www.cloudflare.com/products/r2/

---

## Support

- **AWS Support**: https://console.aws.amazon.com/support/
- **ShipTrack Issues**: GitHub repository
- **Community**: AWS Developer Forums

---

**🎉 Congratulations!** Your ShipTrack application is now configured with AWS S3 storage.
