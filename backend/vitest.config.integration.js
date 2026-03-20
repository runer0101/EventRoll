import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.test.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Los tests de integración deben correr en serie para evitar conflictos en BD
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
})
