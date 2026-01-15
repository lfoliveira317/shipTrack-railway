import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["viewer", "user", "admin"]).default("viewer").notNull(),
  notifyOnStatusChange: int("notifyOnStatusChange").default(1).notNull(), // 0 = disabled, 1 = enabled
  notifyOnDelay: int("notifyOnDelay").default(1).notNull(),
  notifyOnArrival: int("notifyOnArrival").default(1).notNull(),
  emailNotifications: int("emailNotifications").default(1).notNull(), // 0 = disabled, 1 = enabled
  emailFrequency: mysqlEnum("emailFrequency", ["immediate", "hourly", "daily", "weekly"]).default("immediate").notNull(),
  notifyContainerUpdates: int("notifyContainerUpdates").default(1).notNull(), // 0 = disabled, 1 = enabled
  notifyDischargeDateChanges: int("notifyDischargeDateChanges").default(1).notNull(),
  notifyMissingDocuments: int("notifyMissingDocuments").default(1).notNull(),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }), // e.g., "22:00"
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }), // e.g., "08:00"
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(), // User's timezone
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Shipments table
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  sellerCloudNumber: varchar("sellerCloudNumber", { length: 255 }), // SellerCloud #
  label: varchar("label", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }),
  cro: varchar("cro", { length: 255 }),
  container: varchar("container", { length: 255 }).notNull(),
  mawbNumber: varchar("mawbNumber", { length: 255 }),
  carrier: varchar("carrier", { length: 255 }).notNull(),
  status: varchar("status", { length: 100 }).notNull(),
  pol: varchar("pol", { length: 255 }),
  pod: varchar("pod", { length: 255 }),
  atd: varchar("atd", { length: 255 }),
  eta: varchar("eta", { length: 255 }).notNull(),
  ata: varchar("ata", { length: 255 }),
  bolNumber: varchar("bolNumber", { length: 255 }),
  poNumber: varchar("poNumber", { length: 255 }), // PO Number for SellerCloud
  shipmentType: varchar("shipmentType", { length: 50 }).default("ocean"),
  autoTrackingEnabled: int("autoTrackingEnabled").default(0).notNull(), // 0 = disabled, 1 = enabled
  lastTrackedAt: timestamp("lastTrackedAt"),
  trackingStatus: varchar("trackingStatus", { length: 100 }), // Last known tracking status from API
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

// Attachments table
export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  s3Key: varchar("s3Key", { length: 500 }),
  s3Url: varchar("s3Url", { length: 1000 }),
  uploadedBy: varchar("uploadedBy", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 255 }), // BOL, Purchase Invoice, Sold Invoice, Packing Slip, Arrival Notice
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// Comments table
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull(),
  text: text("text").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// API Configuration table
export const apiConfigs = mysqlTable("apiConfigs", {
  id: int("id").autoincrement().primaryKey(),
  mode: varchar("mode", { length: 50 }).notNull(), // "single" or "per-carrier"
  carrier: varchar("carrier", { length: 100 }), // null for single mode
  url: varchar("url", { length: 500 }).notNull(),
  port: varchar("port", { length: 10 }),
  token: text("token"),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = typeof apiConfigs.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shipmentId: int("shipmentId"),
  type: varchar("type", { length: 50 }).notNull(), // "status_change", "delay", "arrival", "comment", etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
// Dropdown values tables for managing Supplier, Carrier, Port of Loading, Port of Discharge
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export const carriers = mysqlTable("carriers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Carrier = typeof carriers.$inferSelect;
export type InsertCarrier = typeof carriers.$inferInsert;

export const ports = mysqlTable("ports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 10 }), // Port code like SG, LA, etc.
  type: mysqlEnum("type", ["loading", "discharge"]).notNull(), // loading (POL) or discharge (POD)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Port = typeof ports.$inferSelect;
export type InsertPort = typeof ports.$inferInsert;

// Document types table for managing attachment document types
export const documentTypes = mysqlTable("documentTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = typeof documentTypes.$inferInsert;

// Tracking history table for storing container tracking events
export const trackingHistory = mysqlTable("trackingHistory", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // "status_change", "location_update", "eta_change", etc.
  eventDescription: text("eventDescription").notNull(),
  location: varchar("location", { length: 255 }),
  eventTimestamp: timestamp("eventTimestamp"),
  rawData: text("rawData"), // JSON string of full API response
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackingHistory = typeof trackingHistory.$inferSelect;
export type InsertTrackingHistory = typeof trackingHistory.$inferInsert;

// Webhook events table for external integrations
export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId"),
  containerNumber: varchar("containerNumber", { length: 255 }),
  eventType: varchar("eventType", { length: 100 }).notNull(), // "customs_clearance", "gate_in", "gate_out", "vessel_departure", etc.
  eventData: text("eventData").notNull(), // JSON string of webhook payload
  source: varchar("source", { length: 100 }), // Source system that sent the webhook
  processed: int("processed").default(0).notNull(), // 0 = pending, 1 = processed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

// Email digest queue table for scheduled email sending
export const emailDigestQueue = mysqlTable("emailDigestQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  digestType: mysqlEnum("digestType", ["hourly", "daily", "weekly"]).notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  sent: int("sent").default(0).notNull(), // 0 = pending, 1 = sent
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailDigestQueue = typeof emailDigestQueue.$inferSelect;
export type InsertEmailDigestQueue = typeof emailDigestQueue.$inferInsert;
