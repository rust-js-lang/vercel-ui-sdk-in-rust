# Source preparation timeout investigation

Issue: rust-js #1861. Review base:5685772b30db24db7bad00bc58ed37dd33106091. The SDK milestone remains open.

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

Focused validation passes seven workspace tests, four child tests and the real passing-job diagnostic test:12 tests, 68 assertions in separate runs. Typecheck passes. Four new source-owner mutants are registered for the deadline/signal/diagnostic rules; their proof is pending. The two filesystem isolation mutants move with their owner.

The interim 20 s preparation limit remains unchanged in this review checkpoint. Required next evidence: the whole suite before/after with individual test outcomes, the same ordinary ten-owner workload after the fix, all changed owner mutants, measured wall/CPU costs and a justified final deadline. The issue is not closed, the fix is not presented as fully validated, and the combined Intl feature remains held for separate P0#1840.
