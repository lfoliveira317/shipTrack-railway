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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Shipments table
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 255 }),
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
  shipmentType: varchar("shipmentType", { length: 50 }).default("ocean"),
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
  uploadedBy: varchar("uploadedBy", { length: 255 }).notNull(),
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