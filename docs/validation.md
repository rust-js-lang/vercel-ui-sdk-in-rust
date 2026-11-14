# Validation checkpoint

2026-11-14. The first milestone is **not complete**. Web Components and the docs site are not implemented or deployed yet.

The public repository is rust-js-lang/vercel-ui-sdk-in-rust. Upstream is pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, with its Apache-2.0 license retained verbatim. The compiler is published rust-js 6c57c0d61e4af0fa84db16ea6ac8398840cf1d6b; this checkpoint has no downstream compiler patch. The workspace toolchain symlinks to the compiler's toolchain file so it cannot silently drift.

Implemented exports cover clamp/wrap, rubber-band resistance/inverse/slope, analytic spring solving/settling/CSS easing, and physical/logical side mapping. The remaining exports of number/steps.ts are still pending.

| Check | Result |
| --- | --- |
| Pinned source/export inventory | 2,611 tracked files hashed |
| Rust/rust-js build | passes |
| Native Rust invariants | 8 pass |
| Same invariants compiled to JS, run by Bun | 8 pass |
| Actual upstream differential checks | 10 tests, 86,241 assertions |
| Strict rust-js-aware Clippy | passes with -D warnings |
| Rust formatting | passes |

Numeric comparisons use the actual pinned TypeScript implementation and Object.is, so NaN and signed zero are checked without tolerance. The matrices include infinities, reversed/equal bounds, subnormal values, large magnitudes and exceptional spring parameters. Springs cover underdamped, critically damped and overdamped regimes, the branch threshold, exact CSS samples, settling defaults/limits and callback/getter evaluation order. RTL checks cover every side and both writing directions.

Native invariants cover wrap behavior, resisted travel, the rubber-band derivative, spring initial conditions/rest, settling that requires both position and velocity, and logical side resolution. Browser tests will be added with the DOM/Web implementation; these pure functions do not constitute browser coverage.

Generated JavaScript was compared with each original source. Arithmetic order and comparison branches are preserved. Rust's spring closure records become JavaScript objects of callable properties, with no sampling allocation. JS numeric text is explicitly requested with js::shown, preserving NaN, signed zero and exponent formatting without invoking Number.prototype.toString; a regression mutates that prototype method to prove the distinction. clamp and rubber-band inverse deliberately use native JS math where Rust floating-point min/max treat NaN differently. Defaults use Option at the JS boundary. Side enums emit the original string values.

## Pending compiler feedback

The next modules remain work in progress rather than shipped checkpoint exports:

- [#1812](https://github.com/rust-js-lang/rust-js/issues/1812): borrowed Math function capture timing; a failing scaling regression is retained locally.
- [#1813](https://github.com/rust-js-lang/rust-js/issues/1813): canonical Number formatting bindings required for numeric stepping.
- [#1814](https://github.com/rust-js-lang/rust-js/issues/1814): slice search output and proven bounds, found in release projection.
- [#1815](https://github.com/rust-js-lang/rust-js/issues/1815): private undo history borrow guards and index output.
- [#1816](https://github.com/rust-js-lang/rust-js/issues/1816): undo settings Rc union accepted by library build but refused by compiled test build.

The compiler team owns these upstream fixes through agent-hub. The port does not weaken tests, substitute local bindings, or change Rust iterators to hide lowering gaps. Numerical parity alone does not close a generated-output audit.

The cold compiler build took 1m50s; subsequent compiler checks take roughly 0.3–0.7s. Tests stay local. No placeholder deployment counts as documentation completion. Complete core, kernel, behaviors, components, Web tags/events, live examples, docs application and Pages verification remain open in implementation-plan.md.
