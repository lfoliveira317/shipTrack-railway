import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from './_core/trpc';
import { maerskClient } from './maersk';
import { trackContainerTimeToGo } from './timetogo-tracking';
import { TRPCError } from '@trpc/server';
import { runAutomaticTracking, getTrackingStats, startTrackingScheduler, stopTrackingScheduler } from './tracking-service';
import { getDb } from './db';
import { shipments, trackingHistory } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const maerskTrackingRouter = router({
  /**
   * Track container using TimeToGo API (fallback/alternative to Maersk)
   */
  trackWithTimeToGo: protectedProcedure
    .input(
      z.object({
        containerNumber: z.string().min(1, 'Container number is required'),
        company: z.string().optional().default('AUTO'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await trackContainerTimeToGo(
          input.containerNumber,
          input.company
        );
        
        if (!response.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: response.message || 'Failed to track container with TimeToGo',
          });
        }
        
        return {
          success: true,
          data: response.data,
        };
      } catch (error: any) {
        console.error('TimeToGo tracking error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to track container with TimeToGo',
        });
      }
    }),

  /**
   * Track container by container number
   */
  trackByContainerNumber: protectedProcedure
    .input(
      z.object({
        containerNumber: z.string().min(1, 'Container number is required'),
        scac: z.string().optional().default('MAEU'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await maerskClient.trackByContainerNumber(
          input.containerNumber,
          input.scac
        );
        const containerInfo = maerskClient.extractContainerInfo(response);
        return {
          success: true,
          data: containerInfo,
        };
      } catch (error: any) {
        console.error('Maersk tracking error:', error);
        
        // Check for authentication errors
        if (error.message?.includes('authenticate') || error.response?.data?.error === 'invalid_client') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Maersk API authentication failed. Please verify your Maersk API credentials.',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.response?.data?.message || error.message || 'Failed to track container',
        });
      }
    }),

  /**
   * Track container by Bill of Lading number
   */
  trackByBillOfLading: protectedProcedure
    .input(
      z.object({
        bolNumber: z.string().min(1, 'Bill of Lading number is required'),
        scac: z.string().optional().default('MAEU'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await maerskClient.trackByBillOfLading(
          input.bolNumber,
          input.scac
        );
        const containerInfo = maerskClient.extractContainerInfo(response);
        return {
          success: true,
          data: containerInfo,
        };
      } catch (error: any) {
        console.error('Maersk tracking error:', error);
        
        // Check for authentication errors
        if (error.message?.includes('authenticate') || error.response?.data?.error === 'invalid_client') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Maersk API authentication failed. Please verify your Maersk API credentials.',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.response?.data?.message || error.message || 'Failed to track by BOL',
        });
      }
    }),

  /**
   * Track container by booking number
   */
  trackByBookingNumber: protectedProcedure
    .input(
      z.object({
        bookingNumber: z.string().min(1, 'Booking number is required'),
        scac: z.string().optional().default('MAEU'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await maerskClient.trackByBookingNumber(
          input.bookingNumber,
          input.scac
        );
        const containerInfo = maerskClient.extractContainerInfo(response);
        return {
          success: true,
          data: containerInfo,
        };
      } catch (error: any) {
        console.error('Maersk tracking error:', error);
        
        // Check for authentication errors
        if (error.message?.includes('authenticate') || error.response?.data?.error === 'invalid_client') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Maersk API authentication failed. Please verify your Maersk API credentials.',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error.response?.data?.message || error.message || 'Failed to track by booking number',
        });
      }
    }),

  /**
   * Get tracking info and update shipment
   * This combines tracking with shipment update
   */
  trackAndUpdateShipment: protectedProcedure
    .input(
      z.object({
        shipmentId: z.number(),
        trackingType: z.enum(['container', 'bol', 'booking']),
        trackingValue: z.string().min(1, 'Tracking value is required'),
        scac: z.string().optional().default('MAEU'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Track container based on type
        let response;
        switch (input.trackingType) {
          case 'container':
            response = await maerskClient.trackByContainerNumber(
              input.trackingValue,
              input.scac
            );
            break;
          case 'bol':
            response = await maerskClient.trackByBillOfLading(
              input.trackingValue,
              input.scac
            );
            break;
          case 'booking':
            response = await maerskClient.trackByBookingNumber(
              input.trackingValue,
              input.scac
            );
            break;
        }

        const containerInfo = maerskClient.extractContainerInfo(response);

        // Extract useful information for shipment update
        const firstLeg = containerInfo.legs[0];
        const lastLeg = containerInfo.legs[containerInfo.legs.length - 1];

        // Determine status based on container status
        let status = 'In transit';
        if (containerInfo.status === 'DELIVERED') {
          status = 'Delivered';
        } else if (containerInfo.status === 'LOADED_ON_VESSEL') {
          status = 'Loaded';
        } else if (containerInfo.status === 'DEPARTED') {
          status = 'Departed';
        }

        // Return tracking info and suggested updates
        // The frontend will handle the actual shipment update
        return {
          success: true,
          trackingData: containerInfo,
          suggestedUpdates: {
            status,
            carrier: firstLeg?.carrier || null,
            vesselName: firstLeg?.vesselName || null,
            voyageNumber: firstLeg?.voyageNumber || null,
            portOfLoading: firstLeg?.from || null,
            portOfDischarge: lastLeg?.to || null,
            atd: firstLeg?.atd || firstLeg?.etd || null,
            eta: lastLeg?.eta || null,
            ata: lastLeg?.ata || null,
          },
        };
      } catch (error: any) {
        console.error('Maersk tracking and update error:', error);
        
        // Check for authentication errors
        if (error.message?.includes('authenticate') || error.response?.data?.error === 'invalid_client') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Maersk API authentication failed. Please check your Maersk credentials (MAERSK_CLIENT_ID and MAERSK_CLIENT_SECRET).',
          });
        }
        
        // Check for network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unable to connect to Maersk API. Please check your network connection.',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error.response?.data?.message ||
            error.message ||
            'Failed to track and update shipment',
        });
      }
    }),

  /**
   * Toggle auto-tracking for a shipment
   */
  toggleAutoTracking: protectedProcedure
    .input(
      z.object({
        shipmentId: z.number(),
        enabled: z.boolean(),
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

        await db
          .update(shipments)
          .set({ autoTrackingEnabled: input.enabled ? 1 : 0 })
          .where(eq(shipments.id, input.shipmentId));

        return {
          success: true,
          message: `Auto-tracking ${input.enabled ? 'enabled' : 'disabled'}`,
        };
      } catch (error: any) {
        console.error('Toggle auto-tracking error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle auto-tracking',
        });
      }
    }),

  /**
   * Get tracking history for a shipment
   */
  getTrackingHistory: protectedProcedure
    .input(
      z.object({
        shipmentId: z.number(),
        limit: z.number().optional().default(50),
      })
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

        const history = await db
          .select()
          .from(trackingHistory)
          .where(eq(trackingHistory.shipmentId, input.shipmentId))
          .orderBy(desc(trackingHistory.createdAt))
          .limit(input.limit);

        return history;
      } catch (error: any) {
        console.error('Get tracking history error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get tracking history',
        });
      }
    }),

  /**
   * Manually trigger automatic tracking job (admin only)
   */
  runTrackingJob: adminProcedure.mutation(async () => {
    try {
      const result = await runAutomaticTracking();
      return result;
    } catch (error: any) {
      console.error('Run tracking job error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to run tracking job',
      });
    }
  }),

  /**
   * Get tracking job statistics (admin only)
   */
  getTrackingStats: adminProcedure.query(() => {
    return getTrackingStats();
  }),

  /**
   * Start/stop automatic tracking scheduler (admin only)
   */
  controlScheduler: adminProcedure
    .input(
      z.object({
        action: z.enum(['start', 'stop']),
        intervalMinutes: z.number().optional().default(30),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.action === 'start') {
          startTrackingScheduler(input.intervalMinutes);
          return {
            success: true,
            message: `Tracking scheduler started (${input.intervalMinutes} min interval)`,
          };
        } else {
          stopTrackingScheduler();
          return {
            success: true,
            message: 'Tracking scheduler stopped',
          };
        }
      } catch (error: any) {
        console.error('Control scheduler error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to control scheduler',
        });
      }
    }),
});
