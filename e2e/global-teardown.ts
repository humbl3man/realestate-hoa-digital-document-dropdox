import * as fs from 'fs';
import * as path from 'path';

export default async function globalTeardown() {
  const dbPath = path.join(process.cwd(), 'e2e-test.db');
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log('Cleaned up test db.');
    } catch (error) {
      // Silently ignore EBUSY on Windows, as the Next.js web server might still hold a lock.
      // The db will be cleaned up on the next test run by global-setup.ts instead.
    }
  }
}
