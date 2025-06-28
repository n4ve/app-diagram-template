import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      include: ['src/**/*.ts', 'src/**/*.js'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})