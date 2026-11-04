import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { defineProject } from 'vitest/config'

const packagesDirectory = fileURLToPath(new URL('../packages/', import.meta.url))

/**
 * Resolve `@repo/<name>` to the package source entry so tests run without
 * requiring a prior build. Package boundaries still matter for published code:
 * builds keep workspace imports external.
 */
const workspaceSourceAlias: Plugin = {
  name: 'workspace-source-alias',
  enforce: 'pre',
  resolveId(id) {
    const match = /^@repo\/([^/]+)$/.exec(id)
    if (match)
      return `${packagesDirectory}${match[1]}/src/index.ts`
  },
}

export default defineProject({
  plugins: [workspaceSourceAlias],
})
