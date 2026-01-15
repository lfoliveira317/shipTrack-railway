import { getDb } from './db';
import { shipments, trackingHistory, notifications, users } from '../drizzle/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { maerskClient } from './maersk';
import { notifyOwner } from './_core/notification';

/**
 * Automatic tracking service that polls Maersk API for shipment updates
 */

// Track how many shipments were processed in the last run
let lastRunStats = {
  timestamp: new Date(),
  shipmentsProcessed: 0,
  shipmentsUpdated: 0,
  errors: 0,
};

/**
 * Get the last run statistics
 */
export function getTrackingStats() {
  return lastRunStats;
}

/**
 * Send notifications for tracking events
 */
async function sendTrackingNotifications(
  db: any,
  shipment: any,
  events: {
    statusChanged: boolean;
    isDelayed: boolean;
    hasArrived: boolean;
    newStatus: string;
    oldEta: string | null;
    newEta: string | null;
  }
) {
  try {
    // Get all admin users to notify
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));

    const notificationPromises = [];

    // Status change notification
    if (events.statusChanged) {
      const message = `Shipment ${shipment.sellerCloudNumber || shipment.container} status changed to ${events.newStatus}`;
      
      // Notify owner
      notificationPromises.push(
        notifyOwner({
          title: 'Shipment Status Update',
          content: message,
        })
      );

      // Create in-app notifications for admins who have this preference enabled
      for (const admin of adminUsers) {
        if (admin.notifyOnStatusChange === 1) {
          notificationPromises.push(
            db.insert(notifications).values({
              userId: admin.id,
              shipmentId: shipment.id,
              type: 'status_change',
              title: 'Shipment Status Update',
              message,
              isRead: 0,
            })
          );
        }
      }
    }

    // Delay notification
    if (events.isDelayed && events.oldEta && events.newEta) {
      const oldDate = new Date(events.oldEta).toLocaleDateString();
      const newDate = new Date(events.newEta).toLocaleDateString();
      const message = `Shipment ${shipment.sellerCloudNumber || shipment.container} delayed. ETA changed from ${oldDate} to ${newDate}`;
      
      // Notify owner
      notificationPromises.push(
        notifyOwner({
          title: 'Shipment Delayed',
          content: message,
        })
      );

      // Create in-app notifications for admins who have this preference enabled
      for (const admin of adminUsers) {
        if (admin.notifyOnDelay === 1) {
          notificationPromises.push(
            db.insert(notifications).values({
              userId: admin.id,
              shipmentId: shipment.id,
              type: 'delay',
              title: 'Shipment Delayed',
              message,
              isRead: 0,
            })
          );
        }
      }
    }

    // Arrival notification
    if (events.hasArrived) {
      const message = `Shipment ${shipment.sellerCloudNumber || shipment.container} has arrived at destination`;
      
      // Notify owner
      notificationPromises.push(
        notifyOwner({
          title: 'Shipment Arrived',
          content: message,
        })
      );

      // Create in-app notifications for admins who have this preference enabled
      for (const admin of adminUsers) {
        if (admin.notifyOnArrival === 1) {
          notificationPromises.push(
            db.insert(notifications).values({
              userId: admin.id,
              shipmentId: shipment.id,
              type: 'arrival',
              title: 'Shipment Arrived',
              message,
              isRead: 0,
            })
          );
        }
      }
    }

    // Execute all notifications
    await Promise.all(notificationPromises);
    console.log(`[Notifications] Sent ${notificationPromises.length} notifications for shipment ${shipment.id}`);
  } catch (error: any) {
    console.error(`[Notifications] Error sending notifications for shipment ${shipment.id}:`, error.message);
  }
}

/**
 * Process a single shipment for tracking updates
 */
