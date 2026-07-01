# Spec: Micro-SaaS HOA/Property Document Portal

## Objective
Build a lightweight, highly efficient Micro-SaaS portal for HOA and property managers to upload document bundles (PDF disclosures, bylaws, etc.) and sell them directly to prospective buyers. 
- **HOA Managers** can sign up, create a customized portal slug, set a price for the documents, and upload PDF files.
- **Buyers** visit the public slug URL (`/p/[slug]`), see the list of available document names, and purchase them via Stripe Checkout (hosted).
- **Secure Delivery:** A successful payment triggers a Stripe Webhook, which calls Resend to email the buyer a secure, time-limited signed Supabase download link valid for exactly 48 hours. No buyer account creation is required.

## Tech Stack
- **Framework:** Next.js 15+ (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS v4 + `shadcn/ui` primitives (lucide-react for icons)
- **Authentication:** `better-auth` (SQLite adapter, Passwordless Email / Magic Link)
- **Database:** SQLite (local `sqlite.db` file)
- **ORM:** Drizzle ORM
- **Storage:** Supabase Storage (via S3-compatible API or standard Supabase JS SDK)
- **Payments:** Stripe Checkout (Hosted)
- **Transactional Email:** Resend

## Commands
```bash
# Development Server
npm run dev

# Build Production Bundle
npm run build

# Drizzle Kit Commands
npx drizzle-kit generate
npx drizzle-kit migrate
npx drizzle-kit studio

# database studio (better-auth/drizzle tables)
npx prisma studio  # If prisma is configured, but we are using drizzle + drizzle-kit studio
```

## Project Structure
```
src/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page/login router
│   ├── dashboard/
│   │   ├── page.tsx                 # HOA Manager Dashboard (portals list, create portal)
│   │   └── portals/
│   │       └── [id]/
│   │           └── page.tsx         # Manage specific portal, upload PDFs, view sales
│   ├── p/
│   │   └── [slug]/
│   │       └── page.tsx             # Public landing page with buy button
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts         # better-auth endpoints
│   │   ├── webhook/
│   │   │   └── stripe/
│   │   │       └── route.ts         # Stripe webhook endpoint (creates download session / sends email)
│   │   └── checkout/
│   │       └── route.ts             # Stripe Checkout Session generator endpoint
│   └── download/
│       └── [token]/
│           └── route.ts             # Expiring link router / proxy to secure Supabase storage
├── db/
│   ├── index.ts                     # SQLite DB connection / Drizzle export
│   └── schema.ts                    # Portals, documents, downloadSessions schemas
├── lib/
│   ├── auth.ts                      # better-auth server configuration
│   ├── stripe.ts                    # Stripe client wrapper
│   ├── supabase.ts                  # Supabase storage client wrapper
│   └── resend.ts                    # Resend client wrapper
└── components/
    └── ui/                          # shadcn primitives (button, input, dialog, card, table)
```

## Code Style
- Use server actions for mutations where applicable, or standard Next.js Route Handlers.
- Ensure strict TypeScript typing (avoid `any`).
- Format code cleanly, keeping files small and single-purpose.

Example Drizzle/SQLite transaction wrapper:
```typescript
import { db } from "@/db";
import { portals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPortalBySlug(slug: string) {
  const result = await db.select().from(portals).where(eq(portals.slug, slug)).limit(1);
  return result[0] || null;
}
```

## Testing Strategy
- Unit tests for token generation, URL expiration math, and route validation.
- Verification of web UI flows (sign-in, dashboard creation, Stripe checkout redirect) via Chrome DevTools MCP or browser subagent.

## Boundaries
- **Always:** Use environment variables for secrets (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Validate webhook payloads using Stripe's official signature verifier. Set download link expiry time to exactly 48 hours.
- **Ask first:** Modifying the SQLite schema once initial structure is approved, adding dependencies outside of core stack (e.g. state management libraries).
- **Never:** Save database credentials or API keys directly in the codebase. Share buyer download tokens in unencrypted logs. Expose private download URLs publicly without signed verification.

## Success Criteria
- HOA Manager dashboard allows portal creation, editing price/slug, and PDF uploads.
- Public page loads under the custom slug, displays correct details, and links to Stripe Checkout.
- Successful checkout triggers email containing a signed download link.
- Clicking the download link allows file retrieval within 48 hours, but returns 403 Forbidden after 48 hours.

## Open Questions
- None currently (confirmed by user).
