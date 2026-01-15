/**
 * Notification Router Service
 * Routes notifications based on user email frequency preferences
 */

import { sendEmail } from '../email-service';
import { getDb } from '../db';
import { users, notifications } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface NotificationParams {
  userId: number;
  type: 'container_update' | 'date_change' | 'missing_document' | 'webhook_event';
  title: string;
  message: string;
  emailSubject: string;
  emailHtml: string;
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
      const success = await sendEmail({
        to: userPrefs.email,
        subject: params.emailSubject,
        html: params.emailHtml,
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
