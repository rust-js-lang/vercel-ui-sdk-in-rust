# Validation checkpoint

2026-11-15. Milestone one remains incomplete. Core, Web Components, the Rust docs application, live examples and Pages publication remain required. No partial deployment is presented as milestone completion.

## Integrated SDK

Upstream remains pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, Apache-2.0. The private compiler pin is now 4652f87731e98db8f21b493f74c5a2917d128fc6 plus the ordered review patches. The integrated SDK counts below were refreshed after the layout/environment build and calendar predicate adoption. Published fixes now allow numeric grids, keyboard mapping, calendar arithmetic and change-source propagation to build together through the normal SDK build.

| Gate | Current evidence |
| --- | --- |
| Full SDK compile | passes, including numeric grids, keyboard, layout, environment and calendar predicate exports |
| Native Rust | 20 tests pass |
| Playwright Chromium | 16 tests pass for original versus compiled events/lifecycle, layout geometry/getters/iframes and environment detection |
| Reference/type suite | Fresh current run: 53 pass, 4 fail, 294,173 assertions across 57 tests / 16 files |
| Event declarations | Both unchanged original and generated consumer fixtures pass after declaring @rust-js/webapi |
| Numeric keyboard | Four tests pass: orientation/direction/arrow/modifier matrix, composition, getter order and short circuiting |
| Flattened-copy regression | passes unchanged after published fix ae1e605e6 |
| Strict Clippy / compiled invariants | current -D warnings check passes; 19 compiled invariants pass |
| Complete core/Web/docs/Pages audit | unfinished |

This reference run follows the successful linked build and includes the ordered patch-installer tests. The 16 Chromium tests, 20 native tests, 19 compiled invariants, strict Clippy and source/hash inventory also pass on this source. No later Rust source change was made. The full SDK source/output audit remains open.

## Failures retained, not weakened

- #1845: the original scrub result always owns point, even when undefined. A plain Rust Option field initialized with None is omitted. The guide documents that lowering; a required undefined-valued boundary form is missing.
- #1846: the original stepBy checks property membership with the in operator. Untagged struct classification reads the bound field instead, changing Proxy/getter order. The existing test attribute is documented as a kind check; a membership form is needed.
- #1847 was a P0: a copied flattened NumberRange read a nonexistent nested field. Published fix ae1e605e6 is adopted; the dedicated throwing-getter regression now passes unchanged.
- #1829: the root ISODate reexport fix 93905c21e is adopted. #1853 was closed as a duplicate; the strict root consumer is retained.
- #1828: the published js::Is API is adopted in Rust and the generated calendar validator now declares its type predicate. Its strict consumer additionally retains the required-input arity regression: generated declarations allow isISODate() without an argument, unlike the original. This follows the shared plain Option/optional boundary design in #1845; union simplification is separate (#1850).
- #1840 (P0): forwarding null as a Rust None to native optional arguments differs from undefined/literal None. The separate retained regression fails; the Intl feature is held for its fix.

No app casts, fake bindings or changed assertions hide these differences. The compiler team owns the fixes through agent-hub.

## Intl and TypeScript model review

The authoritative Intl template emits sealed locale/string-list/date input traits, native record declarations and matching Date/String locale methods. localeMatcher remains its exact enum. Collator, DateTimeFormat, NumberFormat and RelativeTimeFormat supportedLocalesOf accept their full options types, following the pinned TypeScript overloads.

The expanded coverage derives more than 200 accepted Rust calls across exactly 26 changed sites: eight constructors, eight supportedLocalesOf statics, three Date methods, two String methods, four DateTimeFormat methods and getCanonicalLocales. It found the additional RelativeTimeFormat options narrowing before the correction.

Constructor signatures now use one shared TypeScript Member model, parser and factory printer. checkedMembers validates known discriminants before consumers select or skip kinds. Eight actual Member-reading modules are migrated, including the WebAPI event-map reader; declaration-only readers and Rust JSON producers are listed in the patch review document.

