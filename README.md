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

The compiler is pinned to published ec7990f plus the active, validated #1867 patch in [the patch series](patches/rust-js/README.md). Earlier Intl/model, optional-argument, harness and inheritance fixes are upstream. Setup reconstructs exactly the compiler source tree that passed the complete local gate and is checked for idempotence. The new patch remains until upstream review and adoption.

The complete scrollbar module now preserves the original function bodies and has native, differential, strict-type and Chromium coverage. Current checks pass 21 native tests, 20 compiled invariants and strict Clippy. The complete reference/type suite reports 68 passes and six retained failures; the two targeted scrollbar Chromium cases pass. The latest complete Chromium suite has not been rerun. Exact scopes, compiler-gate results and all 18 caught owner mutations are in [the validation evidence](docs/validation.md).

The six reference/type failures remain visible around required optional-value contracts, numeric union membership and the pending generic closest API. This checkpoint does not complete milestone one.
