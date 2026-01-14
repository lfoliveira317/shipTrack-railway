import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { shipments, notifications, users, type Shipment, type InsertShipment } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendStatusChangeEmail } from "./email";

export const shipmentSchema = z.object({
  id: z.number().optional(),
  sellerCloudNumber: z.string().optional(),
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
  poNumber: z.string().optional(), // PO Number for SellerCloud
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
      sellerCloudNumber: "PO-TEST-001",
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
      sellerCloudNumber: "",
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
      sellerCloudNumber: "",
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
      sellerCloudNumber: "",
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
      sellerCloudNumber: "",
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
      sellerCloudNumber: "",
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
      sellerCloudNumber: "PO-BULK-001",
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
      sellerCloudNumber: "PO-BULK-002",
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
      sellerCloudNumber: "PO-UNIQUE-001",
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
      sellerCloudNumber: "PO-UNIQUE-002",
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
      
      // Get old shipment data for comparison
      const oldShipment = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
      
      const { id: _, ...updateData } = data;
      await db.update(shipments)
        .set(updateData as Partial<InsertShipment>)
        .where(eq(shipments.id, id));
      
      // Create notification if status changed
      if (oldShipment.length > 0 && data.status && data.status !== oldShipment[0].status) {
        // Get all users to notify (admins and regular users, not viewers)
        const allUsers = await db.select().from(users);
        const usersToNotify = allUsers.filter(u => u.role !== 'viewer');
        
        for (const user of usersToNotify) {
          // Create in-app notification
          await db.insert(notifications).values({
            userId: user.id,
            shipmentId: id,
            type: 'status_change',
            title: `Shipment Status Updated`,
            message: `Container ${oldShipment[0].container} status changed from "${oldShipment[0].status}" to "${data.status}"`,
            isRead: 0,
          });
          
          // Send email notification
          if (user.email) {
            await sendStatusChangeEmail({
              to: user.email,
              subject: `Shipment Status Updated: ${oldShipment[0].container}`,
              shipmentInfo: {
                container: oldShipment[0].container || '',
                sellerCloudNumber: oldShipment[0].sellerCloudNumber || undefined,
                oldStatus: oldShipment[0].status || '',
                newStatus: data.status,
                carrier: oldShipment[0].carrier || '',
                eta: data.eta || oldShipment[0].eta || undefined,
              },
            }).catch(err => {
              console.error('Failed to send email notification:', err);
              // Don't throw error - email failure shouldn't block the update
            });
          }
        }
      }
      
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
