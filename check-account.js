const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkAccount() {
  const args = process.argv.slice(2);
  const accountId = args[0];
  
  if (!accountId) {
    console.error("Please provide an account ID");
    return;
  }
  
  try {
    const account = await stripe.accounts.retrieve(accountId);
    console.log("Account:", account.id);
    console.log("Charges enabled:", account.charges_enabled);
    console.log("Details submitted:", account.details_submitted);
    console.log("Capabilities:", JSON.stringify(account.capabilities, null, 2));
    console.log("Requirements:", JSON.stringify(account.requirements, null, 2));
  } catch (err) {
    console.error("Error fetching account:", err.message);
  }
}

checkAccount();
