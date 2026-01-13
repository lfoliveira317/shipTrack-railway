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

describe("attachments API", () => {
  it("should get attachments for a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    const attachments = await caller.attachments.byShipment({ shipmentId });

    expect(attachments).toBeDefined();
    expect(Array.isArray(attachments)).toBe(true);
  });

  it("should add an attachment to a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    const result = await caller.attachments.add({
      shipmentId,
      filename: "test-file.pdf",
      fileSize: 1024,
      fileType: "application/pdf",
      uploadedBy: "Test User",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should get attachment counts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const counts = await caller.attachments.counts();

    expect(counts).toBeDefined();
    expect(typeof counts).toBe("object");
  });
});
