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
          emailFrequency: users.emailFrequency,
          notifyContainerUpdates: users.notifyContainerUpdates,
          notifyDischargeDateChanges: users.notifyDischargeDateChanges,
          notifyMissingDocuments: users.notifyMissingDocuments,
          quietHoursStart: users.quietHoursStart,
          quietHoursEnd: users.quietHoursEnd,
          timezone: users.timezone,
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
        notifyOnStatusChange: z.number().optional(),
        notifyOnDelay: z.number().optional(),
        notifyOnArrival: z.number().optional(),
        emailNotifications: z.number().optional(),
        emailFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
        notifyContainerUpdates: z.number().optional(),
        notifyDischargeDateChanges: z.number().optional(),
        notifyMissingDocuments: z.number().optional(),
        quietHoursStart: z.string().nullable().optional(),
        quietHoursEnd: z.string().nullable().optional(),
        timezone: z.string().optional(),
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
          updates.notifyOnStatusChange = input.notifyOnStatusChange;
        }
        if (input.notifyOnDelay !== undefined) {
          updates.notifyOnDelay = input.notifyOnDelay;
        }
        if (input.notifyOnArrival !== undefined) {
          updates.notifyOnArrival = input.notifyOnArrival;
        }
        if (input.emailNotifications !== undefined) {
          updates.emailNotifications = input.emailNotifications;
        }
        if (input.emailFrequency !== undefined) {
          updates.emailFrequency = input.emailFrequency;
        }
        if (input.notifyContainerUpdates !== undefined) {
          updates.notifyContainerUpdates = input.notifyContainerUpdates;
        }
        if (input.notifyDischargeDateChanges !== undefined) {
          updates.notifyDischargeDateChanges = input.notifyDischargeDateChanges;
        }
        if (input.notifyMissingDocuments !== undefined) {
          updates.notifyMissingDocuments = input.notifyMissingDocuments;
        }
        if (input.quietHoursStart !== undefined) {
          updates.quietHoursStart = input.quietHoursStart;
        }
        if (input.quietHoursEnd !== undefined) {
          updates.quietHoursEnd = input.quietHoursEnd;
        }
        if (input.timezone !== undefined) {
          updates.timezone = input.timezone;
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
