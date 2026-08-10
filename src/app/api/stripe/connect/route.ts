import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const appUrl = getAppUrl();

    // Fetch the user's current record
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    let stripeAccountId = dbUser?.stripeAccountId;

    // If no connected account yet, create one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        business_profile: {
          url: "https://tetherdocs.app",
          product_description: "Property management and digital document portal services",
        },
      });
      stripeAccountId = account.id;

      await db
        .update(user)
        .set({ stripeAccountId })
        .where(eq(user.id, session.user.id));
    }

    // Generate a one-time onboarding link
    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId as string,
        refresh_url: `${appUrl}/api/stripe/connect`,
        return_url: `${appUrl}/api/stripe/callback`,
        type: "account_onboarding",
      });

      return NextResponse.redirect(accountLink.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      
      // Auto-heal if the database contains a stale/invalid Stripe Account ID 
      // (Common when switching between local/staging environments sharing the same DB)
      if (message.includes("not connected to your platform") || message.includes("does not exist")) {
        console.log("Auto-healing stale Stripe Account ID for user:", session.user.id);
        await db
          .update(user)
          .set({ stripeAccountId: null })
          .where(eq(user.id, session.user.id));
          
        return NextResponse.redirect(new URL("/api/stripe/connect", req.url));
      }
      
      throw err; // re-throw if it's a different error
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe connect error:", err);
    return new NextResponse(`Vercel Debug Error: ${message}. Check your Vercel Environment Variables!`, { status: 500 });
  }
}
