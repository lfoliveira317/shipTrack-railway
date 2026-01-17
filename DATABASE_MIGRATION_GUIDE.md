# Database Migration Guide

Complete guide for exporting ShipTrack database and importing to another MySQL database (e.g., Railway, AWS RDS, or any MySQL server).

---

## Overview

This guide covers:
- ✅ Exporting complete database (schema + data)
- ✅ Importing to target MySQL database
- ✅ Verifying migration success
- ✅ Troubleshooting common issues

---

## Prerequisites

### Required Tools

**MySQL Client Tools** (includes `mysql` and `mysqldump`):

```bash
# macOS
brew install mysql-client

# Ubuntu/Debian
sudo apt-get install mysql-client

# Windows
# Download from: https://dev.mysql.com/downloads/mysql/
```

**Node.js** (already installed for ShipTrack):
- Version 22 or higher

---

## Quick Start

### 1. Export Current Database

```bash
# From ShipTrack project directory
node scripts/export-database.mjs
```

This creates: `backups/shiptrack-export-YYYY-MM-DD.sql`

### 2. Import to Target Database

```bash
# Set target database URL
export TARGET_DATABASE_URL="mysql://user:password@host:port/database"

# Import
node scripts/import-database.mjs --input=backups/shiptrack-export-YYYY-MM-DD.sql
```

### 3. Verify Migration

```bash
# Verify target database
TARGET_DATABASE_URL="mysql://..." node scripts/verify-database.mjs
```

---

## Detailed Steps

### Step 1: Export Database

The export script uses `mysqldump` to create a complete SQL backup.

**Basic export:**

```bash
node scripts/export-database.mjs
```

**Custom output file:**

```bash
node scripts/export-database.mjs --output=my-backup.sql
```

**What gets exported:**
- ✅ All table schemas
- ✅ All data (INSERT statements)
- ✅ Indexes and constraints
- ✅ Triggers and routines
- ✅ Character set configuration

**Output:**

```
🚀 ShipTrack Database Export
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Database: shiptrack
🖥️  Host: localhost:3306
👤 User: root
📁 Output: backups/shiptrack-export-2026-01-17.sql
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Exporting database...
✅ Export completed successfully!

📊 Export Summary:
   File: backups/shiptrack-export-2026-01-17.sql
   Size: 245.67 KB
```

---

### Step 2: Prepare Target Database

Before importing, ensure the target database exists.

**Option A: Create database via script**

```bash
# Set connection details
HOST="your-host.railway.app"
PORT="3306"
USER="root"
PASSWORD="your-password"
DATABASE="shiptrack"

# Create database
mysql -h$HOST -P$PORT -u$USER -p$PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Option B: Create via Railway**

1. Go to Railway project
2. Add MySQL service
3. Database is created automatically
4. Get `DATABASE_URL` from environment variables

**Option C: Create via AWS RDS**

1. Go to RDS console
2. Create MySQL instance
3. Note endpoint, port, username, password
4. Create database via MySQL Workbench or CLI

---

### Step 3: Import to Target Database

**Set target database URL:**

```bash
# Format: mysql://user:password@host:port/database
export TARGET_DATABASE_URL="mysql://root:password@railway-host:3306/shiptrack"
```

**Run import:**

```bash
node scripts/import-database.mjs --input=backups/shiptrack-export-2026-01-17.sql
```

**Output:**

```
🚀 ShipTrack Database Import
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Target Database: shiptrack
🖥️  Host: railway-host:3306
👤 User: root
📁 Input: backups/shiptrack-export-2026-01-17.sql
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 File size: 245.67 KB

⚠️  WARNING: This will DROP existing tables and import new data!

📥 Importing database...
✅ Import completed successfully!
```

---

### Step 4: Verify Migration

**Run verification script:**

```bash
TARGET_DATABASE_URL="mysql://..." node scripts/verify-database.mjs
```

**Expected output:**

```
🔍 ShipTrack Database Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Database: shiptrack
🖥️  Host: railway-host:3306
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Database connection successful

📋 Checking tables...
   Found 6 tables:
   ✅ user
   ✅ shipment
   ✅ container
   ✅ document
   ✅ notification_settings
   ✅ notification_log

📊 Record counts:
   user: 5 records
   shipment: 120 records
   container: 450 records
   document: 230 records
   notification_settings: 5 records
   notification_log: 89 records

✅ Verification complete!
```

---

## Migration Scenarios

### Scenario 1: Manus → Railway

```bash
# 1. Export from Manus
node scripts/export-database.mjs

# 2. Add MySQL service in Railway
# (Get DATABASE_URL from Railway dashboard)

# 3. Import to Railway
TARGET_DATABASE_URL="mysql://root:pass@railway.app:3306/railway" \
  node scripts/import-database.mjs --input=backups/shiptrack-export-2026-01-17.sql

# 4. Update Railway environment variable
# Set DATABASE_URL in Railway dashboard

# 5. Redeploy application
```

### Scenario 2: Manus → AWS RDS

```bash
# 1. Export from Manus
node scripts/export-database.mjs

# 2. Create RDS MySQL instance
# (Note endpoint: shiptrack.xxxxx.us-east-1.rds.amazonaws.com)

# 3. Import to RDS
TARGET_DATABASE_URL="mysql://admin:password@shiptrack.xxxxx.us-east-1.rds.amazonaws.com:3306/shiptrack" \
  node scripts/import-database.mjs --input=backups/shiptrack-export-2026-01-17.sql

# 4. Update application DATABASE_URL
# Set in environment or .env file

