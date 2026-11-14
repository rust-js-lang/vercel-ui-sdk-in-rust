# Validation checkpoint

2026-11-15. Milestone one remains incomplete. This is a development checkpoint, with known failing compiler regressions kept active. It is not a release. Web Components and the documentation site are not implemented or deployed yet.

Upstream remains pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, with its Apache-2.0 license retained verbatim. The private compiler submodule is published rust-js ca4ee7dfa2935c8fc06515fb20ae76d38ebabb56, unmodified. The root toolchain symlink uses its exact toolchain.

## Current proof

| Check | Current result |
| --- | --- |
| Rust/rust-js library build | passes |
| Native Rust invariants | 12 pass |
| Same invariants compiled to JS | blocked by #1816; the earlier verified subset's 8 tests passed |
| Bun reference/type/server tests | 20 pass, 2 fail; 198,576 assertions |
| Chromium reference tests | 10 pass |
| Strict rust-js-aware Clippy | passes with -D warnings |
| Rust formatting | passes |
| Source/export inventory | 2,611 pinned tracked files; check passes |

The two active Bun failures are the captured Math function regression (#1812) and lost native event declaration types (#1817). The compiled invariant test build refuses the undo settings union (#1816). Tests are neither skipped nor marked as expected failures. These failures must be fixed before the affected modules count as complete.

The verified motion/RTL foundation checkpoint remains 2c600f8. New scaling, release projection, undo and event modules are retained as work in progress, with source and tests available for compiler fixes.

## Numeric and history behavior

Exact reference comparisons use the pinned TypeScript functions and Object.is, preserving NaN and signed zero without a tolerance. Matrices cover exceptional bounds, extreme magnitudes, every spring damping regime, exact easing samples, release projection and snap selection. Native tests separately cover arithmetic invariants, spring rest/initial conditions, derivative consistency and history identity/reentrancy.

The undo stack passes 10,000 seeded edit traces against upstream, including live limits/delays, grouped edits, undo/redo branching, mapping, resetting and exact state identity. Additional tests check default clock/getter order, detached methods and callbacks that re-enter the stack. Its compiled invariant build and generated-output audit are still pending.

## Actual browser contracts

The local Playwright harness bundles the real upstream events.ts and the generated Rust events.js into separate modules and runs them in Chromium. The server verifies the upstream pin first. Browser tests compile Rust before starting and retain traces on failure; unexpected page errors fail tests.

The 10 passing cases cover native callback identity/receiver, capture phase, target/currentTarget, cancellation, repeated cleanup, once listeners, abort signals, mutation of the original options object, and fresh cancellable selection events.

Composition checks include real keyboard/input events, strict boolean/numeric values, direct/wrapped/inherited nativeEvent fields, proxy membership checks, getter order, short circuiting and errors. The generated isComposing body matches upstream's membership check and property comparisons. Its explicit canonical js::cast mirrors the upstream type assertion: an Event object may lack both optional composition fields. No custom cast binding or replacement event wrapper runs.

A separate server test imports both event modules with window, document and Event unavailable. Imports remain safe: native event construction happens only when called.

## Declaration proof

A single positive/negative TypeScript usage fixture is checked with the pinned TypeScript CLI. It passes against actual upstream source. Against generated declarations, three @ts-expect-error directives are unused: invalid native event names, nonexistent event properties and incorrectly typed capture options are accepted. This proves #1817 through real API usage, rather than only matching declaration text. Current emitted any types are a defect, not accepted API design.

## Compiler feedback

- [#1812](https://github.com/rust-js-lang/rust-js/issues/1812): borrowed Math function capture timing.
- [#1813](https://github.com/rust-js-lang/rust-js/issues/1813): native Number formatting binding contracts required for stepping.
- [#1814](https://github.com/rust-js-lang/rust-js/issues/1814): slice search output and proven bounds.
- [#1815](https://github.com/rust-js-lang/rust-js/issues/1815): private history borrow guards and index output.
- [#1816](https://github.com/rust-js-lang/rust-js/issues/1816): settings Rc union differs between library and test builds.
- [#1817](https://github.com/rust-js-lang/rust-js/issues/1817): browser option dictionaries and event associations lose their declaration types.

The compiler team owns these fixes through agent-hub. This project has no private compiler patch. No tests, Rust types, iterators or bindings are weakened to make the pending audits green. Numerical parity alone does not close generated-output or declaration audits.

The first cold compiler build took 1m50s; adopting ca4ee7d rebuilt it in 66 seconds, with later compiler checks around 0.3–0.7s. The full 10-case browser suite took approximately 1.3 seconds. Tests remain local; there is no deployment workflow or placeholder site presented as completion.

Complete core/kernel behavior, Web Components, all in-scope docs/examples, Pages setup and actual public deployment verification remain open under implementation-plan.md.
