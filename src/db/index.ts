import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "file:sqlite.db";

const client = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
