# Compiler fixes

Published compiler pin:4652f87731e98db8f21b493f74c5a2917d128fc6. Earlier Ordering, flattened lending and event declaration fixes are included; obsolete patches are removed.

series.json is the single application list. Setup applies it idempotently and refuses mismatches.

- 1830-1834-intl-arguments.patch: Intl argument unions, native records, exact matcher/full-formatter options and the shared TypeScript construct-signature model. Generated Rust follows builtins/intl.ts; no app casts or stand-in bindings. See model-review.md for every Member consumer and current validation.
- Revised focused proof:10 model/Intl tests326 assertions, including Bun/Chromium native calls, strict TypeScript consumer, rejected Rust nonmembers and accepted calls across26 changed native sites. Typecheck passes. Revised full-check is pending. The lead split durable non-crate owner mutation execution into dev-loop #1848; intended owner mutants are listed in model-review.md, and Intl does not wait on that harness.
- A prior patch version completed all planned full-check gates in4m49s. It predates both the new model changes and P0#1840, so does not validate either. Initial480s/270s deadline attempts are recorded in the compiler dev-loop ledger; no isolated speed-up claimed.
- The feature remains held for confirmed P0#1840. Separate1840-nullish-native-regression.patch is reproduction only, deliberately excluded from setup. It fails until the upstream fix lands.
- Published flattened-copy fix #1847 is adopted and its SDK regression passes unchanged. Boundary gaps #1845/#1846 remain reported and unfixed.

The upstream lead coordinates landing. Remove retained patches after adopting published fixes and rerunning affected gates. Development checkpoints are not release evidence for the full SDK.

The ordered series additionally retains 1848-source-owner-mutations.patch (independent harness core plus five self-mutants) and 1830-1834-owner-mutations.patch (ten registrations requiring both the Intl feature and harness). All 15 were caught in the combined private review; current focused checks pass. The independent core full check passes on 4652f8773 in 7 min 57 s. Setup validates the whole series with an isolated Git index, so overlapping contexts and repeated application are handled without overwriting local edits.

The series now applies the independent #1848 core first, then the separately reviewed Intl/model feature, then its ten owner registrations. The core contains only five self-mutants and has its own full proof: 14 corpus parts, 8 browser files, 296 other test files, native/lint/format/Vite/matrix gates, all passing. The Intl/model feature still waits for #1840 and does not inherit that full-check claim.
