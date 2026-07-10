import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

const actualStripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-06-24.dahlia"
});

export const stripe = process.env.E2E_MOCK === "true" 
  ? new Proxy(actualStripe, {
      get(target, prop) {
        if (prop === "accounts") {
          return {
            retrieve: async () => ({ details_submitted: true }),
            createLoginLink: async () => ({ url: "https://mock-stripe.com/login" }),
            create: async () => ({ id: "acct_mock123" })
          };
        }
        if (prop === "v2") {
          return {
            core: {
              accounts: {
                create: async () => ({ id: "acct_mock123" })
              }
            }
          };
        }
        if (prop === "accountLinks") {
          return {
            create: async () => ({ url: "https://mock-stripe.com/connect" })
          };
        }
        if (prop === "checkout") {
          return {
            sessions: {
              create: async () => ({ url: "https://mock-stripe.com/checkout" })
            }
          };
        }
        return Reflect.get(target, prop);
      }
    }) as unknown as Stripe
  : actualStripe;
