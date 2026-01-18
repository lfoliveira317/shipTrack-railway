import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc.js";
import { getDb } from "./db.js";
import { notifications } from "../drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  // List notifications for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));
    
    return userNotifications;
  }),

  // Get unread notification count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const unread = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 0)
        )
      );
    
    return { count: unread.length };
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Verify notification belongs to user
      const notification = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, input.id))
        .limit(1);
      
      if (notification.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }
      
      if (notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.id, input.id));
      
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 0)
        )
      );
    
    return { success: true };
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Verify notification belongs to user
      const notification = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, input.id))
        .limit(1);
      
      if (notification.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }
      
      if (notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      
      await db
        .delete(notifications)
        .where(eq(notifications.id, input.id));
      
      return { success: true };
    }),

  // Create a notification (internal use - for triggering notifications)
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        shipmentId: z.number().optional(),
        type: z.string(),
        title: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(notifications).values({
        userId: input.userId,
        shipmentId: input.shipmentId,
        type: input.type,
        title: input.title,
        message: input.message,
        isRead: 0,
      });
      
      return { id: result[0].insertId };
    }),
});
