import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { suppliers, carriers, ports, type InsertSupplier, type InsertCarrier, type InsertPort } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { adminProcedure, publicProcedure } from "./_core/trpc";

// Validation schemas
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
});

const carrierSchema = z.object({
  name: z.string().min(1, "Carrier name is required"),
});

const portSchema = z.object({
  name: z.string().min(1, "Port name is required"),
  code: z.string().optional(),
  type: z.enum(["loading", "discharge"]),
});

export const dropdownsRouter = {
  // Suppliers
  suppliers: {
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return await db.select().from(suppliers);
    }),

    add: adminProcedure.input(supplierSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const result = await db.insert(suppliers).values({
          name: input.name,
        });
        return { success: true, id: result[0] };
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Supplier already exists",
          });
        }
        throw error;
      }
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.delete(suppliers).where(eq(suppliers.id, input.id));
      return { success: true };
    }),
  },

  // Carriers
  carriers: {
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return await db.select().from(carriers);
    }),

    add: adminProcedure.input(carrierSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const result = await db.insert(carriers).values({
          name: input.name,
        });
        return { success: true, id: result[0] };
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Carrier already exists",
          });
        }
        throw error;
      }
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.delete(carriers).where(eq(carriers.id, input.id));
      return { success: true };
    }),
  },

  // Ports (for both POL and POD)
  ports: {
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return await db.select().from(ports);
    }),

    listByType: publicProcedure.input(z.object({ type: z.enum(["loading", "discharge"]) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return await db.select().from(ports).where(eq(ports.type, input.type));
    }),

    add: adminProcedure.input(portSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const result = await db.insert(ports).values({
          name: input.name,
          code: input.code || null,
          type: input.type,
        });
        return { success: true, id: result[0] };
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Port already exists",
          });
        }
        throw error;
      }
    }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.delete(ports).where(eq(ports.id, input.id));
      return { success: true };
    }),
  },
};
