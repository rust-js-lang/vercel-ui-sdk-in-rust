# Validation checkpoint

2026-11-15. Milestone one remains incomplete: the complete core and Web Components SDK, Rust docs/live examples and actual GitHub Pages publication are all still required.

## Last fully checked integrated SDK snapshot

Upstream:220c1a0d7278872286a620a8e4ee4210ca46f9bd (Apache-2.0). The last complete integrated SDK snapshot is rebuilt and rechecked on private compiler pin:ef8807570597a4132d4442dd78315a7b39eaba06 plus the ordered feature and #1861 review patches. Its published source-owner harness #1848 is adopted; the private implementation patch is removed. Published calendar reexport/predicate, flattened-copy, Result declaration and union-simplification fixes are included.

| Gate | Evidence at this source |
| --- | --- |
| Normal full SDK compile | passes, including linked platform support functions |
| Native Rust | 20 pass |
| Compiled Rust invariants | 19 pass |
| Strict Clippy | passes with -D warnings and no allows |
| Full reference/type suite | 61 pass, 5 fail; 313,639 assertions; 66 tests in 17 files |
| Chromium | 20 pass, 1 fail; 21 tests including real original/compiled event, layout, environment and platform behavior |
| Strict platform declarations | original and compiled consumers pass |
| Upstream inventory | exact source/hash pin; 2611 files; no original SDK source edits |
| Complete core/Web/docs/deployment audit | unfinished |

