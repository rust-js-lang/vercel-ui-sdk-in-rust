# Validation checkpoint

2026-11-15. Milestone one is incomplete. The current development snapshot is blocked from a full JavaScript build by compiler issue #1820. It is not a release. Core/Web Components and the docs application/deployment are still in progress.

Upstream is pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd. Its Apache-2.0 license and notices are retained. The private compiler submodule is published bf58789fab32a204d6f9483ed5478f9c238344f8, with no local patch; the toolchain symlink follows it.

## Current verification

| Gate | Evidence |
| --- | --- |
| Native Rust check | passes with the complete grid/snap source |
| Native Rust invariants | 14 pass |
| Strict rust-js-aware Clippy | passes with -D warnings |
| Rust formatting | passes |
| Pinned source/export inventory | 2,611 tracked files; passes |
| Full rust-js build | refused at five flattened StepRange borrowing sites, #1820 |
| Full compiled invariant suite | currently refused by #1820 |
| Full reference/type suite | stops at the build gate, #1820 |
| Browser suite | previously 10 pass; current full command stops at the build gate |

The test and browser commands compile Rust first. This prevents old generated files being mistaken for the new numeric implementation. The checked-in generated JavaScript is the last successful output; the new grid/snap functions have no verified generated artifact yet.

## Fixes verified in this project

The compiler feedback loop resolved two actual regressions without changing the app code:

- #1812, published as 059547d93 and included in this pin: borrowed logarithmic functions capture Math.log/Math.exp at module initialization. All four unchanged scaling tests passed (27,444 assertions). The generated table was inspected and now holds the functions directly.
- #1816, published as bfaa34073 and included here: undo tests no longer cause unrelated settings Rc values to become counted. All 12 original native invariants ran as JavaScript in Bun. After adding sheet physics, all 13 passed too. The subsequent full grid source exposed the independent #1820 refusal.
- #1813, published as bf58789fa: the canonical to_fixed/to_precision bindings accept Option<f64>. The full stepping source now type-checks in native Rust using them. JavaScript integration still awaits #1820; do not equate binding availability with a verified complete grid port.

## Work added

The complete numeric steps algorithm is written: exponent-aware precision, native decimal/significant-digit rounding, bounded grids, fractional/directional steps, large/small moves, point snapping and eased scrubbing. It reuses a flattened StepRange inside NumberRange and keeps natural derived Copy/Clone. The new numeric-grid.test.ts compares every operation against actual upstream, including native errors and the required own point property of unsnapped results. These new reference cases cannot run until the JavaScript build succeeds.

The numeric keyboard map is written in keys.rs but not linked from number/mod.rs. Its event must be the key/modifier record intersected with CompositionInput. Compiler #1818 currently refuses that flattening. Keeping it unlinked records unfinished work; it is not an implemented export or an alternate API. No wrapper, duplicate composition fields or manual clone is introduced to evade either refusal.

The shared sheet physics preset was built successfully before adding the blocked grid calls. Its JavaScript was compared with upstream: the complete object and all tuning values match, fields remain shared and mutable, and the stretch dimension retains number | null in declarations. Two Bun tests passed; a native/compiled integration invariant verifies its default spring settles monotonically without overshoot. Current native tests also prove the grid guard treats NaN steps as invalid while retaining signed zero.

A real TypeScript usage fixture verifies move directions are exactly -1 or 1, sizes/bounds use the declared literals, and physics fields retain numeric/boolean/nullability contracts. It passed against the last successful declarations. Declaration issue #1817 remains independently open for native event dictionaries and event associations.

## Earlier browser and history proof

The Chromium harness bundles actual upstream events.ts separately from generated Rust events.js. Its 10 cases passed for native listener identity/receiver, capture, target/currentTarget, cancellation, once/abort/cleanup, options-object mutation and fresh cancellable selection events. Composition cases cover real keyboard/input events, direct/wrapped/inherited nativeEvent fields, strict values, proxy membership checks, getter order, short circuiting and errors. Server import tests passed with window/document/Event absent.

Undo history passed 10,000 seeded reference traces for live settings, edit grouping, branching, map/reset and exact state identity, plus reentrant callbacks and clock/getter order. Projection and spring arithmetic matched the pinned original, including exceptional inputs and exact CSS easing samples. These earlier checks do not verify the new blocked grid code.

## Remaining compiler work

- #1814: release-projection search output and proven bounds.
- #1815: private undo borrow guards and index output.
- #1817: browser option dictionaries and event associations lose declaration types; the unchanged TypeScript fixture passes upstream and fails against generated any types.
- #1818: flatten the untagged composition-event union as an event intersection.
- #1819: the compiler team found a P0 flattened-reference aliasing bug while investigating #1818; it is ahead of the two flatten extensions.
- #1820: readonly lending of flattened Copy/Clone range records, preserving the correct projection for any actual clone/compare/hash.

The team owns these through agent-hub. Each has a concrete source reproduction. No tests or types are weakened, no helper bindings replace missing platform APIs, and no compiler workaround is presented as port completion. After the fixes land, rebuild, run the full numeric/reference/browser suites, inspect every generated diff and update the port map from actual evidence.

The complete kernel, behavior/component families, Web adapter/tags/events, in-scope docs/examples, Pages workflow/setup and public deployment verification remain required under implementation-plan.md. React remains the next SDK phase and other adapters remain deferred.
