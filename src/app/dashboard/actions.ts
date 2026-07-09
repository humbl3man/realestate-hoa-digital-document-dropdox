"use server";

import { db } from "@/db";
import { portals, documents, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { deleteDocument } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function createPortal(formData: { name: string; slug: string; priceInCents: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!formData.name || !formData.slug || formData.priceInCents <= 0) {
    throw new Error("Invalid inputs");
  }

  // Server-side guard: Stripe account must be connected AND fully onboarded before creating portals
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser?.stripeAccountId) {
    throw new Error(
      "You must connect a Stripe account before creating portals. Go to Settings → Payouts to get started."
    );
  }
  
  const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
  if (!account.details_submitted) {
    throw new Error(
      "Your Stripe account setup is incomplete. Go to Settings → Payouts to finish onboarding before creating portals."
    );
  }

  const cleanSlug = formData.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "");

  // Check unique slug
  const existing = await db
    .select()
    .from(portals)
    .where(eq(portals.slug, cleanSlug))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Slug is already taken. Please choose another one.");
  }

  await db.insert(portals).values({
    id: randomUUID(),
    userId: session.user.id,
    name: formData.name,
    slug: cleanSlug,
    priceInCents: formData.priceInCents,
    createdAt: new Date(),
  });

  revalidatePath("/dashboard");
}

export async function deletePortal(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Delete all documents associated with this portal from Supabase Storage
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.portalId, id));

  for (const doc of docs) {
    try {
      await deleteDocument(doc.storagePath);
    } catch (e) {
      console.error(`Failed to delete storage path ${doc.storagePath}:`, e);
    }
  }

  await db.delete(portals).where(eq(portals.id, id));

  revalidatePath("/dashboard");
}

export async function deleteDocumentAction(docId: string, portalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [doc] = await db.select().from(documents).where(eq(documents.id, docId)).limit(1);
  if (!doc) {
    throw new Error("Document not found");
  }

  const [portal] = await db.select().from(portals).where(eq(portals.id, portalId)).limit(1);
  if (!portal || portal.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await deleteDocument(doc.storagePath);
  await db.delete(documents).where(eq(documents.id, docId));

  revalidatePath(`/dashboard/portals/${portalId}`);
}

export async function updatePortal(
  portalId: string,
  formData: { name: string; slug: string; priceInCents: number }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [portal] = await db.select().from(portals).where(eq(portals.id, portalId)).limit(1);
  if (!portal || portal.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const cleanSlug = formData.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "");

  if (cleanSlug !== portal.slug) {
    const existing = await db
      .select()
      .from(portals)
      .where(eq(portals.slug, cleanSlug))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Slug is already taken. Please choose another one.");
    }
  }

  await db
    .update(portals)
    .set({
      name: formData.name,
      slug: cleanSlug,
      priceInCents: formData.priceInCents,
    })
    .where(eq(portals.id, portalId));

  revalidatePath(`/dashboard/portals/${portalId}`);
  revalidatePath("/dashboard");
}
