import type { UserConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

/**
 * Shared build policy for every publishable package.
 * Package-local `tsdown.config.ts` files import this so a filtered
 * `pnpm --filter <pkg> build` behaves exactly like the workspace build.
 */
export const libraryConfig: UserConfig = {
  entry: ['src/index.ts'],
  // ESM-only build.
  // To also ship CommonJS, add `format: ['esm', 'cjs']` here (emits `.cjs` + `.d.cts`).
  dts: true,
  exports: true,
  publint: true,
  attw: true,
  // Runtime-agnostic output without syntax down-leveling.
  // Use `platform: 'node'` for a Node-only library and an explicit
  // `target` (e.g. `target: 'node18'`) to support older runtimes.
  platform: 'neutral',
  target: 'esnext',
  deps: {
    // Workspace packages are separate releases; never inline their code.
    neverBundle: [/^@repo\//],
  },
  plugins: [
    StaleGuardRecorder(),
  ],
}
