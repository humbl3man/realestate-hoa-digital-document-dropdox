require("dotenv").config({ path: ".env" });
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkAccounts() {
  try {
    const accounts = await stripe.accounts.list({ limit: 5 });
    
    if (accounts.data.length === 0) {
      console.log("No connected accounts found.");
      return;
    }

    console.log(`Found ${accounts.data.length} connected accounts:\n`);
    
    accounts.data.forEach(account => {
      console.log(`Account ID: ${account.id}`);
      console.log(`Email: ${account.email}`);
      console.log(`Type: ${account.type}`);
      console.log(`Details Submitted: ${account.details_submitted}`);
      console.log(`Charges Enabled: ${account.charges_enabled}`);
      console.log(`Capabilities:`, JSON.stringify(account.capabilities, null, 2));
      console.log(`Requirements:`, JSON.stringify(account.requirements, null, 2));
      console.log("--------------------------------------------------");
    });
  } catch (err) {
    console.error("Error fetching accounts:", err.message);
  }
}

checkAccounts();