# 5. Restart application
```

### Scenario 3: Local Development → Production

```bash
# 1. Export from local
DATABASE_URL="mysql://root:password@localhost:3306/shiptrack_dev" \
  node scripts/export-database.mjs --output=prod-migration.sql

# 2. Import to production
TARGET_DATABASE_URL="mysql://prod_user:prod_pass@prod-host:3306/shiptrack_prod" \
  node scripts/import-database.mjs --input=prod-migration.sql

# 3. Verify production
TARGET_DATABASE_URL="mysql://prod_user:prod_pass@prod-host:3306/shiptrack_prod" \
  node scripts/verify-database.mjs
```

---

## Troubleshooting

### Issue: "mysqldump: command not found"

**Solution**: Install MySQL client tools

```bash
# macOS
brew install mysql-client
echo 'export PATH="/usr/local/opt/mysql-client/bin:$PATH"' >> ~/.zshrc

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-client

# Windows
# Download and install MySQL from: https://dev.mysql.com/downloads/mysql/
```

### Issue: "Access denied for user"

**Solution**: Verify credentials

```bash
# Test connection manually
mysql -h HOST -P PORT -u USER -pPASSWORD -e "SELECT 1;"

# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: mysql://user:password@host:port/database
```

### Issue: "Can't connect to MySQL server"

**Possible causes:**
1. **Firewall blocking connection**: Check security groups (AWS) or firewall rules
2. **Wrong host/port**: Verify connection details
3. **SSL required**: Add `?ssl=true` to DATABASE_URL

**Solution for Railway:**

Railway MySQL requires SSL. Update DATABASE_URL:

```bash
mysql://user:pass@host:port/db?ssl=true
```

### Issue: "Database does not exist"

**Solution**: Create database first

```bash
mysql -h HOST -P PORT -u USER -pPASSWORD -e "CREATE DATABASE shiptrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Issue: "Table already exists"

**Solution**: The import script includes `DROP TABLE IF EXISTS`. If this fails:

```bash
# Manually drop all tables
mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE -e "DROP DATABASE shiptrack; CREATE DATABASE shiptrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Then re-run import
node scripts/import-database.mjs --input=backup.sql
```

### Issue: "Packet too large"

**Solution**: Increase `max_allowed_packet`

```bash
# Add to my.cnf or pass as parameter
mysql --max_allowed_packet=512M -h HOST -P PORT -u USER -pPASSWORD DATABASE < backup.sql
```

### Issue: "Character set issues"

**Solution**: Ensure UTF-8 encoding

```bash
# Export with explicit charset
mysqldump --default-character-set=utf8mb4 ...

# Import with explicit charset
mysql --default-character-set=utf8mb4 ...
```

---

## Advanced Options

### Selective Export (Schema Only)

```bash
mysqldump -h HOST -P PORT -u USER -pPASSWORD --no-data DATABASE > schema-only.sql
```

### Selective Export (Data Only)

```bash
mysqldump -h HOST -P PORT -u USER -pPASSWORD --no-create-info DATABASE > data-only.sql
```

### Export Specific Tables

```bash
mysqldump -h HOST -P PORT -u USER -pPASSWORD DATABASE user shipment container > partial-backup.sql
```

### Compressed Export

```bash
mysqldump -h HOST -P PORT -u USER -pPASSWORD DATABASE | gzip > backup.sql.gz

# Import compressed
gunzip < backup.sql.gz | mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE
```

---

## Automation

### Scheduled Backups (Cron)

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * cd /path/to/shiptrack && node scripts/export-database.mjs --output=backups/daily-$(date +\%Y-\%m-\%d).sql
```

### Backup Rotation

```bash
# Keep only last 7 days
find backups/ -name "shiptrack-export-*.sql" -mtime +7 -delete
```

---

## Security Best Practices

1. **Never commit database dumps to Git**
   - Add `backups/` to `.gitignore`
   - Use secure file transfer (SCP, SFTP)

2. **Encrypt sensitive backups**
   ```bash
   # Encrypt
   gpg -c backup.sql
   
   # Decrypt
   gpg backup.sql.gpg
   ```

3. **Use environment variables for credentials**
   - Never hardcode passwords in scripts
   - Use `.env` files (not committed)

4. **Restrict database user permissions**
   - Create backup-specific user with read-only access
   - Grant only necessary privileges

---

## Checklist

Before migration:
- [ ] Export current database successfully
- [ ] Verify export file size and content
- [ ] Create target database
- [ ] Test connection to target database
- [ ] Backup existing data (if any) in target

During migration:
- [ ] Import SQL file to target database
- [ ] Check for import errors in output
- [ ] Verify table count matches source
- [ ] Verify record counts match source

After migration:
- [ ] Run verification script
- [ ] Test application with new DATABASE_URL
- [ ] Verify user login works
- [ ] Verify shipment data displays correctly
- [ ] Test email notifications
- [ ] Update production DATABASE_URL
- [ ] Keep backup of old database (7-30 days)

---

## Support

If you encounter issues:

1. **Check logs**: Review error messages carefully
2. **Verify credentials**: Test connection manually with `mysql` command
3. **Check network**: Ensure firewall allows MySQL port (3306)
4. **Review guides**: See `RAILWAY_DEPLOYMENT.md` for Railway-specific steps
5. **Contact support**: Provide error messages and connection details (without passwords)

---

## Summary

✅ **Export**: `node scripts/export-database.mjs`  
✅ **Import**: `TARGET_DATABASE_URL=... node scripts/import-database.mjs --input=backup.sql`  
✅ **Verify**: `TARGET_DATABASE_URL=... node scripts/verify-database.mjs`  

**Migration time**: ~5-10 minutes for typical ShipTrack database

---

**Ready to migrate?** Start with the export script and follow the steps above!
