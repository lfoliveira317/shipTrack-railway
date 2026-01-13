import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { shipments, type Shipment, type InsertShipment } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const shipmentSchema = z.object({
  id: z.number().optional(),
  orderNumber: z.string().optional(),
  label: z.string().optional(),
  supplier: z.string().optional(),
  cro: z.string().optional(),
  container: z.string(),
  mawbNumber: z.string().optional(),
  carrier: z.string(),
  status: z.string(),
  atd: z.string().optional(), // Actual Time of Departure
  eta: z.string(),
  ata: z.string().optional(), // Actual Time of Arrival
  pol: z.string().optional(), // Port of Loading
  pod: z.string().optional(), // Port of Discharge
  shipmentType: z.enum(["ocean", "air"]).default("ocean"),
  bolNumber: z.string().optional(), // Bill of Lading number
});

export type ShipmentType = z.infer<typeof shipmentSchema>;

// Seed default shipments if database is empty
async function seedDefaultShipments() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(shipments).limit(1);
  if (existing.length > 0) return;

  const defaultShipments: Omit<InsertShipment, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { 
      orderNumber: "PO-TEST-001",
      label: "Cotton", 
      supplier: "Test Supplier Inc", 
      cro: "CRO-TEST-001",
      container: "TEST1234567", 
      mawbNumber: "MAWB123456",
      carrier: "Test Carrier", 
      status: "In transit", 
      atd: "Mon, 13 Jan",
      pol: "Chittagong", 
      pod: "Savannah", 
      eta: "Mon, 15 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: "BOL123456"
    },
    { 
      orderNumber: "",
      label: "", 
      supplier: "Supplier A", 
      cro: "",
      container: "CONT1111111", 
      mawbNumber: "",
      carrier: "Carrier A", 
      status: "In transit", 
      atd: "",
      pol: "Shanghai", 
      pod: "Los Angeles", 
      eta: "Mon, 20 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "",
      label: "", 
      supplier: "Supplier B", 
      cro: "",
      container: "CONT2222222", 
      mawbNumber: "",
      carrier: "Carrier B", 
      status: "In transit", 
      atd: "",
      pol: "Hong Kong", 
      pod: "New York", 
      eta: "Tue, 21 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "",
      label: "", 
      supplier: "Test Supplier Inc", 
      cro: "",
      container: "TEST1234567", 
      mawbNumber: "",
      carrier: "Test Carrier", 
      status: "In transit", 
      atd: "",
      pol: "Chittagong", 
      pod: "Savannah", 
      eta: "Mon, 15 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "",
      label: "", 
      supplier: "Supplier A", 
      cro: "",
      container: "CONT1111111", 
      mawbNumber: "",
      carrier: "Carrier A", 
      status: "In transit", 
      atd: "",
      pol: "Shanghai", 
      pod: "Los Angeles", 
      eta: "Mon, 20 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "",
      label: "", 
      supplier: "Supplier B", 
      cro: "",
      container: "CONT2222222", 
      mawbNumber: "",
      carrier: "Carrier B", 
      status: "In transit", 
      atd: "",
      pol: "Hong Kong", 
      pod: "New York", 
      eta: "Tue, 21 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "PO-BULK-001",
      label: "Bulk Order 1", 
      supplier: "Bulk Supplier", 
      cro: "",
      container: "BULK1111111", 
      mawbNumber: "",
      carrier: "Bulk Carrier", 
      status: "In transit", 
      atd: "",
      pol: "Singapore", 
      pod: "Seattle", 
      eta: "Mon, 20 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "PO-BULK-002",
      label: "Bulk Order 2", 
      supplier: "Bulk Supplier", 
      cro: "",
      container: "BULK2222222", 
      mawbNumber: "",
      carrier: "Bulk Carrier", 
      status: "In transit", 
      atd: "",
      pol: "Singapore", 
      pod: "Seattle", 
      eta: "Tue, 21 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "PO-UNIQUE-001",
      label: "Unique Item 1", 
      supplier: "Supplier A", 
      cro: "",
      container: "CONT1111111", 
      mawbNumber: "",
      carrier: "Carrier A", 
      status: "In transit", 
      atd: "",
      pol: "Shanghai", 
      pod: "Los Angeles", 
      eta: "Mon, 20 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
    { 
      orderNumber: "PO-UNIQUE-002",
      label: "Unique Item 2", 
      supplier: "Supplier B", 
      cro: "",
      container: "CONT2222222", 
      mawbNumber: "",
      carrier: "Carrier B", 
      status: "In transit", 
      atd: "",
      pol: "Hong Kong", 
      pod: "New York", 
      eta: "Tue, 21 Jan",
      ata: "",
      shipmentType: "ocean",
      bolNumber: ""
    },
  ];

  if (db) await db.insert(shipments).values(defaultShipments);
}

// Initialize on module load
seedDefaultShipments().catch(console.error);

export const shipmentsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(shipments);
  }),

  // Only users and admins can add shipments (not viewers)
  add: protectedProcedure
    .input(shipmentSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot add shipments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...shipmentData } = input;
      const [newShipment] = await db.insert(shipments).values(shipmentData as InsertShipment);
      return { success: true, id: newShipment.insertId };
    }),

  // Only users and admins can add shipments (not viewers)
  addBulk: protectedProcedure
    .input(z.array(shipmentSchema))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot add shipments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const shipmentsToInsert = input.map(({ id, ...rest }) => rest as InsertShipment);
      await db.insert(shipments).values(shipmentsToInsert);
      return { success: true, count: shipmentsToInsert.length };
    }),

  // Only users and admins can update shipments (not viewers)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: shipmentSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot update shipments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, data } = input;
      const { id: _, ...updateData } = data;
      await db.update(shipments)
        .set(updateData as Partial<InsertShipment>)
        .where(eq(shipments.id, id));
      return { success: true };
    }),

  // Only users and admins can delete shipments (not viewers)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot delete shipments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(shipments).where(eq(shipments.id, input.id));
      return { success: true };
    }),
});
