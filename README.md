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
cargo fmt --package ui-sdk-core-in-rust -- --check
bun run check:upstream
```

The compiler is pinned to published bc26493 plus the validated #1899 patch in [the patch series](patches/rust-js/README.md). The #1867 fix is now upstream and its duplicate patch is retired. The new patch keeps optional_call checked and adds an explicit unsafe optional_call_unchecked receiver boundary. Existing js::cast remains the sole unchecked assertion API. Setup is verified twice for idempotence.

The user-approved policy preserves upstream JavaScript behavior and marks unchecked Rust entry points unsafe. The complete local compiler gate passes in 403 seconds; all five affected mutations are caught. The generic selector preview compiles and passes six Chromium platform comparisons, but a complete source comparison exposes redundant null normalization (#1902). That unfinished port is retained only as a [review preview](patches/port-previews/1902-composed-closest.patch), outside the active compiler series.

The published SDK checkpoint reports 70 passes and 10 retained failures across 80 reference/type/source tests. New createDetails contracts expose its missing constructor and aliases; they do not replace them with handwritten JavaScript. Original runtime and strict-type contracts pass. Exact scopes and remaining gaps are in [the validation evidence](docs/validation.md). Complete core, Web Components, documentation/examples and verified GitHub Pages remain required for milestone one.
