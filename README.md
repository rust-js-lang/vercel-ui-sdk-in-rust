# vercel-ui-sdk-in-rust

A Rust/rust-js port of [UI SDK](https://github.com/vercel-labs/ui), a library of composable interface behaviors. Apache-2.0 licensed, with upstream attribution retained.

**Status: development snapshot. The linked SDK builds. Five reference failures and one browser failure retain compiler boundary/type gaps and the missing optional closest call. Intl remains held for P0 #1840. Core, Web Components and the documentation deployment are incomplete.**

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

Numeric grids, keyboard mapping, calendar arithmetic, layout/environment helpers, shared platform support and the earlier motion/history foundations build together. Local validation passes 20 native tests, 19 compiled invariants and strict Clippy. The full reference suite reports61 pass / 5 fail; Chromium reports20 pass / 1 fail. Complete platform export parity and optional-method browser behavior remain red under #1859; required boundary semantics and union membership remain under #1845/#1846. The published compiler mutation harness is adopted; three of its ten feature-owner preparations are currently inconclusive under #1861. See [validation evidence](docs/validation.md). This is not a release.

The current compiler review checkpoint retains the diagnosed #1861 fix separately, with focused tests passing and whole-suite comparison still pending. See [the investigation](docs/mutation-preparation-1861.md); full-suite and performance results are pending.
