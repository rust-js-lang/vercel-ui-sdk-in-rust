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

The compiler is pinned to published 9b14a06, including #1833, #1909, #1845, #1846 and #1899. The active compiler patch series is empty; the duplicate #1899 patch is retired. The SDK now preserves required ISO-date/RTL inputs, the required scrub point key even when undefined, and union membership without reading the bound getter.

Native Rust tests pass. The reference/type/source suite keeps the remaining failures visible, including missing createDetails/closest APIs and the newly isolated getter wrong answer #1908. The current reference suite reports 72 passes and nine failures. The complete current Chromium rerun reports22 passes and two known closest failures. Exact counts and scopes are in [the validation record](docs/validation.md).

The scope-guard fix and its callback prerequisite are now upstream and adopted; duplicate review/preview patches are retired. Required stack-overflow guards remain in the generated finally. The upgrade also exposes the native string-case boundary #1914; its Unicode regression remains red until genuine host-native bindings exist. The [builtin-generation proposal](docs/compiler-builtins-generation-proposal.md) is approved; implementation follows the correctness fixes and the stable-parser compatibility check.

Complete core, Web Components, documentation/examples and verified GitHub Pages remain required for milestone one.
