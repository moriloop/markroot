import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*/vitest.config.ts',
      'examples/*/vitest.config.ts',
    ],
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        '**/*.d.ts',
        '**/*.config.ts',
        'tooling/**',
        'examples/**',
      ],
    },
  },
})
