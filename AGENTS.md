# AGENTS.md

Guidance for AI agents working in this pnpm workspace. These conventions are the
baseline the starter provides; keep them intact as the project develops.

## Commands

Use `pnpm` for everything; `npm` and `yarn` are not supported.

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Rebuild all packages on change |
| `pnpm build` | Build every publishable package and validate it |
| `pnpm test` / `pnpm test --run` | Run Vitest projects in watch mode / once |
| `pnpm test --project @repo/core` | Run one package's tests |
| `pnpm coverage` | Run tests with aggregated V8 coverage |
| `pnpm lint` | Lint the whole workspace |
| `pnpm typecheck` | Typecheck root configs and every package |
| `pnpm spell` | Spell-check the repository |
| `pnpm commit` | Create a Conventional Commit interactively |
| `pnpm changeset` | Record a release note for changed packages |
| `pnpm version-packages` | Apply pending changesets |
| `pnpm release` | Build and publish packages through Changesets |
| `pnpm --filter <pkg> build` | Build one package |

Before handing work back, run `pnpm lint`, `pnpm typecheck`, and `pnpm test --run`.
Also run `pnpm build` when a package's public API or build output changes, and add a
changeset with `pnpm changeset` when a publishable package changes.

## Project Conventions

### Workspace layout

- The repository root is **private** and is never published. Publishable packages live
  under `packages/*`; private apps and examples live under `examples/*`.
- Every publishable package is self-contained: its own `package.json`, `src/`, `test/`,
  `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts`, `dist/`, and changelog.
- Add a package by copying the shape of `packages/utils`; reuse `tooling/tsdown.base.ts`
  and `tooling/vitest.shared.ts` rather than duplicating build or test policy.
- Import other workspace packages through their public entry (for example
  `@repo/utils`). Never deep-import another package's `src/` files.

### Package management

- Use `pnpm` only. Shared dev tool versions live in catalogs in `pnpm-workspace.yaml`;
  add a version to the matching catalog and reference it as `"catalog:<name>"` instead
  of hard-coding ranges in `package.json`.
- Internal dependencies always use `workspace:*`; pnpm rewrites them at publish time.
- Change `pnpm-lock.yaml` only through `pnpm`; never edit it by hand. CI installs with
  `--frozen-lockfile`.

### Module format and build

- Every package is **ESM-only** (`"type": "module"`), with `src/index.ts` as the single
  entry point emitted to `dist/index.js`. Add CommonJS only by explicitly enabling
  `format: ['esm', 'cjs']` in `tooling/tsdown.base.ts`.
- `dist/` is generated and git-ignored. Never edit or commit it.
- Treat `publint` and `attw` warnings as failures.
- Keep packages side-effect free (`"sideEffects": false`); avoid top-level side effects
  in exported modules.
- Workspace imports stay external through `deps.neverBundle: [/^@repo\//]`; do not
  inline another package's code into a build.

### TypeScript

- Shared compiler options live in `tsconfig.base.json`; each package extends it.
- `@repo/*` paths map to `packages/*/src/index.ts`. Keep the package directory name
  aligned with its package suffix so the wildcard keeps working.
- `strict` and `strictNullChecks` are enabled. Do not weaken compiler options or use
  `@ts-ignore`/`any` to silence errors; fix the types.
- Target `ESNext` with `Bundler` resolution. Prefer standard ESM and runtime-agnostic
  APIs.

### Linting and formatting

- ESLint flat config via `@antfu/eslint-config` handles both linting and formatting.
  Do not add Prettier or another formatter.
- Follow the existing style and let `eslint --fix`/`pnpm lint` format the code. Put
  rule overrides in `eslint.config.ts`, not inline disables.
- Respect the `sonarjs` and `slop` rules: keep functions focused and avoid low-value
  or redundant code.

### Testing

- Tests live in each package's `test/` directory and use Vitest, importing from
  `../src` for local code and the public entry for cross-package code.
- Add a test for every behavior change or bug fix.
- Keep tests deterministic and free of network or filesystem side effects.
- Coverage uses `@vitest/coverage-v8` and is configured at the root; do not lower
  thresholds or exclude real source files just to pass.

### Commits and hooks

- Use **Conventional Commits**: `<type>[optional scope]: <description>`. Valid types
  are `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, and
  `revert`. Keep subjects concise and do not end them with a period.
- Prefer `pnpm commit` (Commitizen); Commitlint enforces the format.
- Never bypass Husky (`--no-verify`). `pre-commit` runs lint-staged plus cspell on
  staged files; `commit-msg` runs Commitlint plus cspell.
- Stage intentionally. Do not commit secrets or generated files.

### Spelling

- cspell checks staged files and commit messages. Add legitimate project terms to
  `project-words.txt` instead of using inline ignore directives.
- Keep the `CHANGELOG.md` and `README.md` exclusions in `cspell.json` narrow.

### Releases and CI

- Releases are managed by Changesets from `main`. Run `pnpm changeset` for every
  publishable change. Never manually bump versions, edit package `CHANGELOG.md` files,
  tag, or publish; Changesets updates versions, internal dependency ranges, and
  changelogs.
- `pnpm version-packages` applies pending changesets; `pnpm release` builds and
  publishes. The release workflow runs them through `changesets/action`, but only when
  the repository variable `ENABLE_RELEASE` is `true`. Never enable it while package
  names still use the `@repo` placeholder scope.
- CI (`.github/workflows/build-typecheck-test.yml`) runs install, lint, typecheck,
  tests, and build on pushes and pull requests to `main`. Do not skip or weaken steps;
  fix the underlying failure.

### Layout and configuration

- `packages/*/src/` is package source, `packages/*/test/` holds tests, and `dist/` is
  generated output. `tooling/` holds shared build and test policy.
- Configuration belongs in the existing dedicated config files. Avoid ad-hoc configs
  or scripts when a supported option already exists.
