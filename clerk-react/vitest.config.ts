import { defineConfig } from 'vitest/config';

// Vitest reads this in preference to vite.config.ts. The unit tests here are
// pure-logic (no DOM), so the lightweight `node` environment is enough.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
