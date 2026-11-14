# Validation checkpoint

2026-11-15. Milestone one remains open: complete core, Web Components, Rust docs/live examples, and an actual verified GitHub Pages deployment are required.

## Published compiler adoption

The current pin is fa9b630, containing the published Intl/model work and ten owner registrations (9abbb76e3), the queued-exit/workspace fix (fb2e59e74), the nullish-boundary correction (d6e9a72dc), and generic inheritance constraints (c0f460246). The upstream reviewer reports full checks passing and unchanged React regeneration for the Intl and harness landings.

The exact review-owner tree a8a3675b was compared with 9abbb76e3. No Intl/model/generator/binding/mutation code differs. The differences are the agreed removal of a historical timeout ledger row, an independently added enumerate regression, and the published 21-line #1840 regression. The latter exactly matches the retained local reproduction. Superseded private implementation and reproduction patches are removed; series.json is empty.

The #1866 acceptance test is now upstream. Its Text diagnostic is TS2740, verified against the same declaration written by hand; the string diagnostic is TS2344. The generic closest binding follow-up remains with the bindings owner. No unsafe closest assertion is shipped.

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

## Targeted scrollbar work

The complete two-function scrollbar module is prepared in the working tree, not committed as a completed port. On fb2e59e74 plus the then-pending feature, its build passes;3 reference tests pass3,786 assertions, both original/compiled strict consumers pass, and2 Chromium comparisons pass. The browser cases cover real LTR/RTL, detached, text, root and iframe nodes, plus getter order, root/zero-size early exits and thrown-value identity. Native boundary coverage is written but has not run yet.

The generated numeric function matches the original structure. The DOM wrapper retains unnecessary aggregate-argument temporaries, #1867. A reduced real-WebAPI object case passes ten runtime rows and then fails its source assertion on four extra bindings. A smaller plain-field case already passed and was not falsely presented as a reproduction.

The proposed fix extends the existing stable-literal predicate to ordinary objects and arrays. Its initial build succeeds; expanded object/array, owner-counterexample, native-corpus, mutation, full compiler, and full SDK validation are pending the coordinated shared-machine window. patches/rust-js/1867-stable-literal-arguments-review.patch is review-only and excluded from setup.

## Retained gaps

- #1845: required own point with undefined and required input arity remain failing. No assertions are weakened.
- #1846: union property classification reads a getter where the original tests membership; the evaluation-order regression remains failing.
- Generic closest: optional_call exists and inheritance constraints are fixed; the native selector/generic result binding is still required. Complete-export, browser and separate strict consumer failures remain visible.
- #1867: source fidelity of nested native getter argument literals remains under validation.
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
