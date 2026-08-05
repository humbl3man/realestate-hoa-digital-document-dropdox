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

export async function createPortal(formData: { name: string; slug: string; priceInCents: number; description?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!formData.name || !formData.slug || formData.priceInCents < 50) {
    return { error: "Invalid inputs or price is too low (minimum $0.50)" };
  }

  if (formData.description && formData.description.length > 100) {
    return { error: "Description must be 100 characters or less." };
  }

  // Server-side guard: Stripe account must be connected AND fully onboarded before creating portals
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser?.stripeAccountId) {
    return {
      error: "You must connect a Stripe account before creating portals. Go to Settings → Payouts to get started."
    };
  }
  
  const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
  if (!account.details_submitted) {
    return {
      error: "Your Stripe account setup is incomplete. Go to Settings → Payouts to finish onboarding before creating portals."
    };
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
    return { error: "Slug is already taken. Please choose another one." };
  }

  const newId = randomUUID();

  await db.insert(portals).values({
    id: newId,
    userId: session.user.id,
    name: formData.name,
    slug: cleanSlug,
    description: formData.description || null,
    priceInCents: formData.priceInCents,
    createdAt: new Date(),
  });

  revalidatePath("/dashboard");
  return { id: newId };
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
  formData: { name: string; slug: string; priceInCents: number; description?: string }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  const [portal] = await db.select().from(portals).where(eq(portals.id, portalId)).limit(1);
  if (!portal || portal.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  if (formData.description && formData.description.length > 100) {
    return { error: "Description must be 100 characters or less." };
  }

  if (formData.priceInCents < 50) {
    return { error: "Price must be at least $0.50." };
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
      return { error: "Slug is already taken. Please choose another one." };
    }
  }

  await db
    .update(portals)
    .set({
      name: formData.name,
      slug: cleanSlug,
      description: formData.description || null,
      priceInCents: formData.priceInCents,
    })
    .where(eq(portals.id, portalId));

  revalidatePath(`/dashboard/portals/${portalId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
