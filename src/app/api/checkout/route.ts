import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { portals, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { appConfig } from "@/config";

export async function POST(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const formData = await req.formData();
    const portalId = formData.get("portalId") as string | null;

    const referer = req.headers.get("referer");
    const fallbackErrorRedirect = (errorCode: string) => {
      if (referer) {
        const url = new URL(referer);
        url.searchParams.set("error", errorCode);
        return NextResponse.redirect(url.toString(), { status: 303 });
      }
      return new NextResponse(`Checkout Error: ${errorCode}`, { status: 400 });
    };

    if (!portalId) {
      return fallbackErrorRedirect("not-found");
    }

    const [portal] = await db
      .select()
      .from(portals)
      .where(eq(portals.id, portalId))
      .limit(1);

    if (!portal) {
      return fallbackErrorRedirect("not-found");
    }

    // Reject purchases for deactivated portals (e.g. seller disconnected Stripe)
    if (!portal.isActive) {
      return NextResponse.redirect(`${appUrl}/p/${portal.slug}?error=unavailable`, { status: 303 });
    }

    // Fetch the portal owner's connected Stripe account
    const [portalOwner] = await db
      .select()
      .from(user)
      .where(eq(user.id, portal.userId))
      .limit(1);

    if (!portalOwner?.stripeAccountId) {
      return NextResponse.redirect(`${appUrl}/p/${portal.slug}?error=not-connected`, { status: 303 });
    }

    // Calculate platform fee
    const platformFee = Math.round(portal.priceInCents * (appConfig.platformFeePercentage / 100));

    // Create Stripe Checkout Session using Destination Charges
    // Funds go to the seller; platform fee is retained by us
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${portal.name} Documents`,
              description: portal.description || "ZIP archive containing uploaded documents",
            },
            unit_amount: portal.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: portalOwner.stripeAccountId,
        },
      },
      metadata: {
        portalId: portal.id,
      },
      success_url: `${appUrl}/p/${portal.slug}?purchased=true`,
      cancel_url: `${appUrl}/p/${portal.slug}`,
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Session URL");
    }

    // 303 redirection is standard for form post redirects
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Stripe session creation error:", err);
    return new NextResponse(message, { status: 500 });
  }
}
