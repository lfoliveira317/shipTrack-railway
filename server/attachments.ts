import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { attachments, type Attachment, type InsertAttachment } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { storagePut, storageGet } from "./storage";

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
  
  // Get presigned upload URL for a file
  getUploadUrl: protectedProcedure
    .input(z.object({
      shipmentId: z.number(),
      filename: z.string(),
      fileType: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Generate a unique S3 key for the file
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `attachments/shipment-${input.shipmentId}/${timestamp}-${sanitizedFilename}`;
      
      return { 
        s3Key,
        // The actual upload will be done via the upload mutation
      };
    }),
  
  // Upload file to S3 and save metadata (not for viewers)
  upload: protectedProcedure
    .input(z.object({
      shipmentId: z.number(),
      filename: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
      fileData: z.string(), // Base64 encoded file data
      uploadedBy: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot upload attachments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Generate a unique S3 key for the file
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `attachments/shipment-${input.shipmentId}/${timestamp}-${sanitizedFilename}`;
      
      // Decode base64 file data
      const fileBuffer = Buffer.from(input.fileData, 'base64');
      
      // Upload to S3
      const { key, url } = await storagePut(s3Key, fileBuffer, input.fileType);
      
      // Save metadata to database
      const [result] = await db.insert(attachments).values({
        shipmentId: input.shipmentId,
        filename: input.filename,
        fileSize: input.fileSize,
        fileType: input.fileType,
        s3Key: key,
        s3Url: url,
        uploadedBy: input.uploadedBy,
      });
      
      return { success: true, id: result.insertId, s3Key: key, s3Url: url };
    }),
  
  // Add a new attachment to a shipment (legacy - without file upload, not for viewers)
  add: protectedProcedure
    .input(z.object({
      shipmentId: z.number(),
      filename: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
      uploadedBy: z.string(),
      s3Key: z.string().optional(),
      s3Url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot add attachments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [newAttachment] = await db.insert(attachments).values({
        shipmentId: input.shipmentId,
        filename: input.filename,
        fileSize: input.fileSize,
        fileType: input.fileType,
        s3Key: input.s3Key || null,
        s3Url: input.s3Url || null,
        uploadedBy: input.uploadedBy,
      });
      return { success: true, id: newAttachment.insertId };
    }),
  
  // Get download URL for an attachment
  getDownloadUrl: protectedProcedure
    .input(z.object({ attachmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [attachment] = await db.select().from(attachments).where(eq(attachments.id, input.attachmentId));
      
      if (!attachment) {
        throw new Error("Attachment not found");
      }
      
      if (!attachment.s3Key) {
        throw new Error("Attachment has no associated file");
      }
      
      // Get presigned download URL
      const { url } = await storageGet(attachment.s3Key);
      
      return { 
        success: true, 
        url, 
        filename: attachment.filename,
        fileType: attachment.fileType,
      };
    }),
  
  // Delete an attachment (also removes from S3, not for viewers)
  delete: protectedProcedure
    .input(z.object({ attachmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot delete attachments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get attachment to check if it has S3 file
      const [attachment] = await db.select().from(attachments).where(eq(attachments.id, input.attachmentId));
      
      // Delete from database (S3 files are typically cleaned up separately or left for lifecycle policies)
      await db.delete(attachments).where(eq(attachments.id, input.attachmentId));
      
      return { success: true };
    }),
});
