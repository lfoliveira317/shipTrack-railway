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
    // File may be empty initially, so we just check it's an array
    expect(shipments.length).toBeGreaterThanOrEqual(0);
  });

  it("should add a new shipment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const newShipment = {
      label: "Test Product",
      supplier: "Test Supplier Inc",
      container: "TEST1234567",
      carrier: "Test Carrier",
      status: "In transit",
      pol: "Test Port A",
      pod: "Test Port B",
      eta: "Mon, 15 Jan",
    };

    const result = await caller.shipments.add(newShipment);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.label).toBe(newShipment.label);
    expect(result.supplier).toBe(newShipment.supplier);
    expect(result.container).toBe(newShipment.container);

    // Verify it's in the list
    const shipments = await caller.shipments.list();
    const addedShipment = shipments.find((s) => s.id === result.id);
    expect(addedShipment).toBeDefined();
    expect(addedShipment?.label).toBe(newShipment.label);
  });

  it("should generate unique IDs for new shipments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const shipment1 = await caller.shipments.add({
      label: "Product A",
      supplier: "Supplier A",
      container: "CONT1111111",
      carrier: "Carrier A",
      status: "In transit",
      pol: "Port A",
      pod: "Port B",
      eta: "Mon, 20 Jan",
    });

    const shipment2 = await caller.shipments.add({
      label: "Product B",
      supplier: "Supplier B",
      container: "CONT2222222",
      carrier: "Carrier B",
      status: "In transit",
      pol: "Port C",
      pod: "Port D",
      eta: "Tue, 21 Jan",
    });

    expect(shipment1.id).not.toBe(shipment2.id);
    expect(shipment1.id).toMatch(/^PO-\d{4}-[A-Z]{2}$/);
    expect(shipment2.id).toMatch(/^PO-\d{4}-[A-Z]{2}$/);
  });
});
