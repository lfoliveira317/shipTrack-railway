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

  it("should add an attachment metadata to a shipment", async () => {
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

  it("should upload a file to S3 and save metadata", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    
    // Create a small test file (base64 encoded "Hello, World!")
    const testFileData = Buffer.from("Hello, World!").toString('base64');
    
    const result = await caller.attachments.upload({
      shipmentId,
      filename: "test-upload.txt",
      fileSize: 13,
      fileType: "text/plain",
      fileData: testFileData,
      uploadedBy: "Test User",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.s3Key).toBeDefined();
    expect(result.s3Url).toBeDefined();
    expect(result.s3Key).toContain('attachments/shipment-');
  });

  it("should get download URL for an attachment with S3 file", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    
    // Upload a file first
    const testFileData = Buffer.from("Test file content").toString('base64');
    const uploadResult = await caller.attachments.upload({
      shipmentId,
      filename: "download-test.txt",
      fileSize: 17,
      fileType: "text/plain",
      fileData: testFileData,
      uploadedBy: "Test User",
    });

    // Get download URL
    const downloadResult = await caller.attachments.getDownloadUrl({
      attachmentId: uploadResult.id,
    });

    expect(downloadResult).toBeDefined();
    expect(downloadResult.success).toBe(true);
    expect(downloadResult.url).toBeDefined();
    expect(downloadResult.filename).toBe("download-test.txt");
    expect(downloadResult.fileType).toBe("text/plain");
  });

  it("should delete an attachment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a shipment ID from the list
    const shipments = await caller.shipments.list();
    if (shipments.length === 0) {
      return;
    }

    const shipmentId = shipments[0].id;
    
    // Add an attachment first
    const addResult = await caller.attachments.add({
      shipmentId,
      filename: "to-delete.pdf",
      fileSize: 512,
      fileType: "application/pdf",
      uploadedBy: "Test User",
    });

    // Delete the attachment
    const deleteResult = await caller.attachments.delete({
      attachmentId: addResult.id,
    });

    expect(deleteResult).toBeDefined();
    expect(deleteResult.success).toBe(true);

    // Verify it's gone
    const attachments = await caller.attachments.byShipment({ shipmentId });
    const found = attachments.find(a => a.id === addResult.id);
    expect(found).toBeUndefined();
  });
});
