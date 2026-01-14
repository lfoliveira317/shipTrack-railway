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

describe("shipments API", () => {
  it("should list all shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const shipments = await caller.shipments.list();

    expect(shipments).toBeDefined();
    expect(Array.isArray(shipments)).toBe(true);
    expect(shipments.length).toBeGreaterThanOrEqual(0);
  });

  it("should add a new shipment with all fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const newShipment = {
      sellerCloudNumber: "PO-TEST-001",
      label: "Test Product",
      supplier: "Test Supplier Inc",
      cro: "CRO-TEST-001",
      container: "TEST1234567",
      mawbNumber: "MAWB123456",
      carrier: "Test Carrier",
      status: "In transit",
      atd: "Mon, 13 Jan",
      pol: "Test Port A",
      pod: "Test Port B",
      eta: "Mon, 15 Jan",
      ata: "",
      shipmentType: "ocean" as const,
      bolNumber: "BOL-TEST-001",
    };

    const result = await caller.shipments.add(newShipment);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should add bulk shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const bulkShipments = [
      {
        sellerCloudNumber: "PO-BULK-001",
        label: "Bulk Product 1",
        supplier: "Bulk Supplier",
        container: "BULK1111111",
        carrier: "Bulk Carrier",
        status: "In transit",
        pol: "Port A",
        pod: "Port B",
        eta: "Mon, 20 Jan",
        shipmentType: "ocean" as const,
      },
      {
        sellerCloudNumber: "PO-BULK-002",
        label: "Bulk Product 2",
        supplier: "Bulk Supplier",
        container: "BULK2222222",
        carrier: "Bulk Carrier",
        status: "In transit",
        pol: "Port C",
        pod: "Port D",
        eta: "Tue, 21 Jan",
        shipmentType: "ocean" as const,
      },
    ];

    const result = await caller.shipments.addBulk(bulkShipments);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });

  it("should generate unique IDs for new shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const shipment1 = await caller.shipments.add({
      sellerCloudNumber: "PO-UNIQUE-001",
      label: "Product A",
      supplier: "Supplier A",
      container: "CONT1111111",
      carrier: "Carrier A",
      status: "In transit",
      pol: "Port A",
      pod: "Port B",
      eta: "Mon, 20 Jan",
      shipmentType: "ocean",
    });

    const shipment2 = await caller.shipments.add({
      sellerCloudNumber: "PO-UNIQUE-002",
      label: "Product B",
      supplier: "Supplier B",
      container: "CONT2222222",
      carrier: "Carrier B",
      status: "In transit",
      pol: "Port C",
      pod: "Port D",
      eta: "Tue, 21 Jan",
      shipmentType: "ocean",
    });

    expect(shipment1.id).not.toBe(shipment2.id);
    expect(shipment1.id).toBeGreaterThan(0);
    expect(shipment2.id).toBeGreaterThan(0);
  });

  it("should update an existing shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First add a shipment
    const newShipment = await caller.shipments.add({
      sellerCloudNumber: "PO-UPDATE-001",
      label: "Original Label",
      supplier: "Original Supplier",
      container: "UPDATE111111",
      carrier: "Original Carrier",
      status: "In transit",
      pol: "Port A",
      pod: "Port B",
      eta: "Mon, 20 Jan",
      shipmentType: "ocean",
    });

    // Get the list to find the shipment
    const shipments = await caller.shipments.list();
    const addedShipment = shipments.find(s => s.sellerCloudNumber === "PO-UPDATE-001");
    expect(addedShipment).toBeDefined();

    // Update the shipment
    const result = await caller.shipments.update({
      id: addedShipment!.id,
      data: {
        label: "Updated Label",
        supplier: "Updated Supplier",
        status: "Delivered",
      },
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verify the update
    const updatedShipments = await caller.shipments.list();
    const updatedShipment = updatedShipments.find(s => s.id === addedShipment!.id);
    expect(updatedShipment?.label).toBe("Updated Label");
    expect(updatedShipment?.supplier).toBe("Updated Supplier");
    expect(updatedShipment?.status).toBe("Delivered");
  });

  it("should delete a shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First add a shipment
    const addResult = await caller.shipments.add({
      sellerCloudNumber: "PO-DELETE-001",
      label: "To Delete",
      supplier: "Delete Supplier",
      container: "DELETE11111",
      carrier: "Delete Carrier",
      status: "In transit",
      pol: "Port A",
      pod: "Port B",
      eta: "Mon, 20 Jan",
      shipmentType: "ocean",
    });

    // Get the shipment ID
    const shipments = await caller.shipments.list();
    const shipmentToDelete = shipments.find(s => s.sellerCloudNumber === "PO-DELETE-001");
    expect(shipmentToDelete).toBeDefined();

    // Delete the shipment
    const result = await caller.shipments.delete({ id: shipmentToDelete!.id });
    expect(result.success).toBe(true);

    // Verify it's gone from the list
    const updatedShipments = await caller.shipments.list();
    const found = updatedShipments.find((s) => s.id === shipmentToDelete!.id);
    expect(found).toBeUndefined();
  });
});
