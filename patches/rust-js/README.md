# Compiler fixes

Review pin: ef8807570597a4132d4442dd78315a7b39eaba06. The source-owner mutation harness #1848 landed as 86a759f64 and its retained implementation patch is removed. The published core passed its upstream full check. Earlier flattened-copy, calendar reexport/predicate, Result declaration and union-simplification fixes are also adopted.

series.json is the single ordered application list. Setup constructs an isolated Git index, recognizes a supported applied prefix and refuses mismatched local edits. Repeated setup on this pin is a no-op.

1. 1830-1834-intl-arguments.patch retains the Intl argument/record surface and shared TypeScript construct-signature model. The generator owns its Rust declarations; no app bindings replace them. model-review.md identifies every Member consumer.
2. 1830-1834-owner-mutations.patch registers ten actual source-owner mutations requiring the feature and the now-published harness.
3. 1861-workspace-and-deadline-review.patch retains the separately scoped copy-worker/deadline/diagnostic review. Independent core whole before/after gates preserve all existing test outcomes; nine harness mutants and the ordinary ten-owner workload pass. The original one-second preparation bound is restored. Upstream review/landing is pending. See ../../docs/mutation-preparation-1861.md.

Current focused verification passes 35 tests / 42,896 assertions across Intl, TypeScript model, mutation registry and source workspace tests. The feature's revised full check is still pending and its landing remains held for confirmed P0 #1840. The separate 1840-nullish-native-regression.patch is reproduction-only and deliberately excluded from setup.

Current ordinary ten-owner mutation run on the fixed harness: 10/10 caught in about 34 s at underLoad(1_000), no inconclusive verdicts or observed-overrun warnings; template 1.7 s/91,377,664 bytes and peak workspace 91,381,760 bytes. The old 7/10 ordinary run and 6/10 confirming trace are historical false-timeout evidence, not accepted results. Temporary observers are removed, workspaces are cleaned, and the diagnostic 20 s allowance is removed. Full comparison, mutant proof and cache limitations are recorded in [the investigation](mutation-preparation-1861.md).

An older Intl feature version passed a full check in 4 m 49 s; the independent harness core passed in 7 m 57 s before its published landing. Those are scoped historical results, not a green full check for the current combined feature or a fix for #1840. Their costs and deadline failures remain in the compiler development-loop ledger.

The upstream lead coordinates remaining fixes. Remove retained patches only after adopting their published implementations and rerunning affected gates. These checkpoints are not release evidence for the full SDK.
