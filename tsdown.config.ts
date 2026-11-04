import { defineConfig } from 'tsdown'
import { libraryConfig } from './tooling/tsdown.base.ts'

export default defineConfig({
  ...libraryConfig,
  workspace: ['packages/*'],
})
