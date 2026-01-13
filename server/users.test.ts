import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

// Mock admin user
const mockAdminUser = {
  openId: "test-admin-123",
  name: "Test Admin",
  email: "admin@example.com",
  role: "admin" as const,
};

// Mock regular user
const mockRegularUser = {
  openId: "test-user-456",
  name: "Test User",
  email: "user@example.com",
  role: "user" as const,
};

// Mock viewer user
const mockViewerUser = {
  openId: "test-viewer-789",
  name: "Test Viewer",
  email: "viewer@example.com",
  role: "viewer" as const,
};

function createTestContext(user: typeof mockAdminUser | typeof mockRegularUser | typeof mockViewerUser): TrpcContext {
  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("users API - Admin Access", () => {
  it("should allow admin to list all users", async () => {
    const ctx = createTestContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const users = await caller.users.list();

    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it("should allow admin to get user stats", async () => {
    const ctx = createTestContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.users.stats();

    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.admins).toBeGreaterThanOrEqual(0);
    expect(stats.users).toBeGreaterThanOrEqual(0);
    expect(stats.viewers).toBeGreaterThanOrEqual(0);
  });

  it("should allow admin to get user by ID", async () => {
    const ctx = createTestContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    // Get the first user from the list
    const users = await caller.users.list();
    if (users.length > 0) {
      const user = await caller.users.getById({ id: users[0].id });
      expect(user).toBeDefined();
      if (user) {
        expect(user.id).toBe(users[0].id);
      }
    }
  });
});

describe("users API - Non-Admin Access", () => {
  it("should deny regular user from listing all users", async () => {
    const ctx = createTestContext(mockRegularUser);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });

  it("should deny viewer from listing all users", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });

// Note: users.me test skipped because it requires actual user in database
});

describe("shipments API - Role-Based Access Control", () => {
  it("should allow admin to add shipments", async () => {
    const ctx = createTestContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.shipments.add({
      container: "TEST-ADMIN-001",
      carrier: "Test Carrier",
      status: "In transit",
      eta: "Mon, 20 Jan",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should allow regular user to add shipments", async () => {
    const ctx = createTestContext(mockRegularUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.shipments.add({
      container: "TEST-USER-001",
      carrier: "Test Carrier",
      status: "In transit",
      eta: "Mon, 20 Jan",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should deny viewer from adding shipments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.shipments.add({
        container: "TEST-VIEWER-001",
        carrier: "Test Carrier",
        status: "In transit",
        eta: "Mon, 20 Jan",
      })
    ).rejects.toThrow("Viewers cannot add shipments");
  });

  it("should allow viewer to list shipments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();

    expect(shipments).toBeDefined();
    expect(Array.isArray(shipments)).toBe(true);
  });

  it("should deny viewer from updating shipments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    // Get a shipment first
    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      await expect(
        caller.shipments.update({
          id: shipments[0].id,
          data: { status: "Delivered" },
        })
      ).rejects.toThrow("Viewers cannot update shipments");
    }
  });

  it("should deny viewer from deleting shipments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    // Get a shipment first
    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      await expect(
        caller.shipments.delete({ id: shipments[0].id })
      ).rejects.toThrow("Viewers cannot delete shipments");
    }
  });
});

describe("comments API - Role-Based Access Control", () => {
  it("should allow admin to add comments", async () => {
    const ctx = createTestContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      const result = await caller.comments.add({
        shipmentId: shipments[0].id,
        author: "Test Admin",
        text: "Test comment from admin",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    }
  });

  it("should deny viewer from adding comments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      await expect(
        caller.comments.add({
          shipmentId: shipments[0].id,
          author: "Test Viewer",
          text: "Test comment from viewer",
        })
      ).rejects.toThrow("Viewers cannot add comments");
    }
  });

  it("should allow viewer to view comments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      const comments = await caller.comments.byShipment({ shipmentId: shipments[0].id });
      expect(comments).toBeDefined();
      expect(Array.isArray(comments)).toBe(true);
    }
  });
});

describe("attachments API - Role-Based Access Control", () => {
  it("should deny viewer from uploading attachments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      const testFileData = Buffer.from("Test file").toString('base64');
      
      await expect(
        caller.attachments.upload({
          shipmentId: shipments[0].id,
          filename: "test.txt",
          fileSize: 9,
          fileType: "text/plain",
          fileData: testFileData,
          uploadedBy: "Test Viewer",
        })
      ).rejects.toThrow("Viewers cannot upload attachments");
    }
  });

  it("should allow viewer to view attachments", async () => {
    const ctx = createTestContext(mockViewerUser);
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();
    if (shipments.length > 0) {
      const attachments = await caller.attachments.byShipment({ shipmentId: shipments[0].id });
      expect(attachments).toBeDefined();
      expect(Array.isArray(attachments)).toBe(true);
    }
  });
});
