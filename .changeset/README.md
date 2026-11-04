# Changesets

This directory tracks release notes for the workspace packages.

Add a changeset whenever a published package changes:

```bash
pnpm changeset
```

Then commit the generated Markdown file with your code. On `main`, the release
workflow opens a version PR; merging it versions the affected packages, updates their
changelogs, and publishes them.

See the [Changesets documentation](https://changesets.dev) for details.
