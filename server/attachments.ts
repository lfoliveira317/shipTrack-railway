import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { attachments, type Attachment, type InsertAttachment } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const attachmentsRouter = router({
  // Get all attachments for a specific shipment
  byShipment: protectedProcedure
    .input(z.object({ shipmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(attachments).where(eq(attachments.shipmentId, input.shipmentId));
    }),
  
  // Get attachment counts for all shipments
  counts: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const result = await db.select({
      shipmentId: attachments.shipmentId,
      count: sql<number>`COUNT(*)`.as('count'),
    }).from(attachments).groupBy(attachments.shipmentId);
    
    const counts: Record<number, number> = {};
    result.forEach(row => {
      counts[row.shipmentId] = Number(row.count);
    });
    return counts;
  }),
  
  // Add a new attachment to a shipment
  add: protectedProcedure
    .input(z.object({
      shipmentId: z.number(),
      filename: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
      uploadedBy: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [newAttachment] = await db.insert(attachments).values({
        shipmentId: input.shipmentId,
        filename: input.filename,
        fileSize: input.fileSize,
        fileType: input.fileType,
        uploadedBy: input.uploadedBy,
      });
      return { success: true, id: newAttachment.insertId };
    }),
  
  // Delete an attachment
  delete: protectedProcedure
    .input(z.object({ attachmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(attachments).where(eq(attachments.id, input.attachmentId));
      return { success: true };
    }),
});
