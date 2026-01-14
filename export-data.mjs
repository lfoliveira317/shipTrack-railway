import { getDb } from './server/db.ts';
import { users, shipments, comments, attachments, notifications, apiConfigs } from './drizzle/schema.ts';

function escapeString(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function formatValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val;
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${escapeString(String(val))}'`;
}

(async () => {
  try {
    const db = await getDb();
    
    console.log('-- =====================================================');
    console.log('-- BEACON SHIPMENT TRACKING - DATABASE EXPORT');
    console.log('-- Generated:', new Date().toISOString());
    console.log('-- PostgreSQL Format');
    console.log('-- =====================================================\n');
    
    // Export users
    console.log('-- =====================================================');
    console.log('-- USERS TABLE');
    console.log('-- =====================================================');
    const usersData = await db.select().from(users);
    console.log(`-- Total records: ${usersData.length}\n`);
    
    if (usersData.length > 0) {
      usersData.forEach(u => {
        console.log(`INSERT INTO users (id, open_id, name, email, avatar, role, is_owner, is_collaborator, created_at)`);
        console.log(`VALUES (${u.id}, ${formatValue(u.openId)}, ${formatValue(u.name)}, ${formatValue(u.email)}, ${formatValue(u.avatar)}, ${formatValue(u.role)}, ${formatValue(u.isOwner)}, ${formatValue(u.isCollaborator)}, ${formatValue(u.createdAt)});`);
      });
    }
    
    // Export shipments
    console.log('\n-- =====================================================');
    console.log('-- SHIPMENTS TABLE');
    console.log('-- =====================================================');
    const shipmentsData = await db.select().from(shipments);
    console.log(`-- Total records: ${shipmentsData.length}\n`);
    
    if (shipmentsData.length > 0) {
      shipmentsData.forEach(s => {
        console.log(`INSERT INTO shipments (id, order_number, supplier, cro, container_number, mawb_number, carrier, status, atd, eta, ata, label, shipment_type, pol, pod, vessel, voyage, commodity, weight, volume, created_at, updated_at)`);
        console.log(`VALUES (${s.id}, ${formatValue(s.orderNumber)}, ${formatValue(s.supplier)}, ${formatValue(s.cro)}, ${formatValue(s.containerNumber)}, ${formatValue(s.mawbNumber)}, ${formatValue(s.carrier)}, ${formatValue(s.status)}, ${formatValue(s.atd)}, ${formatValue(s.eta)}, ${formatValue(s.ata)}, ${formatValue(s.label)}, ${formatValue(s.shipmentType)}, ${formatValue(s.pol)}, ${formatValue(s.pod)}, ${formatValue(s.vessel)}, ${formatValue(s.voyage)}, ${formatValue(s.commodity)}, ${formatValue(s.weight)}, ${formatValue(s.volume)}, ${formatValue(s.createdAt)}, ${formatValue(s.updatedAt)});`);
      });
    }
    
    // Export comments
    console.log('\n-- =====================================================');
    console.log('-- COMMENTS TABLE');
    console.log('-- =====================================================');
    const commentsData = await db.select().from(comments);
    console.log(`-- Total records: ${commentsData.length}\n`);
    
    if (commentsData.length > 0) {
      commentsData.forEach(c => {
        console.log(`INSERT INTO comments (id, shipment_id, user_id, user_name, user_avatar, comment, created_at)`);
        console.log(`VALUES (${c.id}, ${c.shipmentId}, ${c.userId}, ${formatValue(c.userName)}, ${formatValue(c.userAvatar)}, ${formatValue(c.comment)}, ${formatValue(c.createdAt)});`);
      });
    }
    
    // Export attachments
    console.log('\n-- =====================================================');
    console.log('-- ATTACHMENTS TABLE');
    console.log('-- =====================================================');
    const attachmentsData = await db.select().from(attachments);
    console.log(`-- Total records: ${attachmentsData.length}\n`);
    
    if (attachmentsData.length > 0) {
      attachmentsData.forEach(a => {
        console.log(`INSERT INTO attachments (id, shipment_id, filename, file_size, file_type, uploaded_by, uploaded_at, s3_key, s3_url)`);
        console.log(`VALUES (${a.id}, ${a.shipmentId}, ${formatValue(a.filename)}, ${a.fileSize}, ${formatValue(a.fileType)}, ${formatValue(a.uploadedBy)}, ${formatValue(a.uploadedAt)}, ${formatValue(a.s3Key)}, ${formatValue(a.s3Url)});`);
      });
    }
    
    // Export notifications
    console.log('\n-- =====================================================');
    console.log('-- NOTIFICATIONS TABLE');
    console.log('-- =====================================================');
    const notificationsData = await db.select().from(notifications);
    console.log(`-- Total records: ${notificationsData.length}\n`);
    
    if (notificationsData.length > 0) {
      notificationsData.forEach(n => {
        console.log(`INSERT INTO notifications (id, user_id, type, title, message, shipment_id, is_read, created_at)`);
        console.log(`VALUES (${n.id}, ${n.userId}, ${formatValue(n.type)}, ${formatValue(n.title)}, ${formatValue(n.message)}, ${formatValue(n.shipmentId)}, ${formatValue(n.isRead)}, ${formatValue(n.createdAt)});`);
      });
    }
    
    // Export API configs
    console.log('\n-- =====================================================');
    console.log('-- API CONFIGS TABLE');
    console.log('-- =====================================================');
    const apiConfigsData = await db.select().from(apiConfigs);
    console.log(`-- Total records: ${apiConfigsData.length}\n`);
    
    if (apiConfigsData.length > 0) {
      apiConfigsData.forEach(a => {
        console.log(`INSERT INTO api_configs (id, config_type, carrier, api_url, api_port, api_token, api_user, api_password, created_at, updated_at)`);
        console.log(`VALUES (${a.id}, ${formatValue(a.configType)}, ${formatValue(a.carrier)}, ${formatValue(a.apiUrl)}, ${formatValue(a.apiPort)}, ${formatValue(a.apiToken)}, ${formatValue(a.apiUser)}, ${formatValue(a.apiPassword)}, ${formatValue(a.createdAt)}, ${formatValue(a.updatedAt)});`);
      });
    }
    
    console.log('\n-- =====================================================');
    console.log('-- EXPORT COMPLETE');
    console.log('-- =====================================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
})();
