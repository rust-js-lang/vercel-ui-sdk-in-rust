# Validation checkpoint

2026-11-15. Milestone one remains open: complete core, Web Components, Rust docs/live examples, and an actual verified GitHub Pages deployment are required.

## Current compiler and SDK checkpoint

The published compiler base is ec7990f. It includes the prior Intl/model, harness, nullish-boundary and inheritance-constraint work, plus published native trailing-None/undefined argument corrections. The active #1867 patch adds the validated stable-literal movement fix while upstream review proceeds. It is applied through the single series.json list; setup is checked for idempotence. The private review commits are source evidence, not published compiler revisions.

The preparatory split preserves all three function bodies and all 16 existing mutation definitions. The expanded real-WebAPI object/array/global-order regression passes 34 assertions, the native safety unit passes, and all 140 structure/CI/registration tests pass. All 18 moved/new owner mutations are caught; their actual failing test names and log hashes are retained in [the evidence](evidence/1867-validation.json).

The first complete gate ends in 429 seconds with exactly two expected-output failures: a newly adopted enum corpus snapshot and the improved readability report. After owner-driven regeneration and review, the clean review tree passes check:fast --all in 307 seconds. The implementation and mutation tests are unchanged; the final run does not repeat the 18 already-caught mutations. Forty-one existing corpus snapshots and the std_traits example now retain stable literals at their uses. The readability report records 94 fewer renamed bindings and 70 fewer role fallbacks. All affected corpus cases agree with native Rust.

These durations describe different workloads and cache states, not an isolated speed-up: the first gate's mutation job takes 390 seconds and keeps 1 MB of prior compiles; the final run keeps 60 MB and has no uncommitted owner mutations to repeat. The final browser group takes 4m27s, the crate corpus 2m06s, and the last active tail is the normal intervals-shadow check. The reserved window's warm estimate was too low; the team was informed and the machine released at terminal status. Complete [first](evidence/1867-first-check.txt) and [final](evidence/1867-final-check.txt) output is retained.

| Current SDK check | Result |
| --- | --- |
| Normal linked build | pass |
| Native Rust | 21 pass |
| Compiled Rust invariants | 20 pass |
| Strict Clippy | pass, warnings denied |
| Complete reference/type suite | 68 pass, 6 fail; 317,431 assertions; 74 tests in 18 files |
| Scrollbar reference/source tests | 4 pass, 3,788 assertions |
| Original/compiled scrollbar strict consumers | 2 pass |
| Targeted scrollbar Chromium comparisons | 2 pass |
| Complete current Chromium suite | not rerun; historical complete result below retains its original scope |

The six integrated failures are the existing calendar/environment required-input declarations, pending generic closest declaration/export, required own point with undefined, and numeric union getter-order mismatch. No failing assertion is weakened. This checkpoint does not complete the core/Web/docs/Pages milestone.

Bun discovery is scoped to tests/ so an ordinary SDK test does not walk the compiler submodule and generated build trees. Compiled Rust tests still run correctly with that configuration. The observed filtered discovery took 27.84 seconds during the compiler gate; after scoping and using an explicit file path, the four tests took 28 milliseconds. Cache/load and command spelling are not isolated, so these observations are not a benchmark claim.

Formatting is checked for the SDK package with cargo fmt --package ui-sdk-core-in-rust -- --check (pass). An overly broad cargo fmt --all --check also traversed generated path-dependency bindings and hit its 20-second deadline; that command is not the SDK formatting scope. No generated dependency source was rewritten.

## Last complete integrated SDK snapshot

Source checkpoint:64f9405. Compiler:ef8807570597a4132d4442dd78315a7b39eaba06 plus the then-scoped Intl/model and harness review patches. Pinned original:220c1a0d7278872286a620a8e4ee4210ca46f9bd, Apache-2.0.

