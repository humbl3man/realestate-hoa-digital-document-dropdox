import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export default async function globalSetup() {
  const dbPath = path.join(process.cwd(), 'e2e-test.db');
  
  // Remove existing test db if it exists
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch (error) {
      // Silently ignore EBUSY on Windows
    }
  }

  console.log('Pushing database schema to test db...');
  execSync('npx drizzle-kit push', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'file:e2e-test.db',
    },
  });
}
