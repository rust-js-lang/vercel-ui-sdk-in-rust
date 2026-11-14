# Compiler fixes

Published pin: e9f75c3f39375c703f533fade10dcc7bd0bf4253. The source-owner mutation harness #1848 landed as 86a759f64 and its retained implementation patch is removed. The published core passed its upstream full check. Earlier flattened-copy, calendar reexport/predicate, Result declaration and union-simplification fixes are also adopted.

series.json is the single ordered application list. Setup constructs an isolated Git index, recognizes a supported applied prefix and refuses mismatched local edits. Repeated setup on this pin is a no-op.

1. 1830-1834-intl-arguments.patch retains the Intl argument/record surface and shared TypeScript construct-signature model. The generator owns its Rust declarations; no app bindings replace them. model-review.md identifies every Member consumer.
2. 1830-1834-owner-mutations.patch registers ten actual source-owner mutations requiring the feature and the now-published harness.

Current focused verification passes 35 tests / 42,896 assertions across Intl, TypeScript model, mutation registry and source workspace tests. The feature's revised full check is still pending and its landing remains held for confirmed P0 #1840. The separate 1840-nullish-native-regression.patch is reproduction-only and deliberately excluded from setup.

Current owner batch on this pin: seven of ten caught; three INCONCLUSIVE at the new one-second preparation timeout (#1861). Template 1.5 s / 91,258,880 bytes; total about 39 s. The quiet actual-workspace diagnostic separately measures copy 1907 ms and preparation 18 ms under the same deadline. No deadline increase or larger-timeout retry was made. All source workspaces were removed. The earlier15-of15 proof predates this timeout change and does not establish current success.

An older Intl feature version passed a full check in 4 m 49 s; the independent harness core passed in 7 m 57 s before its published landing. Those are scoped historical results, not a green full check for the current combined feature or a fix for #1840. Their costs and deadline failures remain in the compiler development-loop ledger.

The upstream lead coordinates remaining fixes. Remove retained patches only after adopting their published implementations and rerunning affected gates. These checkpoints are not release evidence for the full SDK.
