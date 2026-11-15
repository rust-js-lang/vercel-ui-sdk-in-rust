# Compiler patch series

Published compiler base: ec7990f. series.json owns the ordered patch list.

1867-stable-literal-arguments.patch applies the validated stable-literal movement correction and its preparatory stability-owner split. It includes the safety proofs, 18 caught owner mutations, 41 reviewed existing corpus snapshots, the std_traits example snapshot and their derived readability report. It reuses the existing recursive stability predicate; no observable Rust/JavaScript difference is accepted.

The first complete gate on this implementation catches all 18 owner mutants and finishes in 429 seconds with only one newly adopted snapshot mismatch and an improved readability baseline. Those goldens are regenerated and reviewed. The final clean review tree passes check:fast --all in 307 seconds. The implementation and mutation tests do not change between these runs. Exact bases, local review objects, caught-test names and scoped results are retained in docs/evidence/1867-validation.json and the two check logs. The local review objects are not published compiler revisions.

The patch is active in setup so a clean checkout reproduces the scrollbar port while upstream review proceeds. Remove it after adopting the published fix and checking the affected SDK paths. Earlier Intl/model, nullish-boundary, harness and inheritance-constraint fixes are already published and have no retained duplicate implementation patch.

The faithful generic closest result binding is still pending; no unsafe closest assertion is shipped. Historical measurements retain their original scopes in docs/validation.md and docs/mutation-preparation-1861.md.
