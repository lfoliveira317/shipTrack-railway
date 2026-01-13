import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
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
  it("should get attachment counts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const counts = await caller.attachments.counts();

    expect(counts).toBeDefined();
    expect(typeof counts).toBe("object");
  });

  it("should add a new attachment to a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const newAttachment = {
      shipmentId: "test-shipment-1",
      fileName: "test-document.pdf",
      fileSize: 1024,
      fileType: "application/pdf",
      uploadedBy: "Test User",
    };

    const result = await caller.attachments.add(newAttachment);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.shipmentId).toBe(newAttachment.shipmentId);
    expect(result.fileName).toBe(newAttachment.fileName);
    expect(result.fileSize).toBe(newAttachment.fileSize);
    expect(result.fileType).toBe(newAttachment.fileType);
    expect(result.uploadedBy).toBe(newAttachment.uploadedBy);
    expect(result.uploadedAt).toBeDefined();
  });

  it("should get attachments by shipment ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First add an attachment
    const newAttachment = {
      shipmentId: "test-shipment-2",
      fileName: "invoice.pdf",
      fileSize: 2048,
      fileType: "application/pdf",
      uploadedBy: "Admin User",
    };

    await caller.attachments.add(newAttachment);

    // Then retrieve attachments for that shipment
    const attachments = await caller.attachments.byShipment({
      shipmentId: "test-shipment-2",
    });

    expect(attachments).toBeDefined();
    expect(Array.isArray(attachments)).toBe(true);
    expect(attachments.length).toBeGreaterThan(0);
    
    const found = attachments.find((a) => a.fileName === "invoice.pdf");
    expect(found).toBeDefined();
    expect(found?.shipmentId).toBe("test-shipment-2");
  });

  it("should delete an attachment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First add an attachment
    const newAttachment = {
      shipmentId: "test-shipment-3",
      fileName: "to-delete.pdf",
      fileSize: 512,
      fileType: "application/pdf",
      uploadedBy: "Test User",
    };

    const added = await caller.attachments.add(newAttachment);

    // Then delete it
    const deleteResult = await caller.attachments.delete({
      attachmentId: added.id,
    });

    expect(deleteResult.success).toBe(true);

    // Verify it's gone
    const attachments = await caller.attachments.byShipment({
      shipmentId: "test-shipment-3",
    });
    const found = attachments.find((a) => a.id === added.id);
    expect(found).toBeUndefined();
  });

  it("should return empty array for shipment with no attachments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const attachments = await caller.attachments.byShipment({
      shipmentId: "non-existent-shipment-xyz",
    });

    expect(attachments).toBeDefined();
    expect(Array.isArray(attachments)).toBe(true);
    expect(attachments.length).toBe(0);
  });

  it("should update attachment counts after adding", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const shipmentId = "count-test-shipment";

    // Get initial counts
    const initialCounts = await caller.attachments.counts();
    const initialCount = initialCounts[shipmentId] || 0;

    // Add an attachment
    await caller.attachments.add({
      shipmentId,
      fileName: "count-test.pdf",
      fileSize: 100,
      fileType: "application/pdf",
      uploadedBy: "Test User",
    });

    // Get updated counts
    const updatedCounts = await caller.attachments.counts();
    const updatedCount = updatedCounts[shipmentId] || 0;

    expect(updatedCount).toBe(initialCount + 1);
  });
});
