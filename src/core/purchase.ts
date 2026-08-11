import { db } from "@/db";
import { portals, user, downloadSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { appConfig } from "@/config";
import { randomUUID } from "crypto";

export type CreateSessionResult =
  | { success: true; url: string }
  | { success: false; reason: "not-found" | "unavailable" | "not-connected" | "stripe-error" };

export type FulfillOrderResult =
  | { success: true; token: string }
  | { success: false; reason: "not-found" | "db-error" };

export const PurchaseFlow = {
  async createCheckoutSession(
    portalId: string,
    appUrl: string
  ): Promise<CreateSessionResult> {
    try {
      const [portal] = await db
        .select()
        .from(portals)
        .where(eq(portals.id, portalId))
        .limit(1);

      if (!portal) {
        return { success: false, reason: "not-found" };
      }

      if (!portal.isActive) {
        return { success: false, reason: "unavailable" };
      }

      const [portalOwner] = await db
        .select()
        .from(user)
        .where(eq(user.id, portal.userId))
        .limit(1);

      if (!portalOwner?.stripeAccountId) {
        return { success: false, reason: "not-connected" };
      }

      const platformFee = Math.round(
        portal.priceInCents * (appConfig.platformFeePercentage / 100)
      );

      const session = await stripe.checkout.sessions.create(
        {
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: portal.name,
                  description:
                    portal.description || "ZIP archive containing uploaded documents",
                },
                unit_amount: portal.priceInCents,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          payment_intent_data: {
            application_fee_amount: platformFee,
          },
          metadata: {
            portalId: portal.id,
          },
          success_url: `${appUrl}/p/${portal.slug}?purchased=true`,
          cancel_url: `${appUrl}/p/${portal.slug}`,
        },
        {
          stripeAccount: portalOwner.stripeAccountId,
        }
      );

      if (!session.url) {
        throw new Error("Failed to create Stripe Session URL");
      }

      return { success: true, url: session.url };
    } catch (error) {
      console.error("PurchaseFlow.createCheckoutSession error:", error);
      return { success: false, reason: "stripe-error" };
    }
  },

  async fulfillOrder(
    portalId: string,
    email: string,
    amountTotal: number,
    appUrl: string,
    emailFrom: string
  ): Promise<FulfillOrderResult> {
    try {
      const [portal] = await db
        .select()
        .from(portals)
        .where(eq(portals.id, portalId))
        .limit(1);

      if (!portal) {
        console.error(`Portal with ID ${portalId} not found`);
        return { success: false, reason: "not-found" };
      }

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await db.insert(downloadSessions).values({
        id: token,
        portalId: portalId,
        email: email,
        amountInCents: amountTotal,
        expiresAt: expiresAt,
        createdAt: new Date(),
      });

      const downloadLink = `${appUrl}/download/${token}`;

      if (process.env.NODE_ENV === "development") {
        console.log(`\n=========================================`);
        console.log(`📦 PURCHASE SUCCESSFUL FOR: ${email}`);
        console.log(`👉 DOWNLOAD LINK: ${downloadLink}`);
        console.log(`=========================================\n`);
      }

      try {
        const { error: resendError, data: resendData } = await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: `Your document bundle ready: ${portal.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
              <h2 style="color: #0f172a; margin-bottom: 16px;">Thank you for your purchase!</h2>
              <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                You have successfully purchased the document bundle for <strong>${portal.name}</strong>.
              </p>
              <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Please click the secure button below to download your document bundle as a ZIP archive.
              </p>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${downloadLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                  Download Documents
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <strong>Important:</strong> This link is secure and will expire in <strong>48 hours</strong> (expires on ${expiresAt.toLocaleString()}). No account creation is required to access your files.
              </p>
            </div>
          `,
        });

        if (resendError) {
          console.error("Resend API rejected the email (possibly due to .vercel.app domain links or from address):", resendError);
        } else {
          console.log("Email successfully sent via Resend API. Data:", resendData);
        }
      } catch (emailErr) {
        console.error(
          "Failed to send email (check your domain settings), but download session was created:",
          emailErr
        );
      }

      return { success: true, token };
    } catch (err) {
      console.error("PurchaseFlow.fulfillOrder error:", err);
      return { success: false, reason: "db-error" };
    }
  },
};
