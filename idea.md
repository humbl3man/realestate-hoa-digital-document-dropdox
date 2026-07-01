# Product Specification & Architecture: Micro-SaaS HOA/Property Document Portal

## 1. Stack Selection

- **Framework:** Next.js (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS + `shadcn/ui` primitives
- **Authentication:** `better-auth` (Passwordless Email / Magic Link)
- **Database:** SQLite
- **ORM:** Drizzle ORM
- **Storage:** Supabase Storage (S3-Compatible Object Storage)
- **Payments:** Stripe Checkout (Hosted)
- **Transactional Email:** Resend

---

## 2. Core Features (Strict MVP Scope)

- **HOA Manager Dashboard:** Authenticated internal view to create a document portal, specify a public slug, set a document access price, and upload a bundle of PDF files.
- **Public Portal Page (`/p/[slug]`):** A lightweight, unauthenticated landing page listing the filenames included in the bundle and a primary "Purchase Documents" call-to-action.
- **Hosted Payment Checkout:** Redirects the buyer entirely to Stripe Checkout.
- **Secure Delivery:** A Stripe webhook triggers an automated email via Resend containing a time-expiring, signed Supabase download link valid for 48 hours. No buyer account creation required.

---

## 3. Database Schema (Drizzle + SQLite)

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Note: better-auth core tables (users, sessions, accounts)
// will be generated automatically by the library middleware.

export const portals = sqliteTable("portals", {
  id: text("id").primaryKey(), // UUID v4
  userId: text("user_id").notNull(), // FK referencing better-auth user table
  name: text("name").notNull(), // e.g., "Oakwood HOA Disclosures"
  slug: text("slug").unique().notNull(), // URL identifier: oakwood-hoa
  priceInCents: integer("price_in_cents").notNull(), // e.g., 3500 for $35.00
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), // UUID v4
  portalId: text("portal_id")
    .notNull()
    .references(() => portals.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(), // Path/key inside Supabase bucket
  fileName: text("file_name").notNull(), // e.g., "2026_bylaws.pdf"
  fileSize: integer("file_size").notNull(), // In bytes
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```
