# Paused port checkpoint - 2026-11-15

Paused at the user's request to release this machine for another agent's work. No further local port builds, tests or regeneration are scheduled. Resume only when requested.

The published SDK compiler pin for this checkpoint is 705057eb6fd017ea32572ef4a51ded85a4e1cdc6. Its source checkout is clean. The adopted startup fix #1917 has no remaining duplicate local patch, and the active patch series is empty.

The compiler coordinator has local review 5727eb5f3fcefb17c85613d1c489aafd5f276ca1 for #1919 and #1921, based on that published pin. Its reproducible patch is retained inactive in patches/rust-js/1919-1921-declaration-readers.review.patch. Do not publish that private review as the SDK gitlink before it lands upstream.

The review preserves const generic inference and adds structured interface/object call signatures. Complete compiler validation passes in 420.31 seconds, including all 326 other test files and nine browser files. All 13 new/affected owner mutants are caught; five focused cases with 22 assertions pass on both the pinned beta and the independent stable-engine probe. Consumer dispatch and unknown-kind refusal are audited. Exact evidence: evidence/1919-1921-validation.json.

SDK validation on the clean published pin: native 21 pass; compiled 20 pass across 10 files; strict Clippy passes. The complete reference suite is 72 pass/9 fail with the same 81 case/status entries as the prior pin. Chromium is 22 pass/2 known closest failures. Regeneration changes no SDK output. Exact evidence: evidence/705-adoption.json. Existing failures remain visible.

Complete core, Web Components, Rust docs/live examples and the GitHub Pages deployment remain unfinished. The milestone is open.

On resume:

1. Read the team hub and current published compiler state. Confirm whether #1919/#1921 landed; adopt the published revision and retire its inactive patch after validation.
2. Resume #1903/#1904 from the retained engine review and approved compiler-builtins-generation-proposal.md. It needs the stable-first updater policy, full regeneration and issue-linked reports for every unbound Temporal alternative under #1918. The existing retained review is inactive and still requires rebasing.
3. Continue the approved Locale vertical and native case boundary #1914. Preserve the full source API and remove migrated handwritten specifications.
4. Resume createDetails after the remaining compiler spread and dictionary-elision contracts land. The user approved preserving unchecked JavaScript promises through explicit unsafe Rust boundaries; no runtime behavior checks or stand-ins are authorized as substitutes.
5. Continue full core/Web/docs implementation and local verification before the real Pages deployment. React follows this milestone; other framework adapters remain deferred.

## Resumed for the week module - 2026-11-18

At the user's direction (through the rust-js lead), this checkpoint is picked up only for `foundation/date/week`: the compiler pin moves to published b940756e5, week.rs is committed with its generated JS and declarations, tests/week.test.ts runs it against the original under getWeekInfo, the legacy weekInfo getter and the CLDR table alone, and the port map and validation record its listed differences (#2074, #2082). No other module, patch or deployment work is resumed; the plan above stands for whoever resumes the rest.

