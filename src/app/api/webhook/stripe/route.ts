import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PurchaseFlow } from "@/core/purchase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for local testing without stripe CLI webhooks configured
      console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification skipped.");
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const portalId = session.metadata?.portalId;
    const email = session.customer_details?.email;

    if (!portalId || !email) {
      console.error("Missing portalId or email in session metadata/customer_details");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
