# Compiler patch series

Published gitlink: 705057eb6fd017ea32572ef4a51ded85a4e1cdc6. series.json is the sole ordered active list and is empty. #1867 and #1899 are upstream; their duplicate implementation patches are retired.

#1833 and #1909 are published in the adopted pin. The duplicate #1833 review and output preview are retired; historical first/follow-up evidence remains in docs/evidence/1833-validation.json.

The port-previews directory holds unfinished selector work (#1902), outside the active compiler series. Numeric getter bug #1908 and native case-conversion gap #1914 remain open; createDetails remains missing.

The adopted scope fix requires no local patch. Historical #1867/#1899 evidence remains available. Complete milestone-one and Pages deployment are still open.

1903-engine-libraries.review.patch is an unshipped working review based on 363522bc0d35cc3089640895e39fe4a38937cf14. It is absent from series.json. Stable-parser/library tests, typechecking and 13 source mutations pass, but widened Temporal signature coverage, release-channel policy, actual definitions regeneration and the full gate remain open. Evidence: docs/evidence/1903-validation.json. No published compiler revision or active SDK patch contains this review.

#1912/#1916 are published in e0f07bc and adopted by the SDK. Both duplicate inactive reader reviews are retired; historical proof remains in docs/evidence/1912-1916-validation.json.

#1917 is published and adopted in 705057e; the duplicate inactive startup patch is retired. Historical full-gate/rebase proof remains in docs/evidence/1917-validation.json.

1919-1921-declaration-readers.review.patch preserves local review 5727eb5f3fcefb17c85613d1c489aafd5f276ca1 on published 705057e. It fixes const-parameter reading and structured call signatures. Complete check:fast --all passes in 420.31 s; all 13 new/affected mutants are caught, and both beta/stable strict consumers pass. It remains inactive pending upstream landing. See docs/evidence/1919-1921-validation.json.
