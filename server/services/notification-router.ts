/**
 * Notification Router Service
 * Routes notifications based on user email frequency preferences
 */

import { sendEmail, generateStatusChangeEmail } from '../email-service';
import { getDb } from '../db';
import { users, notifications } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface NotificationParams {
  userId: number;
  type: 'container_update' | 'date_change' | 'missing_document' | 'webhook_event';
  title: string;
  message: string;
  emailSubject?: string;
  emailHtml?: string;
  relatedShipmentId?: number;
}

/**
 * Generate default email HTML based on notification type
 */
function generateDefaultEmailHtml(params: NotificationParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f8f9fa;
      padding: 30px 20px;
      border-radius: 0 0 8px 8px;
    }
    .message {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🚢 ${params.title}</h1>
  </div>
  <div class="content">
    <div class="message">
      <p>${params.message}</p>
    </div>
    <p>This is an automated notification from your ShipTrack system.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Route notification based on user's email frequency preference
 * - immediate: send email now
 * - hourly/daily/weekly: store in notifications table, will be sent in next digest
 */
export async function routeNotification(params: NotificationParams): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[NotificationRouter] Database not available');
      return false;
    }

    // Get user preferences
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1);

    if (user.length === 0) {
      console.error(`[NotificationRouter] User ${params.userId} not found`);
      return false;
    }

    const userPrefs = user[0];

    // Check if email notifications are enabled
    if (!userPrefs.emailNotifications) {
      console.log(`[NotificationRouter] Email notifications disabled for user ${params.userId}`);
      // Still create in-app notification
      await db.insert(notifications).values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        isRead: 0,
      });
      return true;
    }

    // Create in-app notification
    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      isRead: 0,
    });

    // Route based on email frequency
    if (userPrefs.emailFrequency === 'immediate') {
      // Send email immediately
      if (!userPrefs.email) {
        console.error(`[NotificationRouter] User ${params.userId} has no email address`);
        return false;
      }
      console.log(`[NotificationRouter] Sending immediate email to ${userPrefs.email}`);
      
      // Use provided values or generate defaults
      const emailSubject = params.emailSubject || `ShipTrack: ${params.title}`;
      const emailHtml = params.emailHtml || generateDefaultEmailHtml(params);
      
      const success = await sendEmail({
        to: userPrefs.email,
        subject: emailSubject,
        html: emailHtml,
      });
      return success;
    } else {
      // Store for digest (notification is already in DB, will be picked up by digest)
      console.log(`[NotificationRouter] Queued for ${userPrefs.emailFrequency} digest: ${userPrefs.email}`);
      return true;
    }
  } catch (error) {
    console.error('[NotificationRouter] Error routing notification:', error);
    return false;
  }
}

/**
 * Route notification to multiple users
 */
export async function routeNotificationToUsers(
  userIds: number[],
  params: Omit<NotificationParams, 'userId'>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const userId of userIds) {
    const result = await routeNotification({
      ...params,
      userId,
    });

    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`[NotificationRouter] Routed to ${success} users, ${failed} failed`);
  return { success, failed };
}
