# vercel-ui-sdk-in-rust

A Rust/rust-js port of [UI SDK](https://github.com/vercel-labs/ui), a library of composable interface behaviors. Apache-2.0 licensed, with upstream attribution retained.

**Status: development snapshot. The complete core, Web Components, Rust documentation application and GitHub Pages deployment remain unfinished. Known reference, browser and generic-API failures remain visible.**

Milestone one includes the complete @ui-sdk/core and @ui-sdk/web behavior, accessibility, lifecycle and agent-facing contracts, documentation and executable Web examples. The SDK React adapter follows; other frameworks are deferred.

Rust owns behavior. The pinned rust-js submodule compiles browser code to JavaScript. Original Markdown, CSS and media remain content/assets; original application TypeScript must not become the implementation behind a Rust wrapper.

See [architecture](docs/architecture.md), [implementation plan](docs/implementation-plan.md), [provenance](UPSTREAM.md) and [source inventory](docs/upstream-inventory.json).

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

The published compiler now includes the Intl/model feature, its ten source-owner mutations, the native optional-argument correction, the worker/queued-exit harness fix, and generic inheritance constraints. Their private implementation patches are removed; the application list in patches/rust-js/series.json is empty. The pending #1867 review artifact is excluded from setup.

The last complete SDK snapshot passed 20 native tests, 19 compiled invariants and strict Clippy, with 61 reference passes/5 failures and 20 Chromium passes/1 failure. A separate closest generic contract remains failing while its native binding form is completed. These results retain their exact older source/pin in [validation evidence](docs/validation.md); they are not a full check of the latest compiler or unfinished scrollbar module.

The scrollbar port has targeted reference/type/browser proof but remains outside the published SDK pending the compiler source-fidelity fix in [#1867](https://github.com/rust-js-lang/rust-js/issues/1867). No source workaround or release completion is claimed.
