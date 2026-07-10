import { test as setup } from '@playwright/test';
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import * as fs from 'fs';
import * as path from 'path';

const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate', async ({ page, context }) => {
  // 1. Insert a user and a session directly into the DB.
  const client = createClient({ url: 'file:e2e-test.db' });
  const db = drizzle(client, { schema });
  
  const testUserId = 'test-user-id';
  const testSessionToken = 'test-session-token-123';
  
  // Clean up if it exists from previous run that failed to teardown
  await db.delete(schema.user).where(eq(schema.user.id, testUserId)).execute().catch(() => {});

  await db.insert(schema.user).values({
    id: testUserId,
    name: 'E2E Test User',
    email: 'e2e-test@example.com',
    emailVerified: true,
    stripeAccountId: 'acct_mock123',
  });

  await db.insert(schema.session).values({
    id: 'test-session-id',
    token: testSessionToken,
    userId: testUserId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Set the cookie.
  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: testSessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }
  ]);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  // Save storage state
  await context.storageState({ path: authFile });
});
