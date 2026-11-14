# vercel-ui-sdk-in-rust

A Rust/rust-js port of [UI SDK](https://github.com/vercel-labs/ui), a library of composable interface behaviors. Apache-2.0 licensed, with upstream attribution retained.

**Status: development snapshot. The full SDK builds; the flattened-copy regression is fixed. Four reference tests still expose unresolved compiler boundary/type gaps. The Intl compiler patch remains held for P0 #1840. Core, Web Components and the documentation deployment are not complete.**

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

Numeric grids, keyboard mapping, calendar arithmetic, layout measurement, environment detection, change-source propagation and the earlier motion/history foundations now build together. Local validation passes 20 native Rust tests, 19 compiled invariants and 16 Playwright Chromium tests. Full reference validation reports 53 passing tests and four retained failures for required undefined-valued arguments/properties (#1845) and membership-based union checks (#1846). Calendar type predicates and root type reexports are fixed and adopted. The independent compiler mutation harness passed its full check; upstream landing is pending. See [validation evidence](docs/validation.md). This is not a release.