Rebased focused Intl/model/source-runner/inventory suites pass: 13 tests, 330 assertions, including native Bun/Chromium comparisons, strict declarations, rejected Rust nonmembers, all argument sites and exact construct-signature round trips. The revised readers also typecheck. This is focused proof for the combined Intl/model feature; its revised full compiler check remains pending. Dev-loop #1848 is now implemented privately: all 15 registered owner mutants are caught through the existing runner with actual-load evidence and unchanged controls. The source template takes about 1.6 s and 91 MB; the complete batch took about 62 s. The independent harness core, including its five safety mutants, passed check:fast --all on 4652 in 7m57s (296 non-browser test files, eight browser files, native/compiler/Vite/type/format gates and all planned corpus parts). The compiler lead reviewed the core as sound; upstream landing remains pending. This does not validate the dependent Intl/model feature. Its 10 Intl/model owner registrations are a separate dependent patch, so the core can land independently. Intl remains held for #1840.

An earlier version of the Intl patch completed all planned full-check gates in 4m49s. Its plan started before #1840 existed; it does not prove that P0 fixed, nor validate the later model changes. Earlier 480s/270s deadline attempts and warm-check costs remain recorded in the compiler dev-loop ledger. No isolated speed-up is claimed.

## Platform layout and environment

All three layout functions are linked from Rust: layoutOrigin, layoutSize and layoutBox. Four real Chromium tests compare fractional content/border boxes, transforms, scroll offsets, detached/inline/body elements, repeated offsetParent reads, getter order and same-origin iframe elements against the pinned original. A separate 72-case numerical/getter matrix covers nonfinite and fallback computed sizes. Runtime export keys and both strict declaration consumers match. Source and generated JS were compared against the complete original module; repeated native getter reads and global computed-style calls are retained.

The environment port implements isBrowser, isIOS and isRTL using generated WebAPI bindings. Its 112 isolated-host scenarios compare module-time browser flags, server guards, platform/touch getter order, nullish element handling and later changes to global availability. Two Chromium tests also exercise inherited/changed RTL, iframe elements and native navigator getters. The original strict consumer passes. The generated consumer retains a failing required-input arity assertion under #1845. ADR 0619 intentionally preserves primitive thread-local constant names; the explicit boundary name isBrowser preserves the original export without changing the Rust naming convention. As with the calendar validator, plain Option input optionality remains governed by #1845; a missing isRTL argument is still admitted by generated declarations.

## Remaining port work

Change-source runtime tests cover source/reason/event combinations, lazy tracking, nesting, exact return/thrown identity and synchronous promise boundaries; full createDetails vocabulary/types and scope-guard output (#1833) remain. Calendar runtime tests cover a complete Gregorian cycle and native Date/error/getter behavior; narrowing and root ISODate reexports now pass, while required-input arity remains pending under #1845. Motion/history foundations retain their reference tests, including 10,000 seeded undo traces. Projection search output (#1814) and undo output (#1815) still need final audit against published fixes.

Date numeric binding coverage (#1837) is assigned here after Intl review: JavaScript numbers must not be narrowed to i32. Locale week information (#1831) requires a library-level decision; no stand-in members are added. Result declaration typing (#1835) is fixed upstream and adopted; the focused feature proof still needs refreshing before its review comments are updated.

The one source-hashed leaf probe harness remains available for diagnostics. It is not a second implementation or substitute production entry point. Normal test commands require the full SDK build first.

The complete kernel, component/behavior families, Web adapter/tags/properties/events, Rust docs/examples, Pages workflow/setup and deployed-route verification remain unfinished. React follows milestone one; other adapters stay deferred.

## Ordered compiler patch setup

Multiple retained patches can change earlier patch context, so a per-patch reverse check was insufficient for idempotence. Setup now constructs the ordered series in a scratch Git index, identifies a supported applied prefix and applies only the remainder. A full final state is a no-op; unmatched local edits are preserved and refused. Two tests use real isolated Git repositories to verify overlapping patches, repeated setup, prefix recovery and local-edit protection. The separate #1840 regression remains reproduction-only and excluded from the application series.
