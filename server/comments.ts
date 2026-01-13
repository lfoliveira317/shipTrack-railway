import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { comments, type Comment, type InsertComment } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const commentsRouter = router({
  // Get all comments for a specific shipment
  byShipment: protectedProcedure
    .input(z.object({ shipmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(comments).where(eq(comments.shipmentId, input.shipmentId));
    }),
  
  // Get comment counts for all shipments
  counts: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const result = await db.select({
      shipmentId: comments.shipmentId,
      count: sql<number>`COUNT(*)`.as('count'),
    }).from(comments).groupBy(comments.shipmentId);
    
    const counts: Record<number, number> = {};
    result.forEach(row => {
      counts[row.shipmentId] = Number(row.count);
    });
    return counts;
  }),
  
  // Add a new comment to a shipment (not for viewers)
  add: protectedProcedure
    .input(z.object({
      shipmentId: z.number(),
      author: z.string(),
      text: z.string().min(1, "Comment text is required"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot add comments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [newComment] = await db.insert(comments).values({
        shipmentId: input.shipmentId,
        author: input.author,
        text: input.text,
      });
      return { success: true, id: newComment.insertId };
    }),
  
  // Delete a comment (not for viewers)
  delete: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role === 'viewer') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot delete comments' });
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(comments).where(eq(comments.id, input.commentId));
      return { success: true };
    }),
});
