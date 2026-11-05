# Markroot - Project Goal (`GOAL.md`)

## Vision

Build a modular, high-performance, and framework-agnostic content engine for managing and rendering documentation, blog posts, images, and other content from different sources.

Markroot separates content retrieval, metadata resolution, Markdown transformation, and rendering. Its core produces lightweight, serializable AST payloads that can be consumed by different web frameworks without coupling the engine to a specific content source, runtime, or UI framework.

## Primary Objectives

### 1. Content Providers

Provide a unified interface for retrieving content from different sources while keeping source-specific implementations independent.

**Initial providers:**

- `LocalFileSystemProvider`: Read files and list directories from the local filesystem.  
- `HttpContentProvider`: Retrieve content and assets from HTTP/HTTPS URLs.  
- `GitHubRawHttpContentProvider`: Retrieve raw files from GitHub repositories through HTTP. Reuse the HTTP retrieval subsystem while handling GitHub-specific URL resolution.

**Future providers:**

- `ObjectStorageProvider`: Retrieve content from S3, GCS, and similar object-storage services.  
- `GitHubContentProvider`: Retrieve and browse repository content through the GitHub API.

Providers should expose only capabilities supported by their underlying sources. Do not assume every provider supports directory listing or filesystem operations.

### 2. Navigation

Provide a unified mechanism for generating content navigation, such as documentation trees, blog listings, and site menus.

