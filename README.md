# vercel-ui-sdk-in-rust

A Rust/rust-js port of [UI SDK](https://github.com/vercel-labs/ui), a library of composable interface behaviors. Apache-2.0 licensed, with upstream attribution retained.

**Status: development checkpoint with known failing compiler regressions. Core, Web Components and the documentation deployment are not complete.**

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

Clamping/wrapping, rubber-band resistance, analytic spring motion and RTL mapping have a verified checkpoint. Scaling, release projection, undo history and native event helpers are now in progress. Twelve native tests and ten Chromium tests pass. The reference/type suite has 20 passing tests and two active failures; compiled invariant tests are blocked by a reported compiler issue. These failures are retained so upstream fixes can be verified. This is not a release. See [validation evidence](docs/validation.md) for the current proof and remaining gates.
