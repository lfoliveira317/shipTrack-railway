#!/usr/bin/env node

/**
 * Database Import Script for ShipTrack
 * Imports schema and data from SQL file to target database
 * 
 * Usage:
 *   TARGET_DATABASE_URL=mysql://... node scripts/import-database.mjs --input=backup.sql
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const inputArg = args.find(arg => arg.startsWith('--input='));
const inputFile = inputArg?.split('=')[1];

if (!inputFile) {
  console.error('❌ ERROR: No input file specified');
  console.error('');
  console.error('Usage:');
  console.error('  TARGET_DATABASE_URL=mysql://... node scripts/import-database.mjs --input=backup.sql');
  console.error('');
  process.exit(1);
}

if (!existsSync(inputFile)) {
  console.error(`❌ ERROR: Input file not found: ${inputFile}`);
  process.exit(1);
}

// Parse TARGET_DATABASE_URL from environment
const DATABASE_URL = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: TARGET_DATABASE_URL environment variable is not set');
  console.error('');
  console.error('Set it in your environment:');
  console.error('TARGET_DATABASE_URL=mysql://user:password@host:port/database node scripts/import-database.mjs --input=backup.sql');
  console.error('');
  process.exit(1);
}

// Parse MySQL connection string
const urlMatch = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!urlMatch) {
  console.error('❌ ERROR: Invalid DATABASE_URL format');
  console.error('Expected format: mysql://user:password@host:port/database');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('🚀 ShipTrack Database Import');
console.log('━'.repeat(50));
console.log(`📊 Target Database: ${database}`);
console.log(`🖥️  Host: ${host}:${port}`);
console.log(`👤 User: ${user}`);
console.log(`📁 Input: ${inputFile}`);
console.log('━'.repeat(50));
console.log('');

// Read input file to get size
const fileSize = (readFileSync(inputFile, 'utf8').length / 1024).toFixed(2);
console.log(`📊 File size: ${fileSize} KB`);
console.log('');

// Confirm import
console.log('⚠️  WARNING: This will DROP existing tables and import new data!');
console.log('');

// Build mysql command
const mysqlCmd = [
  'mysql',
  `-h${host}`,
  `-P${port}`,
  `-u${user}`,
  `-p${password}`,
  '--default-character-set=utf8mb4',
  database,
  `< ${inputFile}`
].join(' ');

console.log('📥 Importing database...');

try {
  // Execute mysql import
  execSync(mysqlCmd, {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024, // 100MB buffer
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('');
  console.log('✅ Import completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Verify data: node scripts/verify-database.mjs');
  console.log('   2. Test application with new database');
  console.log('   3. Update DATABASE_URL in your environment');
  console.log('');

} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('');
  console.error('Common issues:');
  console.error('  - mysql client not installed: Install MySQL client tools');
  console.error('  - Connection refused: Check host and port');
  console.error('  - Access denied: Verify username and password');
  console.error('  - Database not found: Create database first');
  console.error('  - Syntax errors: Check SQL file format');
  console.error('');
  console.error('To create the database first:');
  console.error(`  mysql -h${host} -P${port} -u${user} -p${password} -e "CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`);
  console.error('');
  process.exit(1);
}
