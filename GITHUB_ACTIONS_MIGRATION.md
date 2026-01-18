# GitHub Actions Database Migration Guide

Automate database migration from Manus to Railway using GitHub Actions workflows.

---

## Overview

Two GitHub Actions workflows are provided:

1. **`migrate-database.yml`** - One-time migration from Manus to Railway
2. **`backup-database.yml`** - Automated daily backups (scheduled or manual)

---

## Setup Instructions

### Step 1: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Required Secrets

**`MANUS_DATABASE_URL`**
```
mysql://user:password@manus-host:port/database
```
- Get from Manus Management UI → Database panel
- Click "Connection Info" to view credentials

**`RAILWAY_DATABASE_URL`**
```
mysql://user:password@railway-host:port/database
```
- Get from Railway dashboard → MySQL service → Variables tab
- Copy the `DATABASE_URL` value

### Step 2: Verify Secrets

Ensure both secrets are added correctly:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see:
   - `MANUS_DATABASE_URL`
   - `RAILWAY_DATABASE_URL`

---

## Usage

### One-Time Migration (Manus → Railway)

#### Via GitHub UI

1. Go to **Actions** tab in your repository
2. Select **"Database Migration (Manus → Railway)"** workflow
3. Click **"Run workflow"** button
4. Fill in the inputs:
   - **Confirm**: Type `MIGRATE` (required)
   - **Backup name**: Leave empty for auto-generated name, or specify custom name
5. Click **"Run workflow"**

#### What It Does

1. ✅ Exports database from Manus
2. ✅ Uploads backup as artifact (retained for 30 days)
3. ✅ Imports to Railway database
4. ✅ Verifies migration success
5. ✅ Provides summary and next steps

#### Expected Output

```
✅ Database migration completed successfully!

📊 Summary:
  - Source: Manus database
  - Target: Railway database
  - Backup: backups/migration-20260117-140530.sql

📋 Next steps:
  1. Verify data in Railway dashboard
  2. Test application with Railway database
  3. Update production DATABASE_URL
  4. Download backup artifact if needed
```

---

### Automated Daily Backups

#### Scheduled Backups

The workflow runs automatically **every day at 2 AM UTC**.

- Backs up Railway database (production)
- Compresses backup with gzip
- Uploads as artifact (retained for 30 days)
- No manual action required

#### Manual Backup

1. Go to **Actions** tab
2. Select **"Automated Database Backup"** workflow
3. Click **"Run workflow"**
4. Choose database:
   - **manus** - Backup Manus database
   - **railway** - Backup Railway database
5. Click **"Run workflow"**

---

## Workflow Details

### migrate-database.yml

**Trigger**: Manual (`workflow_dispatch`)

**Inputs**:
- `confirm` (required): Must type "MIGRATE" to proceed
- `backup_name` (optional): Custom backup filename

**Steps**:
1. Validate confirmation
2. Checkout code
3. Setup Node.js 22 and pnpm
4. Install MySQL client
5. Export from Manus
6. Upload backup artifact
7. Import to Railway
8. Verify Railway database
9. Show summary

**Duration**: ~5-10 minutes

**Artifacts**: Database backup (retained 30 days)

---

### backup-database.yml

**Trigger**: 
- Schedule: Daily at 2 AM UTC
- Manual: `workflow_dispatch`

**Inputs** (manual only):
- `database`: Choose "manus" or "railway"

**Steps**:
1. Checkout code
2. Setup Node.js 22 and pnpm
3. Install MySQL client
4. Determine database (Railway for scheduled, user choice for manual)
5. Export database
6. Compress with gzip
7. Upload artifact

**Duration**: ~3-5 minutes

**Artifacts**: Compressed backup (retained 30 days)

---

## Downloading Backups

### From GitHub Actions

1. Go to **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section
4. Click to download (e.g., `database-backup-railway-123.zip`)
5. Extract the ZIP file
6. Decompress SQL file: `gunzip backup.sql.gz`

### Using Artifacts

```bash
# Extract downloaded artifact
unzip database-backup-railway-123.zip

# Decompress SQL file
gunzip backup-railway-20260117-020015.sql.gz

# Import to local database
mysql -u root -p shiptrack_local < backup-railway-20260117-020015.sql

# Or use import script
TARGET_DATABASE_URL="mysql://..." node scripts/import-database.mjs --input=backup.sql
```

---

## Security Considerations

### Secrets Management

✅ **DO**:
- Store database URLs as GitHub Secrets
- Use separate secrets for source and target
- Rotate credentials regularly
- Limit repository access

❌ **DON'T**:
- Commit database URLs to code
- Share secrets in pull requests
- Use production credentials in public repos

### Backup Security

- Artifacts are private to repository collaborators
- Retained for 30 days (configurable)
- Compressed to save space
- Contains sensitive data - download securely

---

## Customization

### Change Backup Schedule

Edit `.github/workflows/backup-database.yml`:

```yaml
on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
    
    # Twice daily (2 AM and 2 PM UTC)
    # - cron: '0 2,14 * * *'
    
    # Weekly on Sundays at 3 AM UTC
    # - cron: '0 3 * * 0'
```

### Change Retention Period

Edit artifact retention:

```yaml
- name: Upload backup artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change to 7, 14, 60, 90, etc.
```

