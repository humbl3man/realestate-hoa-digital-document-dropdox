import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db";
import { Resend } from "resend";
import { appConfig } from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [
    magicLink({
      expiresIn: 900, // 900s = 15 minutes
      sendMagicLink: async ({ email, url }) => {
        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        
        // Log the link to the terminal in development so you can log in locally without checking email
        if (process.env.NODE_ENV === "development") {
          console.log(`\n=========================================`);
          console.log(`🔑 MAGIC LINK FOR \${email}:`);
          console.log(`👉 \${url}`);
          console.log(`=========================================\n`);
        }

        try {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Sign in to your ${appConfig.name} Dashboard`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  @media (prefers-color-scheme: dark) {
                    .body-bg { background-color: #000000 !important; }
                    .card-bg { background-color: #111827 !important; border-color: #374151 !important; }
                    .text-primary { color: #f9fafb !important; }
                    .text-secondary { color: #9ca3af !important; }
                  }
                </style>
              </head>
              <body class="body-bg" style="margin: 0; padding: 0; background-color: #ffffff;">
                <div class="text-primary" style="font-family: 'SF Pro Text', 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111827;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
                    <img src="https://tetherdocs.app/logo.png" alt="Tether Docs Logo" width="32" height="32" style="border-radius: 8px;" />
                    <span class="text-primary" style="font-weight: 600; font-size: 18px; color: #111827;">\${appConfig.name}</span>
                  </div>
                  
                  <div class="card-bg" style="background-color: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h2 class="text-primary" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Sign in to your dashboard</h2>
                    
                    <p class="text-secondary" style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      Click the secure link below to sign in to your account.
                    </p>
                    
                    <a 
                      href="\${url}" 
                      style="
                        display: inline-block; 
                        padding: 12px 24px; 
                        background-color: #1e3a8a; 
                        color: #ffffff; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 14px;
                      "
                    >
                      Sign In Securely
                    </a>
                    
                    <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af;">
                      This link will expire in 15 minutes for security.
                    </p>
                  </div>

                  <p class="text-secondary" style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </body>
              </html>
            `,
          });
        } catch (err) {
          console.error("Failed to send email via Resend:", err);
        }
      },
    }),
  ],
});

if (process.env.E2E_MOCK === "true") {
  const originalGetSession = auth.api.getSession;
  // @ts-expect-error — intentional E2E mock override; signature doesn't match strict API type
  auth.api.getSession = async (opts: any) => {
    const reqHeaders = await opts?.headers;
    const cookieHeader = reqHeaders?.get("cookie") || "";
    if (cookieHeader.includes("better-auth.session_token=test-session-token-123")) {
      return {
        session: { id: "test-session-id", userId: "test-user-id", expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), createdAt: new Date(), updatedAt: new Date(), token: "test-session-token-123" },
        user: { id: "test-user-id", email: "e2e-test@example.com", name: "E2E Test User", emailVerified: true, stripeAccountId: "acct_mock123", createdAt: new Date(), updatedAt: new Date() }
      } as any;
    }
    return originalGetSession(opts);
  };
}
