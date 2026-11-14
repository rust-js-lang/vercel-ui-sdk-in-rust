# Validation checkpoint

2026-11-15. Milestone one is incomplete. The current development snapshot is blocked from a full JavaScript build by compiler issue #1820. It is not a release. Core/Web Components and the docs application/deployment are still in progress.

Upstream is pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd. Its Apache-2.0 license and notices are retained. The private compiler submodule is published 05949ee198208cc36b5599b41bc7b6f64f5d645f, plus the reproducible #1827 Ordering patch in patches/rust-js; the toolchain symlink follows it.

## Current verification

| Gate | Evidence |
| --- | --- |
| Native Rust check | passes with the complete grid/snap source |
| Native Rust invariants | 20 pass, including every day of a Gregorian 400-year cycle |
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

## Change-source checkpoint

The runtime portion of kernel/details.rs now ports ChangeSource, isDismissal, resolveSource and withSource. Five freshly compiled tests pass 1,135 comparisons/assertions against actual upstream: all source/reason/event combinations, lazy tracking, nested sources, return identity, exact thrown object identity and synchronous scope boundaries when a callback returns a promise. Native tests additionally prove unwinding restores the outer source. Strict Clippy passes.

This is not the whole details module. The full reason/event vocabulary, conditional detail types and createDetails remain to port. isDismissal's narrowing awaits #1828. Output inspection found the Rust scope guard emits a cleanup helper/catch/rethrow rather than the original nonthrowing try/finally; #1833 tracks extending the existing effect/drop owner. The Rust source is not reshaped to evade it.

## Published projection bounds fix

Compiler 05949ee removes the proven index checks and wrapped arithmetic from the exact nearestIndex source. A fresh source-hashed probe passes all 63,029 upstream comparisons. The other #1814 output remains entries().drop(1), $position/$rposition/$iter, so the source/output audit remains pending. The main SDK still cannot compile through #1820.

## Focused build harness

The one build-core-probe.ts harness accepts a canonical core Rust source path and derives an ignored Cargo test package. Calendar, change-source and projection use it; each reference test checks its source hash before importing the generated module. These are leaf proofs, not alternative production entry points. The normal test command still requires the full SDK compile first.

A published-compiler rebuild took 43.3 s, exhausting the original 45 s combined deadline before the projection package finished. It was a completed rebuild, not a hung process; retrying with the same deadline and a warm compiler passed. The harness now budgets 90 s for both phases, about twice the observed cold cost. Warm source probes take under two seconds. No compiler speed-up is claimed; cold compiler rebuild cost remains a dev-loop slow spot.

## Calendar checkpoint

The canonical plain_date.rs source is freshly compiled in an isolated test package by `bun run test:calendar`. Its four differential runtime tests pass 2,588 assertions against actual pinned upstream, covering parsing, Date conversion, fractional/NaN/infinite inputs, all arithmetic, grids/getter order, exact RangeErrors, UTF-16 slicing and lexical comparisons. The test package copies canonical Rust afresh, records source hash/compiler/toolchain provenance, and checks the source is unchanged; it is not a second implementation or a replacement full-SDK build. Probe artifacts are ignored.

Calendar declarations remain pending: #1828 loses the isISODate type predicate; #1829 ignores the explicit ISODate alias name. The same strict TypeScript consumer passes upstream and fails generated declarations. Runtime success does not complete this module.

The #1827 compiler patch shares predicate recognition and numeric zero comparison between calls and function values. Its new corpus case failed before the change and passes against native Rust after it, including production and library builds; all three mutations were caught. Compiler TypeScript typecheck passes. Compiler all-target clippy is blocked by pre-existing items-after-test-module in comments.rs and lower/mir/tidy/stages.rs; the patch adds no suppressions. App strict Clippy passes. The upstream lead owns full checks and publication.

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
- #1830/#1834: canonical Intl locales and timestamp inputs; assigned here, generator design confirmed by the lead.
- #1831: Locale week information is absent from the pinned coverage library; no stand-in members will be added.
- #1833: nonthrowing scope-guard drop output.
- #1827: downstream Ordering predicate patch proven locally; awaiting upstream landing.
- #1828/#1829: calendar type-predicate and alias-name declarations.
- #1820: readonly lending of flattened Copy/Clone range records, preserving the correct projection for any actual clone/compare/hash.

The team owns these through agent-hub. Each has a concrete source reproduction. No tests or types are weakened, no helper bindings replace missing platform APIs, and no compiler workaround is presented as port completion. After the fixes land, rebuild, run the full numeric/reference/browser suites, inspect every generated diff and update the port map from actual evidence.

The complete kernel, behavior/component families, Web adapter/tags/events, in-scope docs/examples, Pages workflow/setup and public deployment verification remain required under implementation-plan.md. React remains the next SDK phase and other adapters remain deferred.
