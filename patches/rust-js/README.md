# Compiler fixes

Published compiler pin:710e93c549f224bd1e47db1d99e5dae8be7a5dc5. Earlier Ordering, flattened lending and event declaration fixes are included; obsolete patches are removed.

series.json is the single application list. Setup applies it idempotently and refuses mismatches.

- 1830-1834-intl-arguments.patch: Intl argument unions, native records, exact matcher/full-formatter options and the shared TypeScript construct-signature model. Generated Rust follows builtins/intl.ts; no app casts or stand-in bindings. See model-review.md for every Member consumer and current validation.
- Revised focused proof:10 model/Intl tests326 assertions, including Bun/Chromium native calls, strict TypeScript consumer, rejected Rust nonmembers and accepted calls across26 changed native sites. Typecheck passes. Revised full-check is pending. The lead split durable non-crate owner mutation execution into dev-loop #1848; intended owner mutants are listed in model-review.md, and Intl does not wait on that harness.
- A prior patch version completed all planned full-check gates in4m49s. It predates both the new model changes and P0#1840, so does not validate either. Initial480s/270s deadline attempts are recorded in the compiler dev-loop ledger; no isolated speed-up claimed.
- The feature remains held for confirmed P0#1840. Separate1840-nullish-native-regression.patch is reproduction only, deliberately excluded from setup. It fails until the upstream fix lands.
- The integrated SDK additionally exposes P0#1847 in flattened record copies and boundary gaps#1845/#1846. Those are reported upstream; no private fix for them is applied.

The upstream lead coordinates landing. Remove retained patches after adopting published fixes and rerunning affected gates. Development checkpoints are not release evidence for the full SDK.