| Gate | Recorded result |
| --- | --- |
| Normal linked SDK compile | pass |
| Native Rust | 20 pass |
| Compiled Rust invariants | 19 pass |
| Strict Clippy | pass, -D warnings, no allows |
| Full reference/type suite | 61 pass, 5 fail;313,639 assertions;66 tests in17 files |
| Chromium | 20 pass,1 fail;21 tests |
| Existing 13-export platform strict consumers | original and compiled pass |
| Upstream source/hash inventory | exact pin;2,611 files;original sources unchanged |
| Complete core/Web/docs/Pages audit | unfinished |

A separate closest generic fixture was added later: its original consumer passes and compiled consumer remains failing because the function is intentionally absent pending the binding design. The table is not relabelled as a new-pin or new-fixture full run.

## Complete scrollbar module

Both original runtime exports are ported. Native RTL gutter/bottom-rail tests cover borders, content, nonfinite coordinates and rail boundaries. Differential numerical matrices cover fractional geometry and getter/short-circuit read order. Strict TypeScript consumers accept valid original callers and reject invalid ones. Chromium compares real LTR/RTL, detached, text, root and iframe nodes, plus getter order, root/zero-size early exits and thrown-value identity.

Both generated function bodies match the pinned original after TypeScript erasure, formatting and export-placement normalization only. A regression enforces that complete comparison. Rust retains the original comments, destructuring, native instanceof check, repeated getters, parseFloat fallback and coordinate/property evaluation order. The #1867 patch removes the earlier unneeded aggregate-argument temporaries without reshaping the Rust source.

## Retained gaps

- #1845: required own point with undefined and required input arity remain failing. No assertions are weakened.
- #1846: union property classification reads a getter where the original tests membership; the evaluation-order regression remains failing.
- Generic closest: optional_call exists and inheritance constraints are fixed; the native selector/generic result binding is still required. Complete-export, browser and separate strict consumer failures remain visible.
- #1867: source fidelity is validated through the retained patch; published upstream adoption remains pending.
- Full change-source/createDetails vocabulary and scope-guard output #1833, projection output #1814, undo-stack output #1815/#1816, Date numeric binding coverage #1837 and Locale week-info/library-version policy #1831 remain part of the audit.

Published #1862 keeps the document fallback lazy; native, compiled and explicit-document/no-global comparisons pass at the recorded snapshot. Published #1863 removes the two private bool-index cache checks. The nonempty-split helper and broader source/output differences remain under audit.

## Existing foundation evidence

Layout compares the complete original module: four real-browser cases and a72-case numerical/getter matrix cover fractional boxes, transforms, scrolling, detached/inline/body elements, offsetParent read order and iframe elements. Environment compares112 isolated-host scenarios and two browser cases, preserving server guards and platform/touch getter order.

Shared platform support implements13 of14 runtime exports. Reference matrices cover Unicode/lone UTF-16 surrogates, inherited dictionary getters/falsy values, keyboard layout fallback, modifier order, thrown identity, overrides and defaults. Browser cases cover nested shadow focus, slots/shadow/iframe containment, portal identity/fallbacks and reduced motion. SSR proof covers an explicit document without browser globals and the default ReferenceError.

Calendar runtime proof covers a complete Gregorian cycle and native Date/error/getter behavior. Motion/history retain their comparisons, including10,000 seeded undo traces. These scoped results do not close the complete kernel/component/Web/docs audit.

## Historical compiler evidence

The unchanged #1840 regression and focused Intl/model suites pass12 tests/331 assertions on84740d5. The independent #1861 before/after preserves all6,915 existing test-name/status multisets, adds five passing names and removes none. Nine harness mutants are caught, and the ordinary ten-owner workload catches10/10 at the restored one-second preparation bound. Before/after caches differ; no isolated speed-up is claimed. Exact bases, costs and proof are in [the investigation](mutation-preparation-1861.md) and [compact outcome comparison](evidence/1861-core-outcomes.json).

## Remaining milestone work

Complete kernel and shared behavior/component families; all Web adapter/tags/properties/events; Rust docs shell, content and executable examples; build/deploy-only Pages setup; actual deployed-route, asset, search and example verification. React follows milestone one; other frameworks remain deferred.
