# Compiler patch series

Published gitlink: 9b14a0670e5e96672b834d798f558ebae0718855. series.json is the sole ordered active list and is empty. #1867 and #1899 are upstream; their duplicate implementation patches are retired.

#1833 and #1909 are published in the adopted pin. The duplicate #1833 review and output preview are retired; historical first/follow-up evidence remains in docs/evidence/1833-validation.json.

The port-previews directory holds unfinished selector work (#1902), outside the active compiler series. Numeric getter bug #1908 and native case-conversion gap #1914 remain open; createDetails remains missing.

The adopted scope fix requires no local patch. Historical #1867/#1899 evidence remains available. Complete milestone-one and Pages deployment are still open.

1903-engine-libraries.review.patch is an unshipped working review based on 363522bc0d35cc3089640895e39fe4a38937cf14. It is absent from series.json. Stable-parser/library tests, typechecking and 13 source mutations pass, but widened Temporal signature coverage, release-channel policy, actual definitions regeneration and the full gate remain open. Evidence: docs/evidence/1903-validation.json. No published compiler revision or active SDK patch contains this review.

1912-computed-symbol-keys.review.patch is an independent inactive review based on published9b14a06. It fixes computed symbol names and migrates the affected coverage consumer. Scoped tests, both engines and14 affected owner mutants pass; the required full compiler gate is outstanding. Evidence: docs/evidence/1912-validation.json. No complete milestone or Pages deployment is claimed.
