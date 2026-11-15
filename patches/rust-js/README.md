# Compiler patch series

Published gitlink: 4c07105be615eadc254f2896ba329fcf551102a3. series.json is the sole ordered active list and is empty. #1867 and #1899 are upstream; their duplicate implementation patches are retired.

1833-eager-local-cleanup.review.patch is an unshipped review exported from private commit46b6f78957ae0fc9e89068b0c8512e9abd678001, based on the gitlink. It is deliberately absent from series.json. The six focused tests, eight new mutants and native corpus pass. The full gate remains unapproved because the new metamorphic case exposes pre-existing P0 #1909. No waiver was added. See docs/evidence/1833-validation.json for exact first/follow-up scopes.

The separate port-previews directory also holds unfinished selector work (#1902) and the scope-guard output preview. Neither is an active compiler patch or a claimed completed port. New numeric wrong answer #1908 and borrowed-box callback wrong answer #1909 are assigned upstream. createDetails remains missing.

Rebase/revalidate the scope review after #1909 lands, then activate only a validated patch or adopt the published fix directly. Historical #1867/#1899 evidence remains available. Complete milestone-one and Pages deployment are still open.
