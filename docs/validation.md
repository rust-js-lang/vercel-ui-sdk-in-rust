# Validation checkpoint

2026-11-15. Milestone one remains open: complete core, Web Components, Rust docs/live examples, and an actual verified GitHub Pages deployment are required.

## Current published compiler adoption (630af00)

The SDK pins published 630af008d, adding rust-js #2106 to #2116: a builtin's property read, and its method, are its own only of a value a builtin made, and a Rust field read of a struct JS may make or give is JS's own. Regeneration moves only week.js: `firstDayOfWeek`'s memo is `$withBorrowMut(cache, ..)` again, as `resolveFirstDay` may read `locale.week_info`, the legacy `weekInfo` through a cast of the locale it made, which isn't known to be the host's own value (a listed difference in the port map, the lead's decision; whether a program could declare it so is the user's question). The active patch series stays empty. Native 23 pass, compiled 22 pass, strict Clippy passes; reference 79 pass/7 fail of 86, the same known failures; Chromium 22 pass/2 known closest failures.

## Previous published compiler adoption (9776c84)

The SDK pins published 9776c84a0, adding #2074 (a `position` an `and_then` gives is `indexOf`, tested `!== -1`), #2082 (builtins that run none of the program's code, and a `None` argument and `?.()` of them, so the week memo has no borrow check) and #2106 (a property read of a JS object runs nothing only where a builtin made it). Regeneration moves only week.js: `firstDayOfWeek` loses `$withBorrowMut`, its extension lookup `$position` for `extensionDays.indexOf(extension)`. The active patch series stays empty. Native 23 pass, compiled 22 pass, strict Clippy passes; reference 79 pass/7 fail of 86, the same known failures; Chromium 22 pass/2 known closest failures.

## Previous published compiler adoption (b940756)

The SDK pins published b940756e5, which carries the week module's compiler fixes: the IIFE-free module table (G1), `map_or_else(.., str::to_string)` as `??` (G4), the inline regex (G5), and-then's closure in place (G6), the entry memo's map steps (G3), and `Intl.Locale`'s `Defined`/`WeakKey` (the retired local probe). The active patch series stays empty.