### Add Notifications

Add notification step (e.g., Slack, email):

```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"✅ Database backup completed"}'
```

---

## Troubleshooting

### Issue: "Confirmation text must be 'MIGRATE'"

**Solution**: Type exactly `MIGRATE` (uppercase) in the confirmation field.

### Issue: "DATABASE_URL environment variable is not set"

**Solution**: 
1. Verify secrets are added: Settings → Secrets and variables → Actions
2. Check secret names match exactly: `MANUS_DATABASE_URL`, `RAILWAY_DATABASE_URL`
3. Re-run workflow

### Issue: "mysql: command not found"

**Solution**: The workflow installs MySQL client automatically. If it fails:
- Check workflow logs for apt-get errors
- Ensure runner has internet access

### Issue: "Access denied for user"

**Solution**:
1. Verify database credentials in secrets
2. Test connection manually:
   ```bash
   mysql -h HOST -P PORT -u USER -pPASSWORD -e "SELECT 1;"
   ```
3. Check user has required permissions (SELECT, INSERT, CREATE, DROP)

### Issue: "Can't connect to MySQL server"

**Possible causes**:
1. **Firewall**: Ensure database allows connections from GitHub Actions IPs
2. **Wrong host/port**: Verify connection details
3. **SSL required**: Railway requires SSL - ensure `?ssl=true` in URL

**Solution for Railway**:
```
mysql://user:pass@host:port/db?ssl=true
```

### Issue: "Table already exists"

**Solution**: The import script includes `DROP TABLE IF EXISTS`. If this fails:
- Manually drop tables in Railway dashboard
- Or create a fresh database

### Issue: Workflow times out

**Solution**:
- Large databases may exceed default timeout (60 min)
- Increase timeout in workflow:
  ```yaml
  jobs:
    migrate:
      timeout-minutes: 120  # 2 hours
  ```

---

## Advanced Usage

### Migrate Specific Tables Only

Modify export script call in workflow:

```yaml
- name: Export specific tables
  run: |
    mysqldump -h HOST -P PORT -u USER -pPASS DATABASE user shipment > backup.sql
```

### Dry Run (Export Only, No Import)

Comment out import step in workflow:

```yaml
# - name: Import database to Railway
#   env:
#     TARGET_DATABASE_URL: ${{ secrets.RAILWAY_DATABASE_URL }}
#   run: |
#     node scripts/import-database.mjs --input="${{ env.BACKUP_FILE }}"
```

### Multi-Environment Migration

Add more secrets for different environments:

```yaml
secrets:
  STAGING_DATABASE_URL
  PRODUCTION_DATABASE_URL
```

Update workflow to accept environment input.

---

## Monitoring

### View Workflow History

1. Go to **Actions** tab
2. Select workflow
3. View all runs, statuses, and logs

### Check Backup Status

1. Go to **Actions** tab
2. Look for green checkmark (✅) or red X (❌)
3. Click run to view details

### Download Recent Backups

1. Go to **Actions** tab
2. Click recent workflow run
3. Scroll to **Artifacts**
4. Download backup

---

## Best Practices

1. **Test migration first**: Run migration to a test database before production
2. **Verify after migration**: Always check data integrity after import
3. **Keep backups**: Download important backups locally
4. **Monitor workflows**: Check Actions tab regularly for failures
5. **Rotate credentials**: Update secrets periodically
6. **Document changes**: Note migration dates and any issues

---

## Migration Checklist

Before migration:
- [ ] Add `MANUS_DATABASE_URL` secret
- [ ] Add `RAILWAY_DATABASE_URL` secret
- [ ] Verify Railway database is empty or ready to be overwritten
- [ ] Test workflow with dry run (export only)

During migration:
- [ ] Run migration workflow
- [ ] Type "MIGRATE" to confirm
- [ ] Monitor workflow progress
- [ ] Check for errors in logs

After migration:
- [ ] Download backup artifact
- [ ] Verify data in Railway dashboard
- [ ] Run verification script locally
- [ ] Test application with Railway database
- [ ] Update production `DATABASE_URL` environment variable
- [ ] Monitor application for issues

---

## FAQ

**Q: How long are backups retained?**  
A: 30 days by default. Configurable in workflow file.

**Q: Can I migrate from Railway back to Manus?**  
A: Yes, swap the secrets in the workflow or use the manual scripts.

**Q: What if migration fails halfway?**  
A: The backup artifact is still available. Railway database may be partially imported - drop tables and retry.

**Q: Can I schedule migrations?**  
A: Not recommended. Migrations should be manual and verified. Use scheduled backups instead.

**Q: How do I restore from a backup?**  
A: Download artifact, decompress, and use `import-database.mjs` script.

**Q: Can I run this locally instead of GitHub Actions?**  
A: Yes, use the scripts directly: `node scripts/export-database.mjs` and `node scripts/import-database.mjs`

---

## Summary

✅ **Migration**: Manual workflow with confirmation  
✅ **Backups**: Automated daily at 2 AM UTC  
✅ **Artifacts**: Retained for 30 days  
✅ **Security**: Secrets stored in GitHub  
✅ **Verification**: Automatic after migration  

**Ready to migrate?** Add secrets and run the workflow!
