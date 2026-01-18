import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/trpc";

// Mock user for testing
const mockUser = {
  id: 1,
  openId: "test-open-id",
  name: "Test User",
  email: "test@example.com",
  loginMethod: "oauth",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Helper to create a test context
function createTestContext(user: typeof mockUser): Context {
  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

describe("notifications API", () => {
  let testNotificationId: number;

  it("should create a notification", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.create({
      userId: mockUser.id,
      type: "status_change",
      title: "Test Notification",
      message: "This is a test notification",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    testNotificationId = result.id;
  });

  it("should list notifications for current user", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();

    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
  });

  it("should get unread notification count", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.unreadCount();

    expect(result).toBeDefined();
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("should mark notification as read", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAsRead({
      id: testNotificationId,
    });

    expect(result.success).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAllAsRead();

    expect(result.success).toBe(true);
  });

  it("should delete a notification", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.delete({
      id: testNotificationId,
    });

    expect(result.success).toBe(true);
  });

  it("should deny access to notification from another user", async () => {
    const ctx = createTestContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    // Create a notification for user 1
    const created = await caller.notifications.create({
      userId: mockUser.id,
      type: "test",
      title: "Test",
      message: "Test",
    });

    // Try to access it as user 2
    const ctx2 = createTestContext({
      ...mockUser,
      id: 999,
      openId: "other-user",
    });
    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.notifications.markAsRead({ id: created.id })
    ).rejects.toThrow();
  });
});
