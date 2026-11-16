import { defineConfig } from 'vitest/config'

// Tests d'Astror Video Studio (Node, sans DOM). `npm run video:test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['video/tests/**/*.test.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
  },
})
