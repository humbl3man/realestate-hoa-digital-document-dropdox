const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Read .env file securely
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");

// Extract the STRIPE_SECRET_KEY
const match = envContent.match(/STRIPE_SECRET_KEY=(.*)/);
if (!match || !match[1]) {
  console.error("Could not find STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const secretKey = match[1].trim();

// Spawn the stripe CLI using the extracted key
const stripeArgs = [
  "listen",
  "--api-key",
  secretKey,
  "--forward-to",
  "localhost:3000/api/webhook/stripe",
  "--forward-connect-to",
  "localhost:3000/api/webhook/stripe-connect"
];

console.log("Starting Stripe CLI with key from .env...");

const child = spawn("stripe", stripeArgs, { stdio: "inherit", shell: true });

child.on("exit", (code) => {
  process.exit(code);
});