These runs include the canonical browser-global getter migration (#1862). activeElement uses a lazy closure fallback so native Rust coerces the global reference to the input lifetime. Generated JS keeps doc ??= document. The bool-index proof (#1863) removes two $index calls. Remaining failures below are retained unchanged.

## Current compiler review

The review pin is ef8807570597a4132d4442dd78315a7b39eaba06 with a separate #1861 patch. Both independent core whole gates pass on this exact base: 7:29 before and 6:33 after, with cache differences disclosed. All 6,915 existing test-name/status multisets are unchanged; five new tests pass and none disappear. Nine harness mutants are caught. The same ordinary ten-owner Intl batch catches 10/10 in about 34 s at the restored original one-second preparation bound. The full core gate used the interim 20 s bound; the final bound was verified by the ordinary workload. The harness is now published as fb2e59e74 and its upstream full check passes with unchanged React regeneration. The separate Intl feature landing check remains in progress. See [exact evidence](mutation-preparation-1861.md).

## Retained failures and compiler gaps

- #1845: the scrub result must own point even when undefined; Rust's plain Option field currently omits it. The original calendar/environment APIs also require an input argument even when its value is undefined, while generated declarations allow omission. Both strict missing-input assertions remain failing; no assertion was weakened. This is the compiler team's shared plain Option/optional boundary design.
- #1846: original stepBy uses property membership; current untagged object classification reads the bound getter instead, changing observable order. The numeric regression stays failing.
- #1859 optional_call is adopted in the compiler, but composedClosest remains unimplemented pending #1866: exported IsA<Element> loses its TypeScript generic constraint, and generic native DOM overloads need an approved binding form. The unsafe app assertion was removed before publishing. Complete-export parity, the original optional-method browser case and a new separate strict generic consumer remain failing.
- #1862 is adopted: possibly absent globals use canonical getter calls. The lazy document fallback passes native, compiled, strict Clippy and explicit-document/no-global differential tests. Its generated expression remains doc ??= document.
- #1863 is adopted: the private two-item shortcut cache indexed by usize::from(bool) now emits plain array indexing. The nonempty-split last().expect() helper and full generated-source fidelity remain open.
- #1840/#1843 are now fixed upstream by d6e9a72dc and adopted through84740d5. The unchanged null-forwarding repro passes alongside Intl/model checks:12 tests,331 assertions. The combined Intl feature awaits upstream review/full validation; it is no longer held for an unfixed P0.

Calendar narrowing and root ISODate reexports now pass; #1828 and canonical #1829 are adopted. #1853 was a duplicate. Flattened-copy #1847 is fixed and its throwing-getter regression passes unchanged.

## Platform proof

layoutOrigin, layoutSize and layoutBox compare against the complete pinned original module. Four real Chromium tests cover fractional content/border boxes, transforms, scrolling, detached/inline/body elements, repeated offsetParent reads, getter order and iframe elements. A separate 72-case numerical/getter matrix covers nonfinite/fallback computed sizes. Runtime export keys and both strict consumer fixtures match. The source/output audit preserves repeated native reads and the global computed-style call.

isBrowser, isIOS and isRTL use actual generated WebAPI bindings. 112 isolated-host scenarios compare module-time flags, server guards, platform/touch getter order, nullish elements and later global availability changes. Two Chromium tests cover inherited/changed RTL, iframe elements and real navigator getters. The original strict consumer passes; generated input arity remains failing under #1845. Primitive thread-local naming follows ADR0619; the explicit isBrowser boundary name preserves the original API.

The new shared platform source implements 13 of 14 runtime exports. Five reference tests compare aliases, Unicode and lone UTF-16 surrogates, inherited dictionary getters/falsy values/repeated reads, physical keyboard-layout fallback, modifier getter order, thrown identity, platform overrides and shortcut defaults. Both strict consumers pass. Four real Chromium cases compare nested shadow focus, text/slot/shadow/iframe containment, explicit portal node identity and null/body fallback, and reduced-motion media changes. The fifth Chromium case retains #1859 rather than skipping it. SSR tests prove an explicit document works with all browser globals absent and that the missing default still throws ReferenceError.

Generated JS was compared with the full original platform module. Remaining bounds/nonempty helpers and control-flow/alias differences keep the source/output audit open; runtime comparisons alone do not close it.

## Intl/model and source-owner review

builtins/intl.ts owns the spec and generated Rust argument/record declarations. TypeScript construct signatures use the shared Member parser/model/factory, and checkedMembers rejects unknown discriminants. Eight actual Member-reading modules are migrated; model-review.md records the consumer audit. Native Bun/Chromium calls, strict declaration consumers, rejected Rust nonmembers and more than 200 source-derived accepted calls cover 26 changed native sites.

After adopting the published harness, the current focused compiler review suites pass 35 tests / 42,896 assertions. That earlier focused result is historical. On84740d5, the Intl/model and unchanged P0 reproduction suites pass12 tests/331 assertions; the combined feature full gate and landing await upstream review.

Current ordinary ten-owner mutation run on the fixed harness: 10/10 caught in about 34 s at underLoad(1_000), no inconclusive verdicts or observed-overrun warnings; template 1.7 s/91,377,664 bytes and peak workspace 91,381,760 bytes. The old 7/10 ordinary run and 6/10 confirming trace are historical false-timeout evidence, not accepted results. Temporary observers are removed, workspaces are cleaned, and the diagnostic 20 s allowance is removed. Full comparison, mutant proof and cache limitations are recorded in [the investigation](mutation-preparation-1861.md).

An older Intl version passed its planned full gate in 4 m 49 s, before later model changes and #1840. The isolated harness core passed in 7 m 57 s. Those scoped measurements and the earlier deadline failures remain in the compiler ledger; they are not current combined green results or isolated speed-up claims.

## Earlier upstream adoption (84740d5)

That checkpoint used private compiler pin: 84740d5ec364f51ac5dda2fc92cf57e8d5ea10b5. The held feature, ten owner registrations and independent #1861 core are rebased separately. The ordered installer is verified idempotent. The SDK normal build passes; generated events.js adds only the required options ?? undefined at native add/removeEventListener boundaries. These changes were inspected; complete SDK runtime/browser gates on this pin are pending while the upstream reviewer uses the shared machine for #1861 landing. The complete SDK table above records ef8807570 and is not relabelled as a new-pin result.

The separate closest strict consumer passes against the original. Its compiled counterpart remains failing because the function is intentionally absent pending the binding design. A diagnostic generic implementation demonstrated the dropped constraint; it was removed and never pushed. The isolated compiler regression is retained in patches/rust-js/1866-webapi-inheritance-regression.patch, excluded from setup, and fails because invalid string/Text consumers are accepted.

## Remaining work

The complete kernel, shared behavior/component families, page services, all Web adapter/tags/properties/events, Rust docs shell/content/examples, Pages workflow/setup and real deployed-route verification remain unfinished. React follows milestone one; other frameworks are deferred.

Change-source tests cover runtime source/reason/event propagation, nesting, identity and synchronous promise boundaries; full createDetails vocabulary/types and scope-guard output #1833 remain. Calendar runtime tests cover a complete Gregorian cycle and Date/error/getter behavior. Motion/history retain their reference tests, including 10,000 seeded undo traces; projection output #1814 and undo output #1815 remain under audit. Date numeric binding coverage #1837 and the Locale week-info/library-version decision #1831 are still required; no stand-in members are added.

The source-hashed leaf probe harness is diagnostic only. Normal testing uses the full SDK build. Ordered patch setup validates a complete supported prefix in an isolated Git index, applies only the remainder, preserves unmatched local edits and excludes the reproduction-only #1840 patch.

## Published harness adoption

The current submodule adopts fb2e59e745aa80e276284c6c01325779333bda16. The obsolete private #1861 implementation is removed from the ordered series; the two pending Intl/model and owner-registration patches are rebased on this published base. The reduced installer returns0/idempotent. Upstream review accepts the feature, all ten owner mutants, focused Intl/TypeScript checks and the unchanged P0 regression; its full landing gate is still running. These upstream results do not relabel the older complete SDK table as a new-pin full run.
