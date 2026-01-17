# ShipTrack Deployment Documentation

This directory contains comprehensive guides for deploying ShipTrack to various platforms.

---

## 📚 Available Guides

### 1. **Railway Deployment**
**File**: `RAILWAY_DEPLOYMENT.md`

Complete guide for deploying ShipTrack to Railway.app, including:
- Step-by-step deployment instructions
- Database setup (MySQL)
- Environment variables configuration
- Custom domain setup
- Troubleshooting tips
- Cost estimates

**When to use**: Deploying to Railway platform

---

### 2. **AWS S3 Setup**
**File**: `AWS_S3_SETUP_GUIDE.md`

Comprehensive guide for setting up AWS S3 file storage, including:
- AWS account creation
- S3 bucket configuration
- IAM user and permissions setup
- CORS configuration
- Security best practices
- Cost estimation
- Troubleshooting

**When to use**: Need file storage for Railway or other platforms

---

### 3. **Storage Migration**
**File**: `STORAGE_MIGRATION_GUIDE.md`

Guide for migrating from Manus built-in storage to AWS S3, including:
- When to migrate
- Step-by-step migration process
- Code changes required
- API compatibility
- Rollback plan
- Best practices

**When to use**: Switching from Manus hosting to external platform

---

## 🚀 Quick Start

### Deploying to Railway

1. **Read**: `RAILWAY_DEPLOYMENT.md`
2. **Follow**: Steps 1-7 for basic deployment
3. **Optional**: Set up custom domain (Step 7)

### Setting Up File Storage

1. **Read**: `AWS_S3_SETUP_GUIDE.md`
2. **Follow**: Steps 1-9 to create and configure S3
3. **Migrate**: Use `STORAGE_MIGRATION_GUIDE.md` to switch storage

---

## 📋 Deployment Checklist

### Before Deployment

- [ ] Export code to GitHub (Settings → GitHub in Manus UI)
- [ ] Review environment variables needed
- [ ] Decide on authentication strategy (see Railway guide)
- [ ] Choose storage solution (Manus or AWS S3)

### Railway Deployment

- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Add MySQL database service
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Run database migrations
- [ ] Test application

### AWS S3 Setup (Optional)

- [ ] Create AWS account
- [ ] Create S3 bucket
- [ ] Configure bucket permissions and CORS
- [ ] Create IAM user with proper permissions
- [ ] Generate access keys
- [ ] Add credentials to environment variables
- [ ] Test file uploads

### Post-Deployment

- [ ] Test all features
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update EmailJS allowed domains
- [ ] Test email notifications
- [ ] Load production data

---

## 🔧 Configuration Files

### Railway Configuration
- `railway.json` - Railway deployment settings
- `nixpacks.toml` - Build configuration
- `.env.railway.example` - Environment variables template

### Storage Configuration
- `server/storage.ts` - Manus built-in storage (default)
- `server/storage-s3.ts` - AWS S3 storage implementation
- `server/test-s3-upload.test.ts` - S3 integration tests

---

## 🌐 Deployment Options Comparison

| Feature | Manus Hosting | Railway + S3 |
|---------|--------------|--------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐ Moderate |
| **Configuration** | Zero-config | Manual setup |
| **Database** | ✅ Included | ✅ MySQL addon |
| **File Storage** | ✅ Included | AWS S3 (separate) |
| **Custom Domain** | ✅ Supported | ✅ Supported |
| **Cost** | Manus plan | ~$5-20/month |
| **Scalability** | Platform limits | Highly scalable |
| **Control** | Limited | Full control |

---

## ⚠️ Important Notes

### Authentication
The current app uses **Manus OAuth** which won't work on Railway. Options:
1. Remove authentication (for internal use)
2. Implement Auth.js, Clerk, or Supabase Auth

See `RAILWAY_DEPLOYMENT.md` for details.

### File Storage
- **On Manus**: Use built-in storage (no changes needed)
- **On Railway**: Set up AWS S3 (see guides above)

### Email Service
- **EmailJS works on all platforms** - just add `EMAILJS_PRIVATE_KEY`

---

## 📞 Support

- **Railway**: https://docs.railway.app
- **AWS S3**: https://docs.aws.amazon.com/s3/
- **ShipTrack Issues**: GitHub repository

---

## 🎯 Recommended Path

### For Quick Demo/Internal Use
1. Stay on **Manus hosting** (simplest)
2. Use built-in storage
3. No migration needed

### For Production Deployment
1. Follow **Railway Deployment Guide**
2. Set up **AWS S3** for file storage
3. Implement proper authentication
4. Configure custom domain
5. Set up monitoring and backups

---

**Need help?** Check the specific guide for your use case or create an issue on GitHub.
