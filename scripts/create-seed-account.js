const { createClient } = require("@libsql/client");
const path = require("path");
const crypto = require("crypto");

const client = createClient({
  url: "file:" + path.join(__dirname, "..", "sqlite.db"),
});

async function run() {
  const email = "testaccount@example.com";
  const name = "Test Account";
  const stripeAccountId = "acct_1Tr8cj0R3KIS12y4";
  
  // Generate a UUID for the user ID (better-auth standard)
  const userId = crypto.randomUUID();
  const now = Date.now();

  console.log(`Checking if user ${email} exists...`);
  
  const existingUser = await client.execute({
    sql: "SELECT * FROM user WHERE email = ?",
    args: [email]
  });

  if (existingUser.rows.length > 0) {
    console.log(`User already exists. Updating their stripe_account_id to ${stripeAccountId}...`);
    await client.execute({
      sql: "UPDATE user SET stripe_account_id = ?, updated_at = ? WHERE email = ?",
      args: [stripeAccountId, now, email]
    });
  } else {
    console.log(`Creating new seed user with email ${email}...`);
    await client.execute({
      sql: `INSERT INTO user (id, name, email, email_verified, stripe_account_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, name, email, 1, stripeAccountId, now, now]
    });
  }

  console.log("===================================");
  console.log("Seed account successfully created!");
  console.log("Email:", email);
  console.log("Stripe Account ID:", stripeAccountId);
  console.log("===================================");
  console.log("You can now login with this email using the terminal magic link.");
}

run().catch(console.error);
