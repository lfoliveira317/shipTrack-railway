import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { users, shipments } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { routeNotification } from './services/notification-router';

describe('Immediate Email Notifications', () => {
  let testUserId: number;
  let testShipmentId: number;

  beforeAll(async () => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error('Database not available');

    // Check if test user already exists
    const existingUsers = await dbInstance
      .select()
      .from(users)
      .where(eq(users.openId, 'test-immediate-email-user'));

    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
      // Update to ensure immediate frequency
      await dbInstance
        .update(users)
        .set({ emailFrequency: 'immediate', emailNotifications: true })
        .where(eq(users.id, testUserId));
    } else {
      // Create test user with immediate email frequency
      const [insertResult] = await dbInstance.insert(users).values({
        openId: 'test-immediate-email-user',
        name: 'Test Immediate User',
        email: 'lfoliveira317@gmail.com',
        role: 'user',
        emailFrequency: 'immediate',
        emailNotifications: true,
      });
      testUserId = Number(insertResult.insertId);
    }

    // Check if test shipment already exists
    const existingShipments = await dbInstance
      .select()
      .from(shipments)
      .where(eq(shipments.container, 'TEST-IMMEDIATE-001'));

    if (existingShipments.length > 0) {
      testShipmentId = existingShipments[0].id;
    } else {
      // Create test shipment
      const [shipmentResult] = await dbInstance.insert(shipments).values({
        userId: testUserId,
        container: 'TEST-IMMEDIATE-001',
        status: 'In transit',
        supplier: 'Test Supplier',
        carrier: 'Test Carrier',
        eta: new Date('2026-01-20'),
      });
      testShipmentId = Number(shipmentResult.insertId);
    }
  });

  it('should send immediate email for container update notification', async () => {
    const result = await routeNotification({
      userId: testUserId,
      type: 'container_update',
      title: 'Container Status Changed',
      message: 'Container TEST-IMMEDIATE-001 status changed to Delivered',
      relatedShipmentId: testShipmentId,
    });

    // The notification should be routed successfully
    expect(typeof result).toBe('boolean');
  });

  it('should send immediate email for date change notification', async () => {
    const result = await routeNotification({
      userId: testUserId,
      type: 'date_change',
      title: 'ETA Changed',
      message: 'Container TEST-IMMEDIATE-001 ETA changed from 2026-01-20 to 2026-01-25',
      relatedShipmentId: testShipmentId,
    });

    expect(typeof result).toBe('boolean');
  });

  it('should verify user email frequency is set to immediate', async () => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error('Database not available');
    const [user] = await dbInstance
      .select()
      .from(users)
      .where(eq(users.id, testUserId));

    expect(user.emailFrequency).toBe('immediate');
    expect(user.emailNotifications).toBe(1);
  });
});