Native 23 pass (week's 2 added), compiled 22 pass, strict Clippy passes. The complete reference suite is 79 pass/7 fail across 86 cases: week.test.ts' 5 pass against the original module under three hosts, and two numeric cases now pass; the 7 failures are the known createDetails, closest, native case and source-fidelity gaps. Chromium is 22 pass/2 known closest failures.

Regeneration moves four other generated files: events.d.ts' listener parameter is upstream's `event`; steps.js reads `range.snap?.threshold ?? 0` and a one-line `pull`; undo_stack.js loses its try/finally borrow wrappers; projection.js holds `candidates[target]` in a `const` per branch, as a JS-given array's index may be an accessor read once (rust-js 8453fcd13): a correctness-forced difference from upstream's double read, ADR 0262's third case, listed, not accepted.

## Previous published compiler adoption (705057e)

The SDK pins clean published 705057e, including the landed startup fix #1917. Its duplicate inactive review is retired. The actual compiler identity 9bc91a3415a2375b matches source and the binary built in the private full gate; the stale shared 99f binary was not reused. Dependencies were refreshed through the locked Bun install. SDK regeneration changes no output.

Native 21 pass, compiled 20 pass in 10 files and strict Clippy pass. The complete reference suite remains 72 pass/9 fail with 317,313 assertions across 81 cases; its full case/status set exactly matches e0. Chromium remains 22 pass/2 known closest failures across 24 cases. See [adoption proof](evidence/705-adoption.json). No incomplete API or remaining regression is waived.

The inactive #1919/#1921 review passes the full compiler gate in 420.31 seconds on 705057e (326 other files, 9 browser files), plus all 13 new/affected mutants and five focused cases/22 assertions on beta and stable engines. The shared Member guard accepts structured call signatures while still rejecting made-up kinds, and every consumer was audited. See [exact reader proof](evidence/1919-1921-validation.json). This review awaits upstream landing; no complete core/Web/docs/Pages milestone is claimed.

## Historical published compiler adoption (e0f07bc)

The SDK now pins published e0f07bc, including the computed-symbol and generic-default readers (#1912/#1916); their duplicate inactive review patches are retired. The active patch series remains empty. The compiler build identity owner reports 99f613233edef5e7 in both source checkouts, matching the copied published binary. Regeneration changes no SDK generated file.

Actual checks: native21 pass, compiled 20 pass in 10 files, strict Clippy passes, complete reference/type/source72 pass/9 fail (81 tests,317,313 assertions), Chromium22 pass/2 known closest failures. No remaining regression is waived. See [current adoption evidence](evidence/e0-adoption.json).

The independent startup timing fix #1917 passes the complete compiler gate in323seconds before rebase (322 other files,9 browser files). On e0f07bc, its implementation/tests/catalog are unchanged; incoming-scope checks and four owner mutants pass. The inactive review awaits upstream landing. Warm build/cache differs from earlier cold runs; no isolated speed-up is claimed. See [exact startup proof](evidence/1917-validation.json).

The newly verified const-parameter reader gap #1919 is assigned for the next reader fix. The original strict tuple consumer passes and its round trip fails. No app workaround is added.

## Published scope-guard adoption (9b14a06)

The SDK now pins published 9b14a06, including #1833 and #1909, with an empty active patch series. The duplicate scope review and output preview are retired. The actual compiler build-identity owner computes 563a29b90e11bca6 in both clean checkouts, matching the copied published binary; no compiler build or shared writes were needed. The three changed generated files were inspected in full diff: scope restoration now uses a finally with required abort guards, and Rust case conversion now uses Rust’s Unicode helpers.

Native SDK tests pass21, compiled Rust passes20 across10 files, and strict Clippy passes. The complete reference/type/source suite reports72 pass/9 fail,317,313 assertions across81 tests in19 files. The old eight incomplete/incorrect cases remain. The added Unicode-version vectors now expose #1914 against actual regenerated SDK code: the port uses Rust case conversion where upstream uses host JS case conversion. This is a missing native-boundary operation, not permission to weaken Rust’s correct Unicode tables or insert local bindings. No regression is waived.

The initial run hit stale copied local runtime exports. The documented root bun install --frozen-lockfile --force refresh resolves that setup mismatch; the counts above are from the refreshed run. The complete Chromium rerun now reports22 passes and the two known closest failures across24 cases (2.1seconds); see the current browser log. The lower fixed-base counts retain their historical scope. See [adoption evidence](evidence/9b-adoption.json) and [full comparison log](evidence/9b-reference.txt).

## Historical computed-symbol review (#1912)

The declaration reader incorrectly quoted symbol keys; the fix uses the existing computed-name model and one model-owned inventory key formatter. Affected browser coverage now consumes that formatter, retaining its unchanged baseline and distinguishing literal bracketed string keys. The independent eight-file review applies directly to published9b14a06 without #1903. It passes three tests/14 assertions with both original beta and stable engines,19 tests/94 assertions in the combined review,89 static tests/46,614 assertions, typechecking and all14 affected owner mutants. The complete compiler gate now passes on d2e47ad plus the computed-symbol and generic-default reader fixes in 8m27s. All ten newly added mutants are caught. The combined review was subsequently published and adopted in e0f07bc; duplicate patches are retired. See [whole-gate evidence](evidence/1912-1916-validation.json). See [exact evidence](evidence/1912-validation.json).

## Historical published-contract checkpoint (4c07105)

The compiler gitlink is published 4c07105. It contains #1845, #1846 and #1899; no active compiler patch remains. The SDK adopts present(value)/present(el), a present point field, and test(key) on the bound variant. ISO-date/RTL required-input types and the required undefined point key now match the original. The union test uses membership without reading the value.

The SDK was regenerated through the canonical host with RUST_JS_COMPILER selecting a copied binary from a clean published compiler checkout. Its production sources match 4c07105. The native suite passes 21 tests; compiled Rust invariants pass 20 tests across 10 files. Strict Clippy passes with warnings denied. The complete reference/type/source suite reports 73 passes and 8 failures across 81 tests in 19 files, with 317,495 assertions (2.25 seconds). The complete Chromium suite is 22 pass, 2 fail across 24 cases: both failures are the unfinished composedClosest API. No production Pages deployment is claimed.

The remaining numeric trace exposes P0 #1908: Option::map_or duplicates the snap getter. A conforming changing getter yields value2/point2 upstream versus value1/pointundefined in the port. The dedicated result regression remains red. m1-lisa owns the compiler fix and the Option-combinator sweep; no application workaround was added.

### Historical scope-guard review, now adopted upstream

Private review 46b6f78957ae0fc9e89068b0c8512e9abd678001 is based on 4c07105. The initializer owner now supplies the complete eager-key set, including constants with no callable initializer-effects entry. The existing unwinding owner proves the actual callback and consumes the canonical function/closure body maps. Lazy, unknown and throwing controls remain conservative. Required stack-overflow guards remain accepted output.

Six focused tests pass 52 assertions. All eight new owner mutants are caught; all 14 native corpus shards pass. The first full check:fast --all ends after 465 seconds with three failures. Two bookkeeping failures are corrected afterward: the fact-count contract is now67 and the architecture has the complete module path. All129 native compiler tests and all70 architecture tests/3559 assertions then pass. Implementation and mutation logic did not change after the gate.

The remaining failure is the new corpus's dyn-fn metamorphic rewrite, which exposes pre-existing P0 #1909. A separate seven-line program reproduces it against the clean upstream binary: native Rust prints called, JavaScript throws TypeError without calling the callback. No waiver or known-failure entry was added. At that fixed-base checkpoint the review and output preview were inactive. They are now retired after adopting the published fix.

See [structured evidence](evidence/1833-validation.json), [complete first gate](evidence/1833-first-check.txt), [native follow-up](evidence/1833-native-follow-up.txt), [architecture follow-up](evidence/1833-architecture-follow-up.txt), and the [baseline reproduction](evidence/1909-borrowed-box-fn.rs). That prerequisite is now published, and #1833 is adopted through 9b14a06; the first-gate evidence remains historical. These timings describe different workloads, not an isolated speed-up.

Published main has since moved to 363522b with Unicode and library-contract changes. Those incoming changes have been fetched and inspected; adoption requires a separate source/behavior audit and is not silently folded into this fixed-base checkpoint.

## Unshipped engine-library review (#1903)

The stable TypeScript 7.0.2 parser and canonical library graph are implemented in a review based on published 363522b. The parser/printer, library isolation/selection, updater policy/orchestration and builtin coverage tests pass 16 cases/80 assertions across three files. All 13 affected/new source mutations are caught; architecture and mutation-catalog checks pass 89 tests/46,593 assertions, and typechecking passes.

The engine selects 87 ESNext libraries; their hashes are recorded. Within currently measured families, coverage changes from 748/748 to 749/779, losing no covered member and exposing 30 unbound members. New native roots still require discovery under #1904. The existing signature owner correctly rejects newly accepted Temporal.PlainDate inputs; that failure remains unwaived.

The actual definitions --check selects eligible 7.1.0-beta over compatible stable 7.0.2. The unchanged updater channel policy conflicts with the lead’s stable-first condition, and is superseded by the lead’s approved stable-first policy: prereleases require an explicitly named, tested capability unavailable on stable. The review still needs that policy update. Real mutating regeneration and the required full gate have not run; isolated command fixtures prove orchestration and loss retention, not actual WebAPI/React regeneration. Generated builtin/WebAPI outputs are unchanged. The retained review is absent from series.json and is not production code. See [structured evidence](evidence/1903-validation.json), [focused tests](evidence/1903-focused.txt) and [static checks](evidence/1903-architecture.txt).

## Historical unsafe-boundary checkpoint (2680f61)

Published compiler base bc26493 includes #1867; the duplicate implementation patch is retired. The sole active patch is #1899, preserving checked optional_call and introducing unsafe optional_call_unchecked through the same native path owner. The existing js::cast remains the single unchecked assertion API. The user explicitly approved preserving the upstream JavaScript behavior on 2026-11-15. Setup is idempotent on two consecutive runs.

Focused compiler proof passes eight tests and 35 assertions. The complete check:fast --all passes in 403 seconds, including 313 other test files, nine browser files, native tests, Clippy, formatting and typechecking. All five added/retargeted owner mutants are caught; actual failing test names and SHA-256 log hashes are in [the evidence](evidence/1899-validation.json), with the [whole gate output](evidence/1899-full-check.txt). Post-gate compiler edits are documentation/comments only. This is not an isolated performance comparison.

The unshipped generic closest preview compiles and passes all six platform Chromium comparisons, including cross-realm identities and getter/this behavior. Its generic declaration matches the original. A complete function-source regression exposes redundant found ?? null inside if(found), tracked as #1902. The preview is retained in patches/port-previews/1902-composed-closest.patch and is not part of the active compiler patch series or the production port. No extra runtime class checks or duplicate cast API are introduced.

The actual checkpoint reference/type/source suite is 70 pass, 10 fail, 317,490 assertions across 80 tests in 19 files (2.22 seconds). The expanded original createDetails runtime and declaration contracts separately pass two tests and 56 assertions. Its compiled constructor and aliases remain missing. Complete browser coverage is not claimed from the six preview comparisons.

#1845 and #1846 are reported landed upstream after this fixed validation base; their adoption and SDK annotations are the next checkpoint. The required input/own-key and union-order regressions remain red here.

## Historical scrollbar checkpoint (1dbd56f)

The published compiler base is ec7990f. It includes the prior Intl/model, harness, nullish-boundary and inheritance-constraint work, plus published native trailing-None/undefined argument corrections. The active #1867 patch adds the validated stable-literal movement fix while upstream review proceeds. It is applied through the single series.json list; setup is checked for idempotence. The private review commits are source evidence, not published compiler revisions.

The preparatory split preserves all three function bodies and all 16 existing mutation definitions. The expanded real-WebAPI object/array/global-order regression passes 34 assertions, the native safety unit passes, and all 140 structure/CI/registration tests pass. All 18 moved/new owner mutations are caught; their actual failing test names and log hashes are retained in [the evidence](evidence/1867-validation.json).

The first complete gate ends in 429 seconds with exactly two expected-output failures: a newly adopted enum corpus snapshot and the improved readability report. After owner-driven regeneration and review, the clean review tree passes check:fast --all in 307 seconds. The implementation and mutation tests are unchanged; the final run does not repeat the 18 already-caught mutations. Forty-one existing corpus snapshots and the std_traits example now retain stable literals at their uses. The readability report records 94 fewer renamed bindings and 70 fewer role fallbacks. All affected corpus cases agree with native Rust.

These durations describe different workloads and cache states, not an isolated speed-up: the first gate's mutation job takes 390 seconds and keeps 1 MB of prior compiles; the final run keeps 60 MB and has no uncommitted owner mutations to repeat. The final browser group takes 4m27s, the crate corpus 2m06s, and the last active tail is the normal intervals-shadow check. The reserved window's warm estimate was too low; the team was informed and the machine released at terminal status. Complete [first](evidence/1867-first-check.txt) and [final](evidence/1867-final-check.txt) output is retained.

| SDK check at 1dbd56f | Result |
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

- #1845 and #1846 are adopted in this checkpoint: required input arity, the own point key and bound membership now match the original.
- #1908: Option::map_or duplicates an observable getter, changing both evaluation order and the numeric result. Both regressions remain failing.
- Generic closest: the unsafe generic selector preview compiles and passes its scoped browser checks, but source fidelity #1902 remains open. The production export, browser and strict-consumer failures remain visible.
- #1909 blocks landing the unshipped #1833 review; borrowed boxed callbacks must remain callable through every reference depth.
- #1867: now adopted through published bc26493; the old patch is retired.
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
