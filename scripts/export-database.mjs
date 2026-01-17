#!/usr/bin/env node

/**
 * Database Export Script for ShipTrack
 * Exports schema and data from current database to SQL file
 * 
 * Usage:
 *   node scripts/export-database.mjs
 *   node scripts/export-database.mjs --output=backup.sql
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const outputArg = args.find(arg => arg.startsWith('--output='));
const outputFile = outputArg 
  ? outputArg.split('=')[1] 
  : `backups/shiptrack-export-${new Date().toISOString().split('T')[0]}.sql`;

// Parse DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('');
  console.error('Set it in your environment or .env file:');
  console.error('DATABASE_URL=mysql://user:password@host:port/database');
  process.exit(1);
}

// Parse MySQL connection string
// Format: mysql://user:password@host:port/database
const urlMatch = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!urlMatch) {
  console.error('❌ ERROR: Invalid DATABASE_URL format');
  console.error('Expected format: mysql://user:password@host:port/database');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('🚀 ShipTrack Database Export');
console.log('━'.repeat(50));
console.log(`📊 Database: ${database}`);
console.log(`🖥️  Host: ${host}:${port}`);
console.log(`👤 User: ${user}`);
console.log(`📁 Output: ${outputFile}`);
console.log('━'.repeat(50));
console.log('');

// Create output directory if it doesn't exist
try {
  mkdirSync(dirname(outputFile), { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Build mysqldump command
const mysqldumpCmd = [
  'mysqldump',
  `-h${host}`,
  `-P${port}`,
  `-u${user}`,
  `-p${password}`,
  '--single-transaction',
  '--routines',
  '--triggers',
  '--events',
  '--add-drop-table',
  '--add-locks',
  '--extended-insert',
  '--set-charset',
  '--default-character-set=utf8mb4',
  database
].join(' ');

console.log('📤 Exporting database...');

try {
  // Execute mysqldump
  const output = execSync(mysqldumpCmd, {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024, // 100MB buffer
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Add header comment
  const header = `-- ShipTrack Database Export
-- Generated: ${new Date().toISOString()}
-- Database: ${database}
-- Host: ${host}:${port}
--
-- This file contains the complete schema and data for ShipTrack
-- Import with: mysql -u user -p database < ${outputFile}
--

`;

  // Write to file
  writeFileSync(outputFile, header + output, 'utf8');

  console.log('✅ Export completed successfully!');
  console.log('');
  console.log('📊 Export Summary:');
  console.log(`   File: ${outputFile}`);
  console.log(`   Size: ${(Buffer.byteLength(output, 'utf8') / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log(`   1. Review the export file: cat ${outputFile}`);
  console.log(`   2. Import to target database: node scripts/import-database.mjs --input=${outputFile}`);
  console.log('');

} catch (error) {
  console.error('❌ Export failed:', error.message);
  console.error('');
  console.error('Common issues:');
  console.error('  - mysqldump not installed: Install MySQL client tools');
  console.error('  - Connection refused: Check host and port');
  console.error('  - Access denied: Verify username and password');
  console.error('  - Database not found: Check database name');
  console.error('');
  process.exit(1);
}
