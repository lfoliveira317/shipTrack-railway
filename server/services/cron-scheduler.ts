/**
 * Cron Scheduler for Email Digests
 * Handles scheduled tasks for sending digest emails
 */

import { processScheduledDigests, scheduleDigests } from './digest-service';

let schedulerInterval: NodeJS.Timeout | null = null;

/**
 * Start the cron scheduler
 */
export function startScheduler(): void {
  console.log('[Scheduler] Starting email digest scheduler...');

  // Schedule initial digests for all users
  scheduleDigests().catch((error) => {
    console.error('[Scheduler] Error scheduling initial digests:', error);
  });

  // Process scheduled digests every 5 minutes
  schedulerInterval = setInterval(async () => {
    try {
      await processScheduledDigests();
      
      // Re-schedule digests for users (to handle new users or changed preferences)
      await scheduleDigests();
    } catch (error: any) {
      console.error('[Scheduler] Error in digest processing:', error.message);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  console.log('[Scheduler] Email digest scheduler started (runs every 5 minutes)');
}

/**
 * Stop the cron scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Email digest scheduler stopped');
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { running: boolean } {
  return {
    running: schedulerInterval !== null,
  };
}
