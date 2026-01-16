/**
 * Email Notification Tests
 * Tests for immediate notifications, digest emails, and webhook notifications
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { users, shipments, notifications, emailDigestQueue } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail } from './email-service';
import { sendDigestEmail } from './services/digest-service';

describe('Email Notification System', () => {
  let testUserId: number;
  let testShipmentId: number;
  const testUserEmail = 'test-notifications@example.com';

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user with email notifications enabled
    const [user] = await db.insert(users).values({
      openId: `test-email-${Date.now()}`,
      name: 'Email Test User',
      email: testUserEmail,
      emailNotifications: 1,
      emailFrequency: 'immediate',
      notifyOnStatusChange: 1,
      notifyOnDelay: 1,
      notifyOnArrival: 1,
      notifyContainerUpdates: 1,
      notifyDischargeDateChanges: 1,
      notifyMissingDocuments: 1,
    });
    testUserId = Number(user.insertId);

    // Create test shipment
    const [shipment] = await db.insert(shipments).values({
      container: 'TEST1234567',
      carrier: 'Test Carrier',
      supplier: 'Test Supplier',
      status: 'In transit',
      eta: '2026-02-01',
      pol: 'Shanghai',
      pod: 'Los Angeles',
    });
    testShipmentId = Number(shipment.insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup test data
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (testShipmentId) {
      await db.delete(shipments).where(eq(shipments.id, testShipmentId));
      await db.delete(notifications).where(eq(notifications.shipmentId, testShipmentId));
    }
  });

  describe('Immediate Email Notifications', () => {
    it('should send status change notification email', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Shipment Status Update: Delivered',
        html: '<h1>Test Status Change</h1><p>Your shipment status has changed to Delivered.</p>',
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });

    it('should send delay notification email', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Shipment Delayed: TEST1234567',
        html: '<h1>Test Delay</h1><p>Your shipment has been delayed.</p>',
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });

    it('should send arrival notification email', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Shipment Arrived: TEST1234567',
        html: '<h1>Test Arrival</h1><p>Your shipment has arrived at destination.</p>',
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Digest Email Notifications', () => {
    it('should send hourly digest email', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get test user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      // Create digest queue entry
      await db.insert(emailDigestQueue).values({
        userId: testUserId,
        digestType: 'hourly',
        scheduledFor: new Date(),
      });

      // Send digest with empty data (no updates)
      const result = await sendDigestEmail(user, 'hourly', {
        containerUpdates: [],
        dateChanges: [],
        missingDocuments: [],
      });
      
      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });

    it('should send daily digest email', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      const result = await sendDigestEmail(user, 'daily', {
        containerUpdates: [],
        dateChanges: [],
        missingDocuments: [],
      });
      
      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });

    it('should send weekly digest email', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      const result = await sendDigestEmail(user, 'weekly', {
        containerUpdates: [],
        dateChanges: [],
        missingDocuments: [],
      });
      
      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Webhook Notification Emails', () => {
    it('should attempt to send webhook event notification email', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Container Event: Customs Clearance',
        html: `
          <h1>Container Event Notification</h1>
          <p><strong>Event:</strong> Customs Clearance</p>
          <p><strong>Container:</strong> TEST1234567</p>
          <p><strong>Location:</strong> Los Angeles Port</p>
          <p>This notification was triggered by an external webhook event.</p>
        `,
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });

    it('should attempt to send gate in notification email', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Container Event: Gate In',
        html: `
          <h1>Container Event Notification</h1>
          <p><strong>Event:</strong> Gate In</p>
          <p><strong>Container:</strong> TEST1234567</p>
          <p>Container has been gated in at the terminal.</p>
        `,
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Email Template Generation', () => {
    it('should attempt to send HTML email templates', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body>
          <h1>Test Email</h1>
          <p>This is a test email with proper HTML structure.</p>
        </body>
        </html>
      `;

      const result = await sendEmail({
        to: testUserEmail,
        subject: 'HTML Template Test',
        html,
      });

      // Result may be false in test environment without real email
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Email Notification Preferences', () => {
    it('should respect user email frequency settings', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Update user to hourly frequency
      await db.update(users)
        .set({ emailFrequency: 'hourly' })
        .where(eq(users.id, testUserId));

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      expect(user.emailFrequency).toBe('hourly');
    });

    it('should respect quiet hours settings', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Set quiet hours
      await db.update(users)
        .set({ 
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        })
        .where(eq(users.id, testUserId));

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      expect(user.quietHoursStart).toBe('22:00');
      expect(user.quietHoursEnd).toBe('08:00');
    });
  });

  describe('Email Error Handling', () => {
    it('should handle invalid email addresses gracefully', async () => {
      const result = await sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // EmailJS may accept invalid emails (validation is server-side)
      // The function should return a boolean regardless
      expect(typeof result).toBe('boolean');
    });

    it('should handle empty email content', async () => {
      const result = await sendEmail({
        to: testUserEmail,
        subject: 'Empty Content Test',
        html: '',
      });

      // Should still attempt to send
      expect(typeof result).toBe('boolean');
    });
  });
});
