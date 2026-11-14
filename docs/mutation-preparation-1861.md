# Source preparation timeout investigation

Issue: rust-js #1861. Review base:ef8807570597a4132d4442dd78315a7b39eaba06. The SDK milestone remains open.

The generator finished quickly. The runner was busy copying another workspace and noticed the finished child much later:

```text
runner                    generator child
  |---- start ----------->| starts after 21 ms
  | copy another tree     | finishes 4 ms later
  | copy / cleanup work   |
  | overdue timer fires   |
  |---- read exit --------| noticed after several seconds
```

The old timer could report a timeout even though the child exited successfully before its deadline.

## Measured evidence

The real ten-owner batch used the normal runner, controls, package aliases, generator and tests. Temporary observers recorded parent launch/observation and child preload/exit timestamps, CPU and exit metadata; they were removed afterward.

| Experiment | Result |
| --- | --- |
| Previous ordinary batch at 1 s | 7/10 caught, 3 inconclusive; about39 s |
| Actual fresh workspace, quiet | copy 1907 ms; generator 18 ms; exit 0 at unchanged1 s bound |
| Traced real batch at approved interim 20 s | 10/10 caught; about53 s; eight preparations launch 16–59 ms and reach exit 3–12 ms after preload |
| Parent delay in that trace | successful exit observed1–6239 ms later |
| Confirmation trace at old1 s | 6/10 caught; four false timeouts; about39 s |
| Those four children | exit 0 within 21–25 ms, no signal, owner loaded; parent observation 3388–7150 ms later |

The shorter inconclusive runs perform less proof work. They are not performance wins. These traces disprove generator CPU starvation for the observed cases; they do not establish an isolated throughput improvement.

## Review implementation

- The existing runner still owns selection, leases, test/build slots and verdicts. Its one workspace API is asynchronous.
- A worker owns the existing independent-copy, package-alias and disk-floor implementation. Existing caller slots bound the copies; there is no additional pool policy. The caller waits for worker exit so actual-load markers finish. Worker failures reject and partial trees are removed.
- The shared child owner allows one zero-delay timer turn to receive queued exits before recording its own timeout kill. The stronger isolated Bun-loop regression disproved a single setImmediate drain; only the timer drain remains.
- External signals remain distinct. A completion observed late without an owned kill produces observed-overdue metadata and a diagnostic. Check:fast shows that diagnostic with the job name even when the job passes.
- No preload is automatically installed, no new lifetime parameter is added, and no exact child lifetime is guessed from delayed parent observation. The outer command timeout still bounds a blocked parent.

## Completed validation

The independent core was checked on ef8807570597a4132d4442dd78315a7b39eaba06, with Intl/model changes and their P0 reproduction excluded. Both complete check:fast --all runs pass: before 7 min 29 s, after 6 min 33 s. Per-job test-name/status multisets preserve all 6,915 existing names, add five passing names and remove none; 344 baseline jobs and 345 after jobs all exit 0. The observed test lines are 6,469 pass/616 skip before and 6,474 pass/616 skip after, including repeated names; these local --all samples are not a nightly or CI recount. Six new/moved owner mutants are caught in the after gate (40 s); the three existing source-harness mutants are caught separately (about 10 s), nine of nine overall.

The timing difference is not an isolated speed-up: before starts with a 43 s build and 0 MB kept compiles, after with a 0.529 s build and 49 MB kept. Startup pruning changes from 43 s to 4.2 s. Recorded job CPU is 3,191 versus 3,127 core-seconds; cores average 84% versus 86% busy, under half busy 17% in both. The after crate sample takes 2 min 2 s versus 1 min 52 s before; its final typenum compile was active on one core. These are whole-gate/cache/contention costs, not generator execution times.

After the core check, the same ten Intl/model owner mutants run through the ordinary runner without tracing at the original underLoad(1_000) preparation bound: ten of ten caught in about 34 s, no inconclusive verdicts or observed-overrun warnings, template 1.7 s/91,377,664 bytes and peak workspace 91,381,760 bytes. The bound keeps a 1 s scheduling floor over the measured 21–25 ms launch-to-exit trace, scaled by load; the 20 s diagnostic allowance is removed. Workspace copying is outside preparation. Existing control/load/cleanup rules and all nine self-mutants remain in force. The full core gate used the interim 20 s bound; the final bound is proved by this ordinary ten-owner workload, not represented as another whole-gate run. No automatic preload, second deadline parameter or guessed child lifetime is introduced.

The independent upstream-review patch excludes Intl/model work and its P0 reproduction. The retained ordered SDK series applies the separate feature and owner-registration patches first, then this core fix. Temporary traces and outcome-capture edits are absent from the retained code. The fix awaits upstream review and landing; the combined Intl feature remains held for P0 #1840. The SDK milestone remains open.

The review artifacts are now separately rebased on84740d5 (including the published #1840/#1843 fix). The before/after measurements above retain their exact ef8807570 base. Upstream review/full landing checks on the newer base are in progress; the rebase is not another measured full run.
