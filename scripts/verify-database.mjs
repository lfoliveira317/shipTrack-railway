#!/usr/bin/env node

/**
 * Database Verification Script for ShipTrack
 * Verifies database schema and data integrity
 * 
 * Usage:
 *   node scripts/verify-database.mjs
 *   TARGET_DATABASE_URL=mysql://... node scripts/verify-database.mjs
 */

import mysql from 'mysql2/promise';

// Parse DATABASE_URL from environment
const DATABASE_URL = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse MySQL connection string
const urlMatch = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!urlMatch) {
  console.error('❌ ERROR: Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('🔍 ShipTrack Database Verification');
console.log('━'.repeat(50));
console.log(`📊 Database: ${database}`);
console.log(`🖥️  Host: ${host}:${port}`);
console.log('━'.repeat(50));
console.log('');

// Expected tables in ShipTrack
const expectedTables = [
  'user',
  'shipment',
  'container',
  'document',
  'notification_settings',
  'notification_log'
];

async function verifyDatabase() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    });

    console.log('✅ Database connection successful');
    console.log('');

    // Check tables
    console.log('📋 Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log(`   Found ${tableNames.length} tables:`);
    tableNames.forEach(table => {
      const isExpected = expectedTables.includes(table);
      console.log(`   ${isExpected ? '✅' : '⚠️ '} ${table}`);
    });
    console.log('');

    // Check for missing tables
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('');
    }

    // Count records in each table
    console.log('📊 Record counts:');
    for (const table of tableNames) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = result[0].count;
        console.log(`   ${table}: ${count} records`);
      } catch (error) {
        console.log(`   ${table}: Error - ${error.message}`);
      }
    }
    console.log('');

    // Check user table structure
    if (tableNames.includes('user')) {
      console.log('👤 User table structure:');
      const [columns] = await connection.query('DESCRIBE `user`');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      console.log('');
    }

    // Check shipment table structure
    if (tableNames.includes('shipment')) {
      console.log('🚢 Shipment table structure:');
      const [columns] = await connection.query('DESCRIBE `shipment`');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      console.log('');
    }

    // Check indexes
    console.log('🔑 Checking indexes...');
    for (const table of ['user', 'shipment', 'container']) {
      if (tableNames.includes(table)) {
        const [indexes] = await connection.query(`SHOW INDEX FROM \`${table}\``);
        const indexNames = [...new Set(indexes.map(idx => idx.Key_name))];
        console.log(`   ${table}: ${indexNames.length} indexes (${indexNames.join(', ')})`);
      }
    }
    console.log('');

    console.log('✅ Verification complete!');
    console.log('');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase();
