# ts-monorepo-starter-kit

A modern, batteries-included starter for TypeScript monorepos. It uses pnpm
workspaces for package management, an ESM-first [tsdown](https://tsdown.dev) workspace
build, a zero-config linting stack, Vitest across all projects, Conventional Commits,
and automated releases with [Changesets](https://changesets.dev) - with no Prettier
required.

## What's inside

- **Workspaces** - publishable packages in `packages/*`, private consumers in `examples/*`.
- **Build** - tsdown workspace mode with declaration files, generated `exports`,
  `publint` + `arethetypeswrong` validation, and stale-build tracking per package.
- **Code quality** - one ESLint flat config via `@antfu/eslint-config` (formatting
  included) and strict TypeScript.
- **Testing** - Vitest projects across every package, with aggregated V8 coverage.
- **Commits** - Commitizen prompts, Commitlint rules, Husky hooks, and lint-staged.
- **Release** - Changesets for independent package versions, per-package changelogs,
  and publishing.
- **CSpell** - spell checking for source files and commit messages.
- **Extras** - pnpm dependency catalogs, CI and release workflows, and shared VS Code
  settings.

## Quick start

Requires Node.js LTS and [pnpm](https://pnpm.io) - pnpm is required because the
workspace and dependency catalogs are managed with it.

```bash
# Use GitHub's "Use this template" button, or clone the repo
pnpm install
```

Before publishing, pick your own npm scope. The starter uses `@repo/*` as a
placeholder. Rename it consistently in:

- each `packages/*/package.json` `name`
- internal `dependencies` that use `workspace:*`
- `tsconfig.base.json` `compilerOptions.paths`
- `tooling/vitest.shared.ts`
- `.changeset/config.json` `ignore`

Also update the root metadata in `package.json` (`name`, `description`, `author`,
`homepage`, `repository`, `bugs`, `keywords`) and each package's `description`.

## Project layout

```text
.
├── packages/
│   ├── core/                 # Publishable package (depends on @repo/utils)
│   │   ├── src/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsdown.config.ts
│   │   └── vitest.config.ts
│   └── utils/                # Publishable package with no internal dependencies
├── examples/
│   └── basic/                # Private consumer of the workspace packages
├── tooling/
│   ├── tsdown.base.ts        # Shared build policy
│   └── vitest.shared.ts      # Shared test policy and source aliases
├── .changeset/               # Changesets configuration and pending changesets
├── .github/workflows/        # CI and release workflows
├── .husky/                   # Git hooks
├── eslint.config.ts          # ESLint flat config
├── tsconfig.base.json        # Shared compiler options and workspace paths
├── tsconfig.json             # Root config-only project
├── tsdown.config.ts          # tsdown workspace entry point
├── vitest.config.ts          # Vitest projects and coverage
├── commitlint.config.ts      # Commit message rules
├── cspell.json               # Spell-check config
└── pnpm-workspace.yaml       # Workspace packages and dependency catalogs
```

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Rebuild all packages on change |
| `pnpm build` | Build all publishable packages into their `dist/` |
| `pnpm test` | Run all Vitest projects in watch mode |
| `pnpm test --run` | Run the test suite once |
| `pnpm test --project @repo/core` | Run one package's tests |
| `pnpm coverage` | Run tests with aggregated V8 coverage |
| `pnpm lint` | Lint the whole workspace with ESLint |
| `pnpm typecheck` | Typecheck the root configs and every package |
| `pnpm spell` | Spell-check the repository |
| `pnpm commit` | Create a Conventional Commit interactively |
| `pnpm changeset` | Record a release note for changed packages |
| `pnpm version-packages` | Apply pending changesets (versions + changelogs) |
| `pnpm release` | Build and publish packages through Changesets |

Filter any package command with pnpm:

```bash
pnpm --filter @repo/core build
pnpm --filter @repo/core test
pnpm --filter @repo/core... build   # core and its workspace dependencies
```

## Packages and internal dependencies

Only `packages/*` are publishable. Private apps belong in `examples/*` (or another
glob you add to `pnpm-workspace.yaml`) and must not be published.

Internal dependencies always use the workspace protocol:

```json
{
  "dependencies": {
    "@repo/utils": "workspace:*"
  }
}
```

pnpm rewrites `workspace:*` to the real version at publish time. Cross-package code
imports the public entry (`@repo/core`), never another package's `src/`.

### Adding a package

1. Create `packages/<name>/` with `src/index.ts`, `test/`, `package.json`,
   `tsconfig.json`, `tsdown.config.ts`, and `vitest.config.ts`.
2. Copy the shape of `packages/utils`, then rename the package and adjust `description`.
3. Reuse the shared configs from `../../tooling` and the `catalog:*` versions.
4. Run `pnpm install` and `pnpm changeset`.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, and `pnpm build`.

`tsconfig.base.json` maps `@repo/*` to `packages/*/src/index.ts`, so a new package is
picked up automatically as long as its directory name matches its package suffix.

## Build

`pnpm build` runs `tsdown`, which reads `workspace: ['packages/*']` from
`tsdown.config.ts` and loads every package config in `packages/*`. Shared options live in `tooling/tsdown.base.ts`; each package has a thin
`tsdown.config.ts` so filtered builds behave identically.

Every package is **ESM-only** by default. The build emits `dist/index.js` and
`dist/index.d.ts`, regenerates the `exports` field, and runs `publint` and `attw`.
Workspace imports are kept external (`deps.neverBundle: [/^@repo\//]`) so each
package ships separately.

To also ship CommonJS, add `format: ['esm', 'cjs']` to the shared config. The build
then emits `.cjs` and `.d.cts` outputs and updates `exports` accordingly. The config
uses `platform: 'neutral'` and `target: 'esnext'`; switch to `platform: 'node'` and an
explicit `target` (e.g. `node18`) for a Node-only library that supports older runtimes.

## Typechecking and testing

Each package extends `tsconfig.base.json` and owns a `tsc --noEmit` script. The root
`pnpm typecheck` runs the root config project first, then every package.

Vitest uses projects:

```ts
// vitest.config.ts
projects: [
  'packages/*/vitest.config.ts',
  'examples/*/vitest.config.ts',
]
```

Package tests use the shared config in `tooling/vitest.shared.ts`, which resolves
`@repo/*` to package source so tests do not require a prior build. Coverage is
configured once at the root and aggregates all projects.

## Dependency catalogs

Dev dependency versions are centralized in `pnpm-workspace.yaml` using named catalogs
(`build`, `commit`, `lint`, `release`, `test`, `types`). Reference them in
`package.json` instead of repeating versions:

```yaml
catalogs:
  test:
    vitest: ^5.0.5
```

```json
{
  "devDependencies": {
    "vitest": "catalog:test"
  }
}
```

## Commits and hooks

Stage your changes, then use Commitizen instead of `git commit`:

```bash
git add .
pnpm commit
```

Husky enforces quality before a commit lands:

- **pre-commit** - runs lint-staged on staged code files, then cspell on all staged files.
- **commit-msg** - validates the message with Commitlint and spell-checks it with cspell.

Rules live in `commitlint.config.ts` and extend `@commitlint/config-conventional`.

## Release

Releases are managed by Changesets and are opt-in for the starter template. Before
enabling them, rename the `@repo` scope, add an `NPM_TOKEN` repository secret, and set
the repository variable `ENABLE_RELEASE` to `true`. Until then, the release workflow
is skipped so placeholder packages are never published.

1. Run `pnpm changeset` and commit the generated Markdown file with your change.
2. Push to `main`. The release workflow opens or updates a version PR.
3. Merge the version PR. The workflow runs `pnpm release`, which builds all packages
   and publishes the changed ones.

Never bump package versions, edit package `CHANGELOG.md` files, tag, or publish by
hand. Changesets updates internal `workspace:*` ranges and generates per-package
changelogs.

## CI

`.github/workflows/build-typecheck-test.yml` runs install, lint, typecheck, tests, and
build on every push and pull request targeting `main`.
`.github/workflows/release.yml` runs the Changesets release flow on `main`, gated by
the `ENABLE_RELEASE` repository variable.

## License

[MIT](./LICENSE)
