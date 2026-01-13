import { describe, expect, it } from "vitest";
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
      orderNumber: "PO-TEST-001",
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
    expect(result.id).toBeDefined();
    expect(result.orderNumber).toBe(newShipment.orderNumber);
    expect(result.supplier).toBe(newShipment.supplier);
    expect(result.container).toBe(newShipment.container);
    expect(result.cro).toBe(newShipment.cro);
    expect(result.shipmentType).toBe("ocean");

    // Verify it's in the list
    const shipments = await caller.shipments.list();
    const addedShipment = shipments.find((s) => s.id === result.id);
    expect(addedShipment).toBeDefined();
    expect(addedShipment?.orderNumber).toBe(newShipment.orderNumber);
  });

  it("should add bulk shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const bulkShipments = [
      {
        orderNumber: "PO-BULK-001",
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
        orderNumber: "PO-BULK-002",
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

    const results = await caller.shipments.addBulk(bulkShipments);

    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0]?.id).toBeDefined();
    expect(results[1]?.id).toBeDefined();
    expect(results[0]?.id).not.toBe(results[1]?.id);
    expect(results[0]?.orderNumber).toBe("PO-BULK-001");
    expect(results[1]?.orderNumber).toBe("PO-BULK-002");
  });

  it("should generate unique IDs for new shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const shipment1 = await caller.shipments.add({
      orderNumber: "PO-UNIQUE-001",
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
      orderNumber: "PO-UNIQUE-002",
      label: "Product B",
      supplier: "Supplier B",
      container: "CONT2222222",
      carrier: "Carrier B",
      status: "In transit",
      pol: "Port C",
      pod: "Port D",
      eta: "Tue, 21 Jan",
      shipmentType: "air",
    });

    expect(shipment1.id).not.toBe(shipment2.id);
    expect(parseInt(shipment1.id)).toBeGreaterThan(0);
    expect(parseInt(shipment2.id)).toBeGreaterThan(0);
  });
});
