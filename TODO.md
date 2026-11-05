# TODO - Phase 1: Content Providers

See `GOAL.md` (Phase 1) for the design.

- [ ] 1. Add `unstorage`, `pathe`, `ufo` to catalogs and `@repo/core`; multi-entry tsdown and `exports` for `./content` and `./content/node` (update the single-entry note in `AGENTS.md`)
- [ ] 2. Define `ContentProvider`, result types, capability flags and guards, `ContentError` codes
- [ ] 3. Path normalization with `pathe`, URL resolution with `ufo`, minimal validation only (strip leading slashes, reject `..` root escape and null bytes)
- [ ] 4. `fromStorage` adapter plus shared provider contract test suite
- [ ] 5. `LocalFileSystemProvider` (fs driver; read, list, stat) in `content/node`
- [ ] 6. `HttpContentProvider` (http driver; injectable fetch, headers, baseURL; read only)
- [ ] 7. `githubRaw` unstorage driver, then `GitHubRawHttpContentProvider` via `fromStorage`
- [ ] 8. `withCache` decorator (unstorage-backed, TTL, negative caching)
- [ ] 9. Tests: contract suite, traversal and invalid paths, not-found to `null`, error codes, URL resolution, capability guards, cache behavior (no network)
- [ ] 10. Changeset; run `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm build`
