import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from './_core/trpc';
import { getDb } from './db';
import { suppliers, carriers, ports } from '../drizzle/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

/**
 * Reference data router for managing dropdown options
 */
export const referenceDataRouter = router({
  /**
   * Get all suppliers
   */
  getSuppliers: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const result = await db.select().from(suppliers);
      return result;
    } catch (error: any) {
      console.error('Get suppliers error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch suppliers',
      });
    }
  }),

  /**
   * Get all carriers
   */
  getCarriers: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const result = await db.select().from(carriers);
      return result;
    } catch (error: any) {
      console.error('Get carriers error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch carriers',
      });
    }
  }),

  /**
   * Get all ports
   */
  getPorts: publicProcedure
    .input(
      z
        .object({
          type: z.enum(['loading', 'discharge']).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        let query = db.select().from(ports);

        // Filter by type if provided
        if (input?.type) {
          query = query.where(eq(ports.type, input.type)) as any;
        }

        const result = await query;
        return result;
      } catch (error: any) {
        console.error('Get ports error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch ports',
        });
      }
    }),

  /**
   * Get shipment statuses (hardcoded list)
   */
  getStatuses: publicProcedure.query(() => {
    return [
      { id: 1, name: 'Pending' },
      { id: 2, name: 'Booked' },
      { id: 3, name: 'In transit' },
      { id: 4, name: 'Loaded' },
      { id: 5, name: 'Departed' },
      { id: 6, name: 'At sea' },
      { id: 7, name: 'Arrived at port' },
      { id: 8, name: 'Customs clearance' },
      { id: 9, name: 'Out for delivery' },
      { id: 10, name: 'Delivered' },
      { id: 11, name: 'Delayed' },
      { id: 12, name: 'On hold' },
      { id: 13, name: 'Cancelled' },
    ];
  }),

  /**
   * Add new supplier (admin only)
   */
  addSupplier: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Supplier name is required'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.insert(suppliers).values({ name: input.name });

        return {
          success: true,
          message: 'Supplier added successfully',
        };
      } catch (error: any) {
        console.error('Add supplier error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Supplier already exists',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add supplier',
        });
      }
    }),

  /**
   * Add new carrier (admin only)
   */
  addCarrier: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Carrier name is required'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.insert(carriers).values({ name: input.name });

        return {
          success: true,
          message: 'Carrier added successfully',
        };
      } catch (error: any) {
        console.error('Add carrier error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Carrier already exists',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add carrier',
        });
      }
    }),

  /**
   * Add new port (admin only)
   */
  addPort: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Port name is required'),
        code: z.string().optional(),
        type: z.enum(['loading', 'discharge']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.insert(ports).values({
          name: input.name,
          code: input.code || null,
          type: input.type,
        });

        return {
          success: true,
          message: 'Port added successfully',
        };
      } catch (error: any) {
        console.error('Add port error:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Port already exists',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add port',
        });
      }
    }),

  /**
   * Delete supplier (admin only)
   */
  deleteSupplier: adminProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.delete(suppliers).where(eq(suppliers.id, input.id));

        return {
          success: true,
          message: 'Supplier deleted successfully',
        };
      } catch (error: any) {
        console.error('Delete supplier error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete supplier',
        });
      }
    }),

  /**
   * Delete carrier (admin only)
   */
  deleteCarrier: adminProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.delete(carriers).where(eq(carriers.id, input.id));

        return {
          success: true,
          message: 'Carrier deleted successfully',
        };
      } catch (error: any) {
        console.error('Delete carrier error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete carrier',
        });
      }
    }),

  /**
   * Delete port (admin only)
   */
  deletePort: adminProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        await db.delete(ports).where(eq(ports.id, input.id));

        return {
          success: true,
          message: 'Port deleted successfully',
        };
      } catch (error: any) {
        console.error('Delete port error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete port',
        });
      }
    }),
});
