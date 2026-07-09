const { createClient } = require("@libsql/client");
const path = require("path");

const client = createClient({
  url: "file:" + path.join(__dirname, "..", "sqlite.db"),
});

async function run() {
  console.log("Clearing old stripeAccountId from all users...");
  await client.execute("UPDATE user SET stripe_account_id = NULL;");
  console.log("Done! You can now connect Stripe cleanly.");
}

run().catch(console.error);
