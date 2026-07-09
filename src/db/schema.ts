import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const portals = sqliteTable("portals", {
  id: text("id").primaryKey(), // UUID v4
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), // UUID v4
  portalId: text("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const downloadSessions = sqliteTable("download_sessions", {
  id: text("id").primaryKey(), // Expiring token UUID
  portalId: text("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
