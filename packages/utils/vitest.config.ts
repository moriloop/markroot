import { defineProject, mergeConfig } from 'vitest/config'
import sharedConfig from '../../tooling/vitest.shared.ts'

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: '@repo/utils',
    },
  }),
)
