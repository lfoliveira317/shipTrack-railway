/**
 * Email Digest Service
 * Handles scheduled email digests (hourly, daily, weekly)
 */

import { getDb } from '../db';
import { users, shipments, attachments, trackingHistory, emailDigestQueue } from '../../drizzle/schema';
import { eq, and, gte, lte, sql, isNull, desc } from 'drizzle-orm';
import { sendEmail } from '../email-service';
// Email templates imported but not used in digest - we generate inline

interface DigestData {
  containerUpdates: any[];
  dateChanges: any[];
  missingDocuments: any[];
}

/**
 * Check if current time is within user's quiet hours
 */
function isInQuietHours(user: any): boolean {
  if (!user.quietHoursStart || !user.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const userTimezone = user.timezone || 'UTC';
  
  // Get current time in user's timezone
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Parse quiet hours
  const [startHour, startMinute] = user.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = user.quietHoursEnd.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentTimeMinutes >= startMinutes || currentTimeMinutes <= endMinutes;
  }

  return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
}

/**
 * Get digest data for a specific time period
 */
async function getDigestData(hoursBack: number): Promise<DigestData> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  // Get container updates from tracking history
  const recentUpdates = await db
    .select({
      shipmentId: trackingHistory.shipmentId,
      eventType: trackingHistory.eventType,
      eventDescription: trackingHistory.eventDescription,
      location: trackingHistory.location,
      eventTimestamp: trackingHistory.eventTimestamp,
      createdAt: trackingHistory.createdAt,
    })
    .from(trackingHistory)
    .where(gte(trackingHistory.createdAt, cutoffTime))
    .orderBy(desc(trackingHistory.createdAt));

  // Get shipment details for updates
  const shipmentIds = Array.from(new Set(recentUpdates.map((u: any) => u.shipmentId)));
  const containerUpdates = [];

  for (const shipmentId of shipmentIds) {
    const shipment = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);

    if (shipment.length > 0) {
      const updates = recentUpdates.filter((u: any) => u.shipmentId === shipmentId);
      const changes = updates.map((u: any) => u.eventDescription);

      containerUpdates.push({
        containerNumber: shipment[0].container,
        supplier: shipment[0].supplier || 'N/A',
        cro: shipment[0].cro || 'N/A',
        carrier: shipment[0].carrier,
        status: shipment[0].status,
        pol: shipment[0].pol || 'N/A',
        pod: shipment[0].pod || 'N/A',
        atd: shipment[0].atd,
        eta: shipment[0].eta,
        ata: shipment[0].ata,
        vesselName: 'N/A',
        voyageNumber: 'N/A',
        changes,
      });
    }
  }

  // Get discharge date changes (shipments with updated ETA/ATA)
  const dateChanges = await db
    .select()
    .from(shipments)
    .where(gte(shipments.updatedAt, cutoffTime))
    .orderBy(desc(shipments.updatedAt));

  const dateChangeData = dateChanges.map((s: any) => ({
    containerNumber: s.container,
    supplier: s.supplier || 'N/A',
    cro: s.cro || 'N/A',
    carrier: s.carrier,
    pod: s.pod || 'N/A',
    previousEta: null,
    newEta: s.eta,
    previousAta: null,
    newAta: s.ata,
    delayDays: 0,
  }));

  // Get containers with missing documents
  const allShipments = await db.select().from(shipments);
  const missingDocuments = [];

  for (const shipment of allShipments) {
    const docs = await db
      .select()
      .from(attachments)
      .where(eq(attachments.shipmentId, shipment.id));

    const requiredDocTypes = ['BOL', 'Purchase Invoice', 'Packing Slip'];
    const existingDocTypes = docs.map((d: any) => d.documentType).filter(Boolean);
    const missingDocTypes = requiredDocTypes.filter((dt: string) => !existingDocTypes.includes(dt));

    if (missingDocTypes.length > 0) {
      missingDocuments.push({
        containerNumber: shipment.container,
        supplier: shipment.supplier || 'N/A',
        cro: shipment.cro || 'N/A',
        carrier: shipment.carrier,
        status: shipment.status,
        eta: shipment.eta,
        missingDocTypes,
      });
    }
  }

  return {
    containerUpdates,
    dateChanges: dateChangeData,
    missingDocuments,
  };
}

/**
 * Send digest email to a user
 */
