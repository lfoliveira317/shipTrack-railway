/**
 * Webhook Router
 * Handles webhook endpoints for external integrations
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { webhookEvents, shipments, notifications, users } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { sendEmail } from '../email-service';

// Webhook event schema
const webhookEventSchema = z.object({
  containerNumber: z.string(),
  eventType: z.enum([
    'customs_clearance',
    'gate_in',
    'gate_out',
    'vessel_departure',
    'vessel_arrival',
    'container_loaded',
    'container_discharged',
    'empty_return',
    'other'
  ]),
  eventData: z.record(z.string(), z.any()),
  source: z.string().optional(),
  apiKey: z.string(), // Simple API key authentication
});

/**
 * Process webhook event and send notifications
 */
async function processWebhookEvent(event: any): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Find shipment by container number
  const shipmentResult = await db
    .select()
    .from(shipments)
    .where(eq(shipments.container, event.containerNumber))
    .limit(1);

  const shipmentId = shipmentResult.length > 0 ? shipmentResult[0].id : null;

  // Store webhook event
  await db.insert(webhookEvents).values({
    shipmentId,
    containerNumber: event.containerNumber,
    eventType: event.eventType,
    eventData: JSON.stringify(event.eventData),
    source: event.source || 'unknown',
    processed: 1,
  });

  // Send notifications to users
  if (shipmentId) {
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      if (!user.emailNotifications || user.emailFrequency !== 'immediate') {
        continue;
      }

      // Create in-app notification
      await db.insert(notifications).values({
        userId: user.id,
        shipmentId,
        type: 'webhook_event',
        title: `Container Event: ${event.eventType.replace(/_/g, ' ').toUpperCase()}`,
        message: `Container ${event.containerNumber} - ${event.eventType.replace(/_/g, ' ')}`,
        isRead: 0,
      });

      // Send email notification
      if (user.email) {
        const eventTitle = event.eventType.replace(/_/g, ' ').toUpperCase();
        const html = generateWebhookEmailTemplate(
          event.containerNumber,
          eventTitle,
          event.eventData,
          event.source || 'External System'
        );

        await sendEmail({
          to: user.email,
          subject: `Container Event: ${eventTitle}`,
          html,
        });
      }
    }
  }

  console.log(`[Webhook] Processed ${event.eventType} for container ${event.containerNumber}`);
}

/**
 * Generate HTML email template for webhook events
 */
function generateWebhookEmailTemplate(
  containerNumber: string,
  eventTitle: string,
  eventData: any,
  source: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Container Event: ${eventTitle}</title>
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
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px;
    }
    .event-badge {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 10px 0;
    }
    .details-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #6c757d;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .cta-button {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 20px;
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
      <h1>📦 Container Event Notification</h1>
    </div>
    <div class="email-body">
      <p>A new event has been recorded for your container:</p>
      <div class="event-badge">${eventTitle}</div>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Container Number:</span>
          <span class="detail-value">${containerNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Event Type:</span>
          <span class="detail-value">${eventTitle}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Source:</span>
          <span class="detail-value">${source}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Timestamp:</span>
          <span class="detail-value">${new Date().toLocaleString()}</span>
        </div>
      </div>

      ${Object.keys(eventData).length > 0 ? `
        <h3>Event Details:</h3>
        <div class="details-box">
          ${Object.entries(eventData).map(([key, value]) => `
            <div class="detail-row">
              <span class="detail-label">${key.replace(/_/g, ' ').toUpperCase()}:</span>
              <span class="detail-value">${value}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <p style="margin-top: 30px;">
        <a href="${process.env.VITE_APP_URL || 'https://shiptrack.manus.space'}" class="cta-button">
          View in Dashboard
        </a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ShipTrack. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        This event was received from ${source} via webhook integration.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export const webhooksRouter = router({
  /**
   * Receive webhook event from external systems
   */
  receiveEvent: publicProcedure
    .input(webhookEventSchema)
    .mutation(async ({ input }) => {
      // Validate API key (simple authentication)
      const validApiKey = process.env.WEBHOOK_API_KEY || 'shiptrack-webhook-key-2024';
      
      if (input.apiKey !== validApiKey) {
        throw new Error('Invalid API key');
      }

      await processWebhookEvent(input);

      return {
        success: true,
        message: 'Webhook event received and processed',
      };
    }),

  /**
   * Get webhook events for a container
   */
  getEventsByContainer: publicProcedure
    .input(z.object({
      containerNumber: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const events = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.containerNumber, input.containerNumber))
        .orderBy(desc(webhookEvents.createdAt));

      return events.map(event => ({
        ...event,
        eventData: JSON.parse(event.eventData),
      }));
    }),

  /**
   * Get all webhook events
   */
  getAllEvents: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const events = await db
        .select()
        .from(webhookEvents)
        .orderBy(desc(webhookEvents.createdAt))
        .limit(100);

      return events.map(event => ({
        ...event,
        eventData: JSON.parse(event.eventData),
      }));
    }),
});
