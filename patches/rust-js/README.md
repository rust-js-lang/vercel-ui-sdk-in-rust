# Compiler fixes

The published compiler pin is 44b38fb198b70d563baa7f7d00b6db8a0a585feb. It includes #1827 Ordering predicates; that obsolete patch is removed.

series.json is the single application list. Setup applies it idempotently and refuses a mismatch.

- 1830-1834-intl-arguments.patch: canonical locales, string/list-only canonical names, optional Date/number formatting and required Date/number/bigint ranges; native Intl record metadata (#1836). It changes the existing template and regenerates its output, with no app casts or stand-in bindings.
- Proof: Bun and Chromium native comparisons, TypeScript-derived argument coverage, negative Rust callers, strict TypeScript consumer, existing Intl/String cases. The planned full check passed in 4m49s. Initial full and map-recording attempts reached 480s/270s deadlines; the compiler dev-loop ledger records them.
- The feature is held for confirmed P0 #1840. Both null and undefined mean Rust None, but forwarding null into optional native arguments changes behavior. A separate regression patch is retained here and deliberately not part of setup's feature series; it fails until the upstream fix lands.
- The complete task's recorded wall time was 44m33s at proof collection. Completed checks took 5m54s; including the two terminated attempts, check time is at least 18m24s. Small isolated probes are additional.

The upstream lead coordinates landing. Remove patches only after adopting published fixes and rerunning the affected gates. These are development checkpoints, not release evidence for the full SDK.
