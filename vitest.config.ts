import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Vitest config. Tests run in a Node environment (the code under test reads the
 * filesystem and validates frontmatter - no DOM needed). The `@/` alias mirrors
 * tsconfig so imports resolve the same way as in the app.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    globals: false,
  },
})