async function sendDigestEmail(
  user: any,
  digestType: 'hourly' | 'daily' | 'weekly',
  data: DigestData
): Promise<boolean> {
  if (!user.email || !user.emailNotifications) {
    return false;
  }

  // Check quiet hours
  if (isInQuietHours(user)) {
    console.log(`[Digest] Skipping email for ${user.email} - in quiet hours`);
    return false;
  }

  const subject = `ShipTrack ${digestType.charAt(0).toUpperCase() + digestType.slice(1)} Digest`;
  
  // Generate combined digest email
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 800px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .section h2 {
      color: #FF5722;
      margin-top: 0;
    }
    .summary-box {
      background-color: #fff;
      border-left: 4px solid #FF5722;
      padding: 15px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🚢 ShipTrack ${digestType.charAt(0).toUpperCase() + digestType.slice(1)} Digest</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString()}</p>
    </div>
    <div class="email-body">
      <p>Hello ${user.name || 'there'},</p>
      <p>Here's your ${digestType} summary of shipment activities:</p>
  `;

  // Add container updates section
  if (user.notifyContainerUpdates && data.containerUpdates.length > 0) {
    html += `
      <div class="section">
        <h2>📦 Container Updates (${data.containerUpdates.length})</h2>
        ${data.containerUpdates.slice(0, 5).map(update => `
          <div class="summary-box">
            <strong>${update.containerNumber}</strong> - ${update.carrier}<br>
            <small>Status: ${update.status} | Changes: ${update.changes.length}</small>
          </div>
        `).join('')}
        ${data.containerUpdates.length > 5 ? `<p><em>...and ${data.containerUpdates.length - 5} more updates</em></p>` : ''}
      </div>
    `;
  }

  // Add date changes section
  if (user.notifyDischargeDateChanges && data.dateChanges.length > 0) {
    html += `
      <div class="section">
        <h2>📅 Discharge Date Changes (${data.dateChanges.length})</h2>
        ${data.dateChanges.slice(0, 5).map(change => `
          <div class="summary-box">
            <strong>${change.containerNumber}</strong> - ${change.carrier}<br>
            <small>POD: ${change.pod} | New ETA: ${change.newEta || 'TBD'}</small>
          </div>
        `).join('')}
        ${data.dateChanges.length > 5 ? `<p><em>...and ${data.dateChanges.length - 5} more changes</em></p>` : ''}
      </div>
    `;
  }

  // Add missing documents section
  if (user.notifyMissingDocuments && data.missingDocuments.length > 0) {
    html += `
      <div class="section">
        <h2>📄 Missing Documents (${data.missingDocuments.length})</h2>
        ${data.missingDocuments.slice(0, 5).map(doc => `
          <div class="summary-box">
            <strong>${doc.containerNumber}</strong> - ${doc.carrier}<br>
            <small>Missing: ${doc.missingDocTypes.join(', ')}</small>
          </div>
        `).join('')}
        ${data.missingDocuments.length > 5 ? `<p><em>...and ${data.missingDocuments.length - 5} more containers</em></p>` : ''}
      </div>
    `;
  }

  // Check if there's any content
  const hasContent = 
    (user.notifyContainerUpdates && data.containerUpdates.length > 0) ||
    (user.notifyDischargeDateChanges && data.dateChanges.length > 0) ||
    (user.notifyMissingDocuments && data.missingDocuments.length > 0);

  if (!hasContent) {
    html += `
      <div class="section">
        <p>✅ No new updates during this period. All shipments are on track!</p>
      </div>
    `;
  }

  html += `
      <p style="margin-top: 30px;">
        <a href="${process.env.VITE_APP_URL || 'https://shiptrack.manus.space'}" 
           style="display: inline-block; background-color: #FF5722; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 4px; font-weight: 600;">
          View Full Dashboard
        </a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        You're receiving this because you enabled ${digestType} digest emails in your notification settings.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
}

/**
 * Process scheduled digest emails
 */
export async function processScheduledDigests(): Promise<void> {
  console.log('[Digest] Processing scheduled digests...');

  const db = await getDb();
  if (!db) {
    console.error('[Digest] Database not available');
    return;
  }

  const now = new Date();

  // Get pending digests that are due
  const pendingDigests = await db
    .select()
    .from(emailDigestQueue)
    .where(
      and(
        eq(emailDigestQueue.sent, 0),
        lte(emailDigestQueue.scheduledFor, now)
      )
    );

  console.log(`[Digest] Found ${pendingDigests.length} pending digests`);

  for (const digest of pendingDigests) {
    try {
      // Get user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, digest.userId))
        .limit(1);

      if (userResult.length === 0) {
        console.log(`[Digest] User ${digest.userId} not found, skipping`);
        continue;
      }

      const user = userResult[0];

      // Get digest data based on type
      let hoursBack = 1;
      if (digest.digestType === 'daily') hoursBack = 24;
      if (digest.digestType === 'weekly') hoursBack = 168;

      const data = await getDigestData(hoursBack);

      // Send digest
      const sent = await sendDigestEmail(user, digest.digestType, data);

      if (sent) {
        // Mark as sent
        await db
          .update(emailDigestQueue)
          .set({ sent: 1, sentAt: new Date() })
          .where(eq(emailDigestQueue.id, digest.id));

        console.log(`[Digest] Sent ${digest.digestType} digest to ${user.email}`);
      }
    } catch (error: any) {
      console.error(`[Digest] Error processing digest ${digest.id}:`, error.message);
    }
  }
}

/**
 * Schedule digests for all users based on their preferences
 */
export async function scheduleDigests(): Promise<void> {
  console.log('[Digest] Scheduling digests for users...');

  const db = await getDb();
  if (!db) {
    console.error('[Digest] Database not available');
    return;
  }

  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    if (!user.emailNotifications || user.emailFrequency === 'immediate') {
      continue;
    }

    try {
      const now = new Date();
      let scheduledFor = new Date();

      // Calculate next scheduled time based on frequency
      if (user.emailFrequency === 'hourly') {
        scheduledFor = new Date(now.getTime() + 60 * 60 * 1000);
      } else if (user.emailFrequency === 'daily') {
        scheduledFor.setDate(scheduledFor.getDate() + 1);
        scheduledFor.setHours(9, 0, 0, 0); // 9 AM next day
      } else if (user.emailFrequency === 'weekly') {
        scheduledFor.setDate(scheduledFor.getDate() + 7);
        scheduledFor.setHours(9, 0, 0, 0); // 9 AM next week
      }

      // Check if already scheduled
      const existing = await db
        .select()
        .from(emailDigestQueue)
        .where(
          and(
            eq(emailDigestQueue.userId, user.id),
            eq(emailDigestQueue.digestType, user.emailFrequency as any),
            eq(emailDigestQueue.sent, 0)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Schedule new digest
        await db.insert(emailDigestQueue).values({
          userId: user.id,
          digestType: user.emailFrequency as any,
          scheduledFor,
          sent: 0,
        });

        console.log(`[Digest] Scheduled ${user.emailFrequency} digest for ${user.email}`);
      }
    } catch (error: any) {
      console.error(`[Digest] Error scheduling digest for user ${user.id}:`, error.message);
    }
  }
}
