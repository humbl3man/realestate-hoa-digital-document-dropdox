import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