- For local filesystems, discover content by listing directories and files (also the navigation may be configured through a navigation manifest (another file like list.yaml).  
- For HTTP and GitHub Raw providers, retrieve a configured navigation manifest (for example, `list.yml`) through HTTP.  
- Parse the manifest to build the navigation tree without requiring remote directory enumeration.  
- Keep the navigation format independent of the content provider.  
- Allow navigation configuration to specify document paths, titles, ordering, and hierarchy.

The navigation manifest is a regular content file retrieved through the configured provider.

### 3. Metadata & Configuration Cascade

Resolve document context by traversing its logical directory hierarchy.

- Support global configuration and directory-level files such as `_config.json` and `_dir.yml`.  
- Deep-merge global defaults, ancestor configurations, and document frontmatter.  
- Allow child configurations and document frontmatter to override parent defaults.  
- Support scoped variables such as image base URLs and asset paths.

Configuration resolution must work consistently across different content providers.

### 4. Markdown Transformation

Transform Markdown and MDC into lightweight, JSON-serializable AST payloads.

- Use `comark` for Markdown and MDC parsing.  
- Extract frontmatter and integrate resolved metadata.  
- Use compact array-based AST structures (`[tag, attrs, ...children]`).  
- Support optional features such as Shiki syntax highlighting, KaTeX, and table-of-contents generation.  
- Support streaming and graceful handling of incomplete markup where possible.

### 5. API & Framework Rendering

Expose compiled content through lightweight, framework-independent APIs.

- Document endpoint: `GET /api/content/doc/*path`  
- Navigation endpoint: `GET /api/content/navigation/*path`  
- Asset endpoint: `GET /api/content/asset/*path`

Provide rendering adapters for different UI environments:

- `@markroot/html`  
- `@markroot/vue`  
- `@markroot/react`

Allow developers to register custom MDC components and map them to framework-specific implementations.

---

## Architectural Constraints

1. **Source independence:** Content processing must not depend on a specific provider.  
2. **Capability-based providers:** Directory listing and other source-specific operations must be optional capabilities, not mandatory requirements.  
3. **Separation of concerns:** Content retrieval, caching, navigation, metadata resolution, transformation, API handling, and rendering must remain separate.  
4. **Runtime independence:** Core processing must not depend on frontend frameworks or Node.js-specific APIs. Runtime-specific integrations, such as local filesystem access, must remain isolated.  
5. **Compact AST:** Compiled AST payloads must remain lightweight and JSON-serializable.  
6. **Testability:** Each provider and processing layer must have a clear interface, isolated implementation, and independently testable behavior.

`unstorage` is the storage engine behind the content providers. The public `ContentProvider` interface remains Markroot's own small abstraction, and it must be adaptable from any unstorage `Storage` (`fromStorage`) so unstorage-supported sources work without new provider code. Unstorage types must not leak into the rest of the public API.

---

## **Incremental Implementation Plan** (to be more investigated before implementation)

### Phase 1: Content Providers

**Goal:** Implement a thin `ContentProvider` abstraction on top of unstorage, plus the three initial providers and caching.

**Module:** `@markroot/core/content` (runtime-neutral) and `@markroot/core/content/node` (Node-only `LocalFileSystemProvider`).

**Design summary:**

- `ContentProvider`: `id`, `capabilities`, `read(path)`, optional `list(path)` and `stat(path)`, with guards such as `canList(provider)`.
- `read()` returns `{ kind: 'text', path, content, meta? }`, or `null` if not found. Other failures throw `ContentError` with a code (`FORBIDDEN_PATH`, `INVALID_PATH`, `NETWORK`, `HTTP_STATUS`, `UNSUPPORTED`). Binary (`kind: 'binary'`) is reserved for a later phase.
- Providers are built on unstorage drivers: `fs`, `http`, and a custom `githubRaw` driver.
- `fromStorage(storage)` adapts any unstorage `Storage` to a `ContentProvider`.
- `withCache(provider, { storage, ttl })` adds caching as a decorator, keyed by provider id and normalized path, including short negative caching for not-found results.
- Paths are logical, root-relative, posix paths. Leading slashes are stripped; escaping the root (`..`) and null bytes are rejected.
- `GitHubRawHttpContentProvider` resolves `https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{basePath}/{path}`, with an optional token and injectable `baseURL` and `fetch`. It has no directory listing.

**Tasks:**

1. Add `unstorage`, `pathe`, and `ufo` to the catalogs and `@repo/core`. Set up multi-entry tsdown and `exports` for `./content` and `./content/node`.
2. Define `ContentProvider`, result types, capability flags and guards, and `ContentError` codes.
3. Implement path normalization with `pathe` and URL resolution with `ufo`, plus minimal validation: strip leading slashes, reject paths that escape the root after normalization (`..`) and null bytes. No further sanitization.
4. Implement `fromStorage` with a shared provider contract test suite.
5. Implement `LocalFileSystemProvider` (unstorage `fs` driver; read, list, stat) in the Node subpath.
6. Implement `HttpContentProvider` (unstorage `http` driver; injectable fetch, headers, and baseURL; read only).
7. Implement the `githubRaw` unstorage driver, then `GitHubRawHttpContentProvider` through `fromStorage`.
8. Implement `withCache` (unstorage-backed, TTL, negative caching).
9. Write tests: the contract suite for all providers, traversal and invalid paths, not-found to `null`, error codes, URL resolution, capability guards, and cache hit, miss, and expiry. Tests use injected `fetch` and the unstorage memory driver, with no network access.
10. Add a changeset and run lint, typecheck, test, and build.

**Initial scope:** GitHub Raw retrieves known repository files only. GitHub API browsing, object storage, and binary content are deferred.

### Phase 2: Navigation 

**Goal:** Build navigation trees from local directories or remote navigation manifests.

1. Suggested module name: `@markroot/core/navigation` (to be more investigated before implementation)

**Tasks:**

2. Define a provider-independent navigation structure and manifest format.  
3. Implement local navigation discovery using filesystem directory listing.  
4. Implement manifest retrieval for HTTP sources using a configured file path, such as `list.yml`.  
5. Use the same mechanism for `HttpContentProvider` and `GitHubRawHttpContentProvider`.  
6. Parse manifests into a normalized navigation tree.  
7. Support titles, ordering, hierarchy, and document references.  
8. Write tests for local discovery, manifest parsing, missing files, invalid manifests, and HTTP retrieval.

### Phase 3: Metadata Cascade 

**Goal:** Resolve document configuration and frontmatter into a unified context.

1. Suggested module name: `@markroot/core/cascade` (to be more investigated before implementation)

**Tasks:**

2. Implement logical directory ancestor resolution.  
3. Retrieve `_config.json` and `_dir.yml` files from the active provider.  
4. Deep-merge global, directory-level, and document configurations.  
5. Implement scoped variable expansion.  
6. Write tests for inheritance, overrides, missing configuration files, and variable interpolation.

### Phase 4: Markdown Transformer 

**Goal:** Transform Markdown and MDC into compact AST payloads.

1. Suggested module name: `@markroot/core/transformer` (to be more investigated before implementation)

**Tasks:**

2. Integrate `comark`.  
3. Implement frontmatter extraction.  
4. Connect metadata cascade results to document transformation.  
5. Add optional syntax highlighting, mathematical rendering, and table-of-contents generation.  
6. Support incomplete markup handling for streaming scenarios where possible.  
7. Write tests for parsing, metadata integration, AST output, and transformation options.

### Phase 5: API & Framework Adapters

**Goal:** Expose content processing through APIs and provide framework-specific rendering.

**Tasks:**

1. Implement framework-independent HTTP route handlers using a lightweight router such as `h3`.  
2. Implement document, navigation, and asset endpoints.  
3. Add caching based on content, resolved configuration, and transformation options.  
4. Implement `@markroot/html` for HTML generation and SSR.  
5. Implement `@markroot/vue` using `@comark/vue`.  
6. Implement `@markroot/react` using `@comark/react`.  
7. Add custom MDC component registration.  
8. Build a Nuxt module for automatic component registration and API integration.  
9. Write integration and end-to-end tests.

---

## Future Extensions

The initial implementation should make the following additions possible without redesigning the core architecture:

- **Object Storage Provider:** Reading, writing, listing, and retrieving metadata from S3, GCS, and similar services.  
- **GitHub API Provider:** Repository browsing, directory listing, file retrieval, and authenticated private repository access.  
- **Additional Rendering Adapters:** Support for other frameworks such as Svelte.

These extensions should reuse the existing content-processing, navigation, metadata, and transformation layers.

