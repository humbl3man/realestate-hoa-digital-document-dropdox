import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { portals, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { PurchaseFlow } from "@/core/purchase";
import { getAppUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event;

  try {
    const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      console.warn(
        "STRIPE_CONNECT_WEBHOOK_SECRET is not set. Webhook signature verification skipped."
      );
      event = JSON.parse(body);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Connect webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // When a connected account revokes our platform's access
  if (event.type === "account.application.deauthorized") {
    const stripeAccountId = event.account as string;

    if (!stripeAccountId) {
      console.error("Missing account ID in deauthorization event");
      return new NextResponse("Missing account ID", { status: 400 });
    }

    try {
      // Find the user with this connected account
      const [affectedUser] = await db
        .select()
        .from(user)
        .where(eq(user.stripeAccountId, stripeAccountId))
        .limit(1);

      if (!affectedUser) {
        // Account not found — may have already been cleaned up
        console.warn(`No user found for deauthorized Stripe account: ${stripeAccountId}`);
        return NextResponse.json({ received: true });
      }

      // Clear the connected account ID and deactivate all their portals
      await Promise.all([
        db
          .update(user)
          .set({ stripeAccountId: null })
          .where(eq(user.id, affectedUser.id)),
        db
          .update(portals)
          .set({ isActive: false })
          .where(eq(portals.userId, affectedUser.id)),
      ]);

      console.log(
        `Deauthorized Stripe account ${stripeAccountId} for user ${affectedUser.id}. All portals deactivated.`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to handle deauthorization:", message);
      return new NextResponse(`Error: ${message}`, { status: 500 });
    }
  }

  // Handle checkout.session.completed event for direct charges
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const portalId = session.metadata?.portalId;
    const email = session.customer_details?.email;

    if (!portalId || !email) {
      console.error("Missing portalId or email in session metadata/customer_details");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      const appUrl = getAppUrl(req);
      const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
      
      const result = await PurchaseFlow.fulfillOrder(portalId, email, session.amount_total, appUrl, emailFrom);
      
      if (!result.success) {
        if (result.reason === "not-found") {
          return new NextResponse("Portal not found", { status: 404 });
        }
        return new NextResponse(`Database/Email Error`, { status: 500 });
      }

      console.log(`Successfully created download session and emailed buyer: ${email}`);
    } catch (err: any) {
      console.error("Webhook processing failed:", err);
      return new NextResponse(`Database/Email Error: ${err.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
