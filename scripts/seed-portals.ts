import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import 'dotenv/config'; // Make sure to load environment variables if any

const databaseUrl = process.env.DATABASE_URL || "file:sqlite.db";

const client = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("This script can only be run in non-production environments.");
    process.exit(1);
  }

  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address as an argument.");
    console.error("Usage: npx tsx scripts/seed-portals.ts <email>");
    process.exit(1);
  }
  
  // get user by email
  const [userRecord] = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);

  if (!userRecord) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Found user: ${userRecord.name} (${userRecord.id})`);

  const NUM_PORTALS = 15;

  for (let i = 1; i <= NUM_PORTALS; i++) {
    const newId = randomUUID();
    const name = `Test Portal ${i}`;
    const slug = `test-portal-${i}-${Date.now()}`;
    
    await db.insert(schema.portals).values({
      id: newId,
      userId: userRecord.id,
      name,
      slug,
      description: `This is a test portal number ${i}`,
      priceInCents: 1000 + i * 100, // starting at $11.00
      createdAt: new Date(),
    });
    console.log(`Created portal: ${name}`);
  }

  console.log(`Seeding complete! Successfully created ${NUM_PORTALS} portals.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed", err);
  process.exit(1);
});
