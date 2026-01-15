import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { maerskClient } from './maersk';
import { TRPCError } from '@trpc/server';

export const maerskTrackingRouter = router({
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.response?.data?.message || 'Failed to track container',
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.response?.data?.message || 'Failed to track by BOL',
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error.response?.data?.message || 'Failed to track by booking number',
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error.response?.data?.message ||
            'Failed to track and update shipment',
        });
      }
    }),
});
