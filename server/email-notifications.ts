/**
 * Email Notification Service
 * Sends template-based emails for various container notifications
 */

import { sendEmail } from "./email-service";
import {
  generateContainerUpdatesEmail,
  generateDateChangesEmail,
  generateMissingDocumentsEmail,
} from "./email-templates";
import { getDb } from "./db";
import { users, shipments, attachments } from "../drizzle/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * Send container updates notification email
 * Sends to all admin users with email notifications enabled
 */
export async function sendContainerUpdatesNotification(
  shipmentIds: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get admin users with email notifications enabled
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };
    
    const adminUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "admin"),
          eq(users.emailNotifications, 1)
        )
      );

    if (adminUsers.length === 0) {
      return { success: true }; // No users to notify
    }

    // Get shipment details
    const updatedShipments = await db
      .select()
      .from(shipments)
      .where(sql`${shipments.id} IN ${shipmentIds}`);

    if (updatedShipments.length === 0) {
      return { success: true }; // No shipments to report
    }

    // Format container data for email
    const containerUpdates = updatedShipments.map((shipment: any) => ({
      containerNumber: shipment.container || "N/A",
      supplier: shipment.supplier || "",
      cro: shipment.cro || "",
      carrier: shipment.carrier || "",
      status: shipment.status || "Unknown",
      pol: shipment.pol || "",
      pod: shipment.pod || "",
      atd: shipment.atd,
      eta: shipment.eta,
      ata: shipment.ata,
      vesselName: shipment.vesselName || "",
      voyageNumber: shipment.voyageNumber || "",
      changes: ["Tracking information updated from API"],
    }));

    // Send email to each admin user
    const results = await Promise.allSettled(
      adminUsers.map(async (user: any) => {
        const emailHtml = generateContainerUpdatesEmail(
          containerUpdates,
          user.name || "Team"
        );

        return sendEmail({
          to: user.email,
          subject: `Container Tracking Updates - ${containerUpdates.length} Container${containerUpdates.length !== 1 ? "s" : ""} Updated`,
          html: emailHtml,
        });
      })
    );

    const failures = results.filter((r: any) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some emails failed to send:", failures);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending container updates notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send discharge date changes notification email
 * Sends to all admin users when ETA/ATA changes
 */
export async function sendDateChangesNotification(
  changes: Array<{
    shipmentId: number;
    previousEta: string | null;
    newEta: string | null;
    previousAta: string | null;
    newAta: string | null;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get admin users with email notifications enabled
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };
    
    const adminUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "admin"),
          eq(users.emailNotifications, 1),
          eq(users.notifyOnDelay, 1) // Only notify users who want delay notifications
        )
      );

    if (adminUsers.length === 0) {
      return { success: true };
    }

    // Get shipment details
    const shipmentIds = changes.map((c: any) => c.shipmentId);
    const affectedShipments = await db
      .select()
      .from(shipments)
      .where(sql`${shipments.id} IN ${shipmentIds}`);

    // Format date change data
    const dateChanges = changes.map((change: any) => {
      const shipment = affectedShipments.find((s: any) => s.id === change.shipmentId);
      if (!shipment) return null;

      // Calculate delay in days
      let delayDays = 0;
      if (change.previousEta && change.newEta) {
        const prevDate = new Date(change.previousEta);
        const newDate = new Date(change.newEta);
        delayDays = Math.ceil(
          (newDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        containerNumber: shipment.container || "N/A",
        supplier: shipment.supplier || "",
        cro: shipment.cro || "",
        carrier: shipment.carrier || "",
        pod: shipment.pod || "",
        previousEta: change.previousEta,
        newEta: change.newEta,
        previousAta: change.previousAta,
        newAta: change.newAta,
        delayDays,
      };
    }).filter(Boolean) as any[];

    if (dateChanges.length === 0) {
      return { success: true };
    }

    // Send email to each admin user
    const results = await Promise.allSettled(
      adminUsers.map(async (user: any) => {
        const emailHtml = generateDateChangesEmail(
          dateChanges,
          user.name || "Team"
        );

        return sendEmail({
          to: user.email,
          subject: `⚠ Discharge Date Changes - ${dateChanges.length} Container${dateChanges.length !== 1 ? "s" : ""} Affected`,
          html: emailHtml,
        });
      })
    );

    const failures = results.filter((r: any) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some emails failed to send:", failures);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending date changes notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send missing documents notification email
 * Checks for containers missing required documents and sends alert
 */
export async function sendMissingDocumentsNotification(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get admin users with email notifications enabled
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };
    
    const adminUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "admin"),
          eq(users.emailNotifications, 1)
        )
      );

    if (adminUsers.length === 0) {
      return { success: true };
    }

    // Get all active shipments (not delivered)
    const activeShipments = await db
      .select()
      .from(shipments)
      .where(sql`${shipments.status} != 'Delivered'`);

    // Required document types
    const requiredDocTypes = [
      "Commercial Invoice",
      "Packing List",
      "Bill of Lading",
      "Certificate of Origin",
    ];

    // Check each shipment for missing documents
    const shipmentsWithMissingDocs = await Promise.all(
      activeShipments.map(async (shipment: any) => {
        // Get all attachments for this shipment
        const shipmentAttachments = await db
          .select()
          .from(attachments)
          .where(eq(attachments.shipmentId, shipment.id));

        const existingDocTypes = shipmentAttachments.map((a: any) => a.type);
        const missingDocTypes = requiredDocTypes.filter(
          (type) => !existingDocTypes.includes(type)
        );

        if (missingDocTypes.length > 0) {
          return {
            containerNumber: shipment.container || "N/A",
            supplier: shipment.supplier || "",
            cro: shipment.cro || "",
            carrier: shipment.carrier || "",
            status: shipment.status || "Unknown",
            eta: shipment.eta,
            missingDocTypes,
          };
        }
        return null;
      })
    );

    const missingDocsList = shipmentsWithMissingDocs.filter(Boolean) as any[];

    if (missingDocsList.length === 0) {
      return { success: true }; // No missing documents
    }

    // Send email to each admin user
    const results = await Promise.allSettled(
      adminUsers.map(async (user: any) => {
        const emailHtml = generateMissingDocumentsEmail(
          missingDocsList,
          user.name || "Team"
        );

        return sendEmail({
          to: user.email,
          subject: `📋 Missing Documents Alert - ${missingDocsList.length} Container${missingDocsList.length !== 1 ? "s" : ""} Require Attention`,
          html: emailHtml,
        });
      })
    );

    const failures = results.filter((r: any) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some emails failed to send:", failures);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending missing documents notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Schedule daily missing documents check
 * Call this function on a schedule (e.g., daily at 9 AM)
 */
export async function scheduledMissingDocumentsCheck(): Promise<void> {
  console.log("[Email Notifications] Running scheduled missing documents check...");
  const result = await sendMissingDocumentsNotification();
  if (result.success) {
    console.log("[Email Notifications] Missing documents check completed successfully");
  } else {
    console.error("[Email Notifications] Missing documents check failed:", result.error);
  }
}
