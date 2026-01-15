/**
 * Tests for notification preferences, webhooks, and digest functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Notification Preferences', () => {
  let testUserId: number;
  let testContext: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Create or get test user
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, 'prefs-test@example.com'))
      .limit(1);

    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
    } else {
      const result = await db.insert(users).values({
        openId: 'test-prefs-open-id',
        name: 'Prefs Test User',
        email: 'prefs-test@example.com',
        role: 'user',
      });
      testUserId = Number(result.insertId);
    }

    // Create test context
    testContext = {
      user: {
        id: testUserId,
        openId: 'test-prefs-open-id',
        name: 'Prefs Test User',
        email: 'prefs-test@example.com',
        role: 'user',
      },
      req: {} as any,
      res: {} as any,
    };
  });

  it('should get notification preferences', async () => {
    const caller = appRouter.createCaller(testContext);
    
    const preferences = await caller.userPreferences.getNotificationPreferences();
    
    expect(preferences).toBeDefined();
    expect(preferences.emailNotifications).toBeDefined();
    expect(preferences.emailFrequency).toBeDefined();
  });

  it('should update email frequency to daily', async () => {
    const caller = appRouter.createCaller(testContext);
    
    const result = await caller.userPreferences.updateNotificationPreferences({
      emailFrequency: 'daily',
    });
    
    expect(result.success).toBe(true);
    
    const preferences = await caller.userPreferences.getNotificationPreferences();
    expect(preferences.emailFrequency).toBe('daily');
  });

  it('should update quiet hours', async () => {
    const caller = appRouter.createCaller(testContext);
    
    await caller.userPreferences.updateNotificationPreferences({
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });
    
    const preferences = await caller.userPreferences.getNotificationPreferences();
    expect(preferences.quietHoursStart).toBe('22:00');
    expect(preferences.quietHoursEnd).toBe('08:00');
  });
});

describe('Webhook Events', () => {
  const testApiKey = process.env.WEBHOOK_API_KEY || 'shiptrack-webhook-key-2024';
  
  it('should receive webhook event with valid API key', async () => {
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.webhooks.receiveEvent({
      containerNumber: 'WEBHOOK1234567',
      eventType: 'customs_clearance',
      eventData: {
        clearanceDate: new Date().toISOString(),
        customsOffice: 'Test Customs',
      },
      source: 'Test System',
      apiKey: testApiKey,
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject invalid API key', async () => {
    const caller = appRouter.createCaller({} as any);
    
    await expect(
      caller.webhooks.receiveEvent({
        containerNumber: 'TEST1234567',
        eventType: 'gate_in',
        eventData: {},
        apiKey: 'invalid-key',
      })
    ).rejects.toThrow('Invalid API key');
  });

  it('should retrieve webhook events by container', async () => {
    const caller = appRouter.createCaller({} as any);
    const containerNumber = `WHTEST${Date.now()}`;
    
    // Create event
    await caller.webhooks.receiveEvent({
      containerNumber,
      eventType: 'gate_in',
      eventData: { timestamp: new Date().toISOString() },
      source: 'Test',
      apiKey: testApiKey,
    });
    
    // Retrieve events
    const events = await caller.webhooks.getEventsByContainer({
      containerNumber,
    });
    
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].containerNumber).toBe(containerNumber);
  });
});

describe('Email Frequency Settings', () => {
  it('should support immediate frequency', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const openId = `immediate-${Date.now()}`;
    const result = await db.insert(users).values({
      openId,
      name: 'Immediate User',
      email: `${openId}@test.com`,
      role: 'user',
      emailFrequency: 'immediate',
    });

    // Get the inserted user by openId
    const user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    
    expect(user[0].emailFrequency).toBe('immediate');
  });

  it('should support hourly frequency', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const openId = `hourly-${Date.now()}`;
    const result = await db.insert(users).values({
      openId,
      name: 'Hourly User',
      email: `${openId}@test.com`,
      role: 'user',
      emailFrequency: 'hourly',
    });

    // Get the inserted user by openId
    const user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    
    expect(user[0].emailFrequency).toBe('hourly');
  });

  it('should support weekly frequency', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const openId = `weekly-${Date.now()}`;
    const result = await db.insert(users).values({
      openId,
      name: 'Weekly User',
      email: `${openId}@test.com`,
      role: 'user',
      emailFrequency: 'weekly',
    });

    // Get the inserted user by openId
    const user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    
    expect(user[0].emailFrequency).toBe('weekly');
  });
});