async function processShipment(shipment: any) {
  const db = await getDb();
  if (!db) {
    console.error('[Tracking] Database not available');
    return { updated: false, error: 'Database not available' };
  }

  try {
    console.log(`[Tracking] Processing shipment ${shipment.id} - Container: ${shipment.container}`);
    
    // Call Maersk API to get tracking data
    const rawResponse = await maerskClient.trackByContainerNumber(shipment.container, 'MAEU');
    const trackingData = maerskClient.extractContainerInfo(rawResponse);
    
    if (!trackingData) {
      console.log(`[Tracking] No tracking data found for shipment ${shipment.id}`);
      return { updated: false, error: null };
    }

    // Prepare updates based on tracking data
    const updates: any = {
      lastTrackedAt: new Date(),
      trackingStatus: trackingData.status,
    };

    // Update ETA if available from tracking data
    if (trackingData.legs && trackingData.legs.length > 0) {
      const lastLeg = trackingData.legs[trackingData.legs.length - 1];
      if (lastLeg.eta) {
        updates.eta = new Date(lastLeg.eta).toISOString();
      }
      
      // Update ATA if the last leg has arrived
      if (lastLeg.ata) {
        updates.ata = new Date(lastLeg.ata).toISOString();
      }

      // Update ports if available
      if (trackingData.legs[0]?.from) {
        updates.pol = trackingData.legs[0].from;
      }
      if (lastLeg.to) {
        updates.pod = lastLeg.to;
      }
    }

    // Check if status has changed
    const statusChanged = shipment.trackingStatus !== trackingData.status;

    // Get last leg for notification checks
    const lastLeg = trackingData.legs && trackingData.legs.length > 0 
      ? trackingData.legs[trackingData.legs.length - 1] 
      : null;

    // Check for delays (ETA changed to later date)
    let isDelayed = false;
    if (shipment.eta && lastLeg?.eta) {
      const oldEta = new Date(shipment.eta);
      const newEta = new Date(lastLeg.eta);
      isDelayed = newEta > oldEta;
    }

    // Check for arrival
    const hasArrived = trackingData.status === 'DELIVERED' || Boolean(lastLeg?.ata && !shipment.ata);

    // Update shipment in database
    await db.update(shipments)
      .set(updates)
      .where(eq(shipments.id, shipment.id));

    // Log tracking event to history
    await db.insert(trackingHistory).values({
      shipmentId: shipment.id,
      eventType: statusChanged ? 'status_change' : isDelayed ? 'eta_change' : 'tracking_update',
      eventDescription: `Container status: ${trackingData.status}`,
      location: trackingData.legs?.[trackingData.legs.length - 1]?.to || null,
      eventTimestamp: new Date(),
      rawData: JSON.stringify(trackingData),
    });

    // Send notifications for critical events
    await sendTrackingNotifications(db, shipment, {
      statusChanged,
      isDelayed,
      hasArrived,
      newStatus: trackingData.status,
      oldEta: shipment.eta,
      newEta: lastLeg?.eta || null,
    });

    console.log(`[Tracking] Updated shipment ${shipment.id} - Status: ${trackingData.status}`);
    
    return { updated: true, error: null, statusChanged };
  } catch (error: any) {
    console.error(`[Tracking] Error processing shipment ${shipment.id}:`, error.message);
    return { updated: false, error: error.message };
  }
}

/**
 * Run the automatic tracking job for all enabled shipments
 */
export async function runAutomaticTracking() {
  console.log('[Tracking] Starting automatic tracking job...');
  
  const db = await getDb();
  if (!db) {
    console.error('[Tracking] Database not available');
    return { success: false, error: 'Database not available', processed: 0, updated: 0, errors: 0 };
  }

  const startTime = Date.now();
  let processed = 0;
  let updated = 0;
  let errors = 0;

  try {
    // Get all shipments with auto-tracking enabled
    const enabledShipments = await db
      .select()
      .from(shipments)
      .where(
        and(
          eq(shipments.autoTrackingEnabled, 1),
          isNotNull(shipments.container)
        )
      );

    console.log(`[Tracking] Found ${enabledShipments.length} shipments with auto-tracking enabled`);

    // Process each shipment
    for (const shipment of enabledShipments) {
      processed++;
      
      const result = await processShipment(shipment);
      
      if (result.updated) {
        updated++;
      }
      if (result.error) {
        errors++;
      }

      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const duration = Date.now() - startTime;
    console.log(`[Tracking] Job completed in ${duration}ms - Processed: ${processed}, Updated: ${updated}, Errors: ${errors}`);

    // Update stats
    lastRunStats = {
      timestamp: new Date(),
      shipmentsProcessed: processed,
      shipmentsUpdated: updated,
      errors,
    };

    return {
      success: true,
      processed,
      updated,
      errors,
      duration,
    };
  } catch (error: any) {
    console.error('[Tracking] Fatal error in tracking job:', error);
    return {
      success: false,
      error: error.message,
      processed,
      updated,
      errors,
    };
  }
}

/**
 * Start the automatic tracking scheduler
 * Runs every 30 minutes by default
 */
let trackingInterval: NodeJS.Timeout | null = null;

export function startTrackingScheduler(intervalMinutes: number = 30) {
  if (trackingInterval) {
    console.log('[Tracking] Scheduler already running');
    return;
  }

  console.log(`[Tracking] Starting scheduler - will run every ${intervalMinutes} minutes`);
  
  // Run immediately on start
  runAutomaticTracking();

  // Then run on interval
  trackingInterval = setInterval(() => {
    runAutomaticTracking();
  }, intervalMinutes * 60 * 1000);
}

export function stopTrackingScheduler() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
    console.log('[Tracking] Scheduler stopped');
  }
}
