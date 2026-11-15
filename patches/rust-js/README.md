# Compiler review artifacts

Published pin: fa9b630. Intl/model support and its ten source-owner registrations, the unchanged #1840 regression, the #1861 harness correction, and #1866 generic inheritance constraints are upstream. Their superseded private implementation and reproduction patches are removed.

series.json is the single ordered application list. It is currently empty; setup applies no implementation patch.

1867-stable-literal-arguments-review.patch retains a pending movement-owner fix and proof against 8bcb4049e. Before the preparatory module split, the expanded real-WebAPI object/array/global-order test passes 34 assertions, the native safety unit test passes, and the new native differential corpus case passes. The first complete gate exits 1 after 535 seconds: 40 corpus snapshots, one example snapshot, mutation registration and architecture checks require follow-up. The architecture size rule requires moving the existing stability owner and its mutations before extending it. All 18 moved/new mutation anchors apply after retargeting; that preflight does not prove that the tests catch the mutants. The initial split build found two missing imports, now corrected but not rebuilt during the team audit. This review artifact is excluded from setup and remains unvalidated as a complete fix.

The scrollbar port remains uncommitted pending its full source/output audit. The closest native generic binding follow-up also remains with the upstream owner; no unsafe closest assertion is published.

Historical measurements retain their exact scopes in docs/validation.md, docs/mutation-preparation-1861.md and docs/evidence/1861-core-outcomes.json.
