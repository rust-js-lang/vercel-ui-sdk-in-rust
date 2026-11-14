# Validation checkpoint

2026-11-15. Milestone one remains incomplete. Core, Web Components, the Rust docs application, live examples and Pages publication remain required. No partial deployment is presented as milestone completion.

## Integrated SDK

Upstream remains pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, Apache-2.0. The private compiler pin is now 710e93c549f224bd1e47db1d99e5dae8be7a5dc5 plus the retained Intl review patch. Published fixes now allow numeric grids, keyboard mapping, calendar arithmetic and change-source propagation to build together through the normal SDK build.

| Gate | Current evidence |
| --- | --- |
| Full SDK compile | passes, including numeric grids and linked keyboard exports |
| Native Rust | 20 tests pass |
| Playwright Chromium | 10 tests pass for actual original and compiled event/lifecycle behavior |
| Reference/type suite | Fresh current run: 43 pass, 4 fail, 294,079 assertions across 47 tests / 13 files |
| Event declarations | Both unchanged original and generated consumer fixtures pass after declaring @rust-js/webapi |
| Numeric keyboard | Four tests pass: orientation/direction/arrow/modifier matrix, composition, getter order and short circuiting |
| New flattened-copy regression | Fails specifically on the compiler-added getter read, #1847 |
| Strict Clippy / compiled native invariants | Earlier snapshot passed; not rerun after this compiler adoption |
| Complete core/Web/docs/Pages audit | unfinished |

This reference run followed the dependency correction and added copy regression. It tested output from the successful full build; no later Rust source change was made. The source/output audit is still open and itself found #1847.

## Failures retained, not weakened

- #1845: the original scrub result always owns point, even when undefined. A plain Rust Option field initialized with None is omitted. The guide documents that lowering; a required undefined-valued boundary form is missing.
- #1846: the original stepBy checks property membership with the in operator. Untagged struct classification reads the bound field instead, changing Proxy/getter order. The existing test attribute is documented as a kind check; a membership form is needed.
- #1847 (P0): a copied flattened NumberRange emits a nested range copy. A nonenumerable inherited range getter is wrongly read: original returns 1.5, compiled throws. The dedicated regression proves this independently of #1845/#1846.
- #1828/#1829: generated calendar declarations lose ISODate naming and the validator type predicate. The original strict consumer passes; generated declarations fail. Runtime comparisons pass.
- #1840 (P0): forwarding null as a Rust None to native optional arguments differs from undefined/literal None. The separate retained regression fails; the Intl feature is held for its fix.

No app casts, fake bindings or changed assertions hide these differences. The compiler team owns the fixes through agent-hub.

## Intl and TypeScript model review

The authoritative Intl template emits sealed locale/string-list/date input traits, native record declarations and matching Date/String locale methods. localeMatcher remains its exact enum. Collator, DateTimeFormat, NumberFormat and RelativeTimeFormat supportedLocalesOf accept their full options types, following the pinned TypeScript overloads.

The expanded coverage derives more than 200 accepted Rust calls across exactly 26 changed sites: eight constructors, eight supportedLocalesOf statics, three Date methods, two String methods, four DateTimeFormat methods and getCanonicalLocales. It found the additional RelativeTimeFormat options narrowing before the correction.

Constructor signatures now use one shared TypeScript Member model, parser and factory printer. checkedMembers validates known discriminants before consumers select or skip kinds. Eight actual Member-reading modules are migrated, including the WebAPI event-map reader; declaration-only readers and Rust JSON producers are listed in the patch review document.

Focused Intl and model suites pass: 10 tests, 326 assertions, including native Bun/Chromium comparisons, strict declarations, rejected Rust nonmembers, all argument sites and exact construct-signature round trips. The revised readers also typecheck. This is focused proof; the revised full compiler check remains pending. The lead split durable JS/TS owner mutation execution into dev-loop #1848, owned here. Intl does not wait for that harness, but its intended owner mutants are retained in the review document.

An earlier version of the Intl patch completed all planned full-check gates in 4m49s. Its plan started before #1840 existed; it does not prove that P0 fixed, nor validate the later model changes. Earlier 480s/270s deadline attempts and warm-check costs remain recorded in the compiler dev-loop ledger. No isolated speed-up is claimed.

## Remaining port work

Change-source runtime tests cover source/reason/event combinations, lazy tracking, nesting, exact return/thrown identity and synchronous promise boundaries; full createDetails vocabulary/types and scope-guard output (#1833) remain. Calendar runtime tests cover a complete Gregorian cycle and native Date/error/getter behavior; declarations remain pending. Motion/history foundations retain their reference tests, including 10,000 seeded undo traces. Projection search output (#1814) and undo output (#1815) still need final audit against published fixes.

Date numeric binding coverage (#1837) is assigned here after Intl review: JavaScript numbers must not be narrowed to i32. Locale week information (#1831) requires a library-level decision; no stand-in members are added. Result declaration typing (#1835) is independently tracked.

The one source-hashed leaf probe harness remains available for diagnostics. It is not a second implementation or substitute production entry point. Normal test commands require the full SDK build first.

The complete kernel, component/behavior families, Web adapter/tags/properties/events, Rust docs/examples, Pages workflow/setup and deployed-route verification remain unfinished. React follows milestone one; other adapters stay deferred.
