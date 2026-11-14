# vercel-ui-sdk-in-rust

A Rust/rust-js port of [UI SDK](https://github.com/vercel-labs/ui), a library of composable interface behaviors. Apache-2.0 licensed, with upstream attribution retained.

**Status: development snapshot. The linked SDK builds. The last complete SDK run retains five reference failures and one browser failure; a separate new generic closest contract also remains failing. The upstream P0 #1840 fix is adopted and its unchanged regression passes; Intl/model landing is under review. Core, Web Components and the documentation deployment are incomplete.**

The first milestone ports `@ui-sdk/core` and `@ui-sdk/web`, including their accessibility, lifecycle and agent-facing contracts. The documentation application and executable examples will be written in Rust/rust-js and deployed to GitHub Pages. The SDK React adapter follows after this milestone. Vue, Svelte, Solid and other framework adapters are future work.

Rust owns behavior. The pinned rust-js submodule compiles browser code to JavaScript. Original Markdown, CSS and media may remain content/assets; upstream application TypeScript must not become the production implementation behind a Rust wrapper.

See [architecture](docs/architecture.md), [implementation plan](docs/implementation-plan.md), [upstream provenance](UPSTREAM.md) and the generated [source inventory](docs/upstream-inventory.json).

## Development

Use Bun, Rust and Git submodules. Clone with `--recurse-submodules`. Reference comparisons use a separate, read-only upstream checkout at `../vercel-ui`, or `UI_SDK_UPSTREAM_DIR`, at the exact revision in `upstream.json`.

```sh
bun run setup
bun run compile
bun run test:native
bun run test:compiled
bun run test
bun run test:browser
bun run clippy
bun run check:upstream
```

Numeric grids, keyboard mapping, calendar arithmetic, layout/environment helpers, shared platform support and the earlier motion/history foundations build together. Local validation passes 20 native tests, 19 compiled invariants and strict Clippy. The full reference suite reports61 pass / 5 fail; Chromium reports20 pass / 1 fail. Complete platform export parity and optional-method browser behavior remain red under #1859; required boundary semantics and union membership remain under #1845/#1846. The published compiler mutation harness is adopted; the #1861 fix now catches all ten feature-owner mutations at the original preparation bound. See [validation evidence](docs/validation.md). This is not a release.

The separate #1861 compiler review passes independent full before/after checks, preserving all 6,915 existing test outcomes and adding five passing tests; nine harness mutants are caught. The final one-second preparation bound passes the ordinary ten-owner workload. The harness is now landed upstream as fb2e59e74; the complete SDK milestone remains open. See [the investigation](docs/mutation-preparation-1861.md).

The compiler now adopts fb2e59e745aa80e276284c6c01325779333bda16, including the published nullish-boundary and harness fixes. The SDK build and focused P0/Intl/model checks pass (12 tests, 331 assertions). Complete SDK checks on this new pin await the upstream reviewer’s shared-machine validation window. The unsafe closest diagnostic probe was removed; [#1866](https://github.com/rust-js-lang/rust-js/issues/1866) tracks the generic declaration and binding design, with a separate failing strict consumer.

The published harness fix is adopted and its private patch removed. The reduced patch installer passes its idempotence check. The separate Intl feature has passed upstream review and is undergoing its full landing checks.
