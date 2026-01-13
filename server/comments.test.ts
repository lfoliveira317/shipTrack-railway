import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for protected procedures
const mockUser = {
  openId: "test-user-123",
  name: "Test User",
  email: "test@example.com",
};

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: mockUser,
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

describe("comments API", () => {
  it("should get comments for a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      // Skip test if no shipments exist
      return;
    }

    const shipmentId = shipments[0].id;
    const comments = await caller.comments.byShipment({ shipmentId });

    expect(comments).toBeDefined();
    expect(Array.isArray(comments)).toBe(true);
  });

  it("should add a comment to a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    const result = await caller.comments.add({
      shipmentId,
      author: "Test User",
      text: "This is a test comment",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should get comment counts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const counts = await caller.comments.counts();

    expect(counts).toBeDefined();
    expect(typeof counts).toBe("object");
  });
});
