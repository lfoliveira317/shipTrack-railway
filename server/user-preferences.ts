import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const userPreferencesRouter = router({
  /**
   * Get current user's notification preferences
   */
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const user = await db
        .select({
          notifyOnStatusChange: users.notifyOnStatusChange,
          notifyOnDelay: users.notifyOnDelay,
          notifyOnArrival: users.notifyOnArrival,
          emailNotifications: users.emailNotifications,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user || user.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user[0];
    } catch (error: any) {
      console.error('Get notification preferences error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get notification preferences',
      });
    }
  }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        notifyOnStatusChange: z.boolean().optional(),
        notifyOnDelay: z.boolean().optional(),
        notifyOnArrival: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }

        const updates: any = {};
        if (input.notifyOnStatusChange !== undefined) {
          updates.notifyOnStatusChange = input.notifyOnStatusChange ? 1 : 0;
        }
        if (input.notifyOnDelay !== undefined) {
          updates.notifyOnDelay = input.notifyOnDelay ? 1 : 0;
        }
        if (input.notifyOnArrival !== undefined) {
          updates.notifyOnArrival = input.notifyOnArrival ? 1 : 0;
        }
        if (input.emailNotifications !== undefined) {
          updates.emailNotifications = input.emailNotifications ? 1 : 0;
        }

        await db.update(users).set(updates).where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: 'Notification preferences updated',
        };
      } catch (error: any) {
        console.error('Update notification preferences error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification preferences',
        });
      }
    }),
});
