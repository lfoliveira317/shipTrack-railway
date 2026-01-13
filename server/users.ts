import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users, type User, type InsertUser } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  // Get current user info (any authenticated user)
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [user] = await db.select().from(users).where(eq(users.openId, ctx.user.openId));
    
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    
    return {
      id: user.id,
      openId: user.openId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
    };
  }),
  
  // List all users (admin only)
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const allUsers = await db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).orderBy(desc(users.createdAt));
    
    return allUsers;
  }),
  
  // Get user by ID (admin only)
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [user] = await db.select().from(users).where(eq(users.id, input.id));
      
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        role: user.role,
        loginMethod: user.loginMethod,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),
  
  // Update user role (admin only)
  updateRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["viewer", "user", "admin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get the user to update
      const [userToUpdate] = await db.select().from(users).where(eq(users.id, input.userId));
      
      if (!userToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      // Prevent admin from demoting themselves
      if (userToUpdate.openId === ctx.user.openId && input.role !== "admin") {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You cannot change your own admin role" 
        });
      }
      
      // Update the role
      await db.update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),
  
  // Update user details (admin only)
  update: adminProcedure
    .input(z.object({
      userId: z.number(),
      data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["viewer", "user", "admin"]).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get the user to update
      const [userToUpdate] = await db.select().from(users).where(eq(users.id, input.userId));
      
      if (!userToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      // Prevent admin from demoting themselves
      if (userToUpdate.openId === ctx.user.openId && input.data.role && input.data.role !== "admin") {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You cannot change your own admin role" 
        });
      }
      
      // Build update object
      const updateData: Partial<InsertUser> = {};
      if (input.data.name !== undefined) updateData.name = input.data.name;
      if (input.data.email !== undefined) updateData.email = input.data.email;
      if (input.data.role !== undefined) updateData.role = input.data.role;
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),
  
  // Delete user (admin only)
  delete: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get the user to delete
      const [userToDelete] = await db.select().from(users).where(eq(users.id, input.userId));
      
      if (!userToDelete) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      // Prevent admin from deleting themselves
      if (userToDelete.openId === ctx.user.openId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You cannot delete your own account" 
        });
      }
      
      await db.delete(users).where(eq(users.id, input.userId));
      
      return { success: true };
    }),
  
  // Get user count by role (admin only)
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, admins: 0, users: 0, viewers: 0 };
    
    const result = await db.select({
      role: users.role,
      count: sql<number>`COUNT(*)`.as('count'),
    }).from(users).groupBy(users.role);
    
    const stats = { total: 0, admins: 0, users: 0, viewers: 0 };
    result.forEach(row => {
      const count = Number(row.count);
      stats.total += count;
      if (row.role === 'admin') stats.admins = count;
      else if (row.role === 'user') stats.users = count;
      else if (row.role === 'viewer') stats.viewers = count;
    });
    
    return stats;
  }),
});
