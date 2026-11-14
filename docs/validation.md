# Validation checkpoint

2026-11-14. The first milestone is **not complete**. Web Components and the docs site are not implemented or deployed yet.

The public repository is rust-js-lang/vercel-ui-sdk-in-rust. Upstream is pinned at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, with its Apache-2.0 license retained verbatim. The compiler is published rust-js 6c57c0d61e4af0fa84db16ea6ac8398840cf1d6b; this project has no downstream compiler patch. The workspace toolchain symlinks to the compiler's toolchain file so it cannot silently drift.

The first implemented core exports are clamp and wrap from foundation/number/steps.ts. The remaining exports of that source module are still pending. Generated JavaScript was inspected against the original: clamp is the same nested Math.min/Math.max call, and wrap preserves the same remainder expression and invalid-span behavior.

| Check | Result |
| --- | --- |
| Pinned source/export inventory | 2,611 tracked files hashed; check passes |
| Rust/rust-js build | passes |
| Native Rust wrap invariants | 3 pass |
| Same invariants compiled to JS, run by Bun | 3 pass |
| Actual upstream differential checks | 2 tests pass, 6,750 numeric comparisons |
| Strict rust-js-aware Clippy | passes with -D warnings |
| Rust formatting | passes |

Numeric comparisons use the actual pinned TypeScript implementation and Object.is, so NaN and signed zero are checked without tolerance. The matrix includes infinities, reversed/equal bounds, subnormal values and very large magnitudes. Native Rust tests separately cover wrap direction, excluded upper bounds, invalid spans and non-finite inputs. clamp intentionally calls native JS math at the boundary because Rust's floating-point min/max have different NaN behavior.

The cold compiler build took 1m50s. Its cached rebuild check took about 0.3–0.4s; compiled tests then ran in Bun. No tests run in GitHub Actions, and no placeholder deployment is counted as documentation completion.

The port map marks the source module partial. The remaining core exports, kernel, behaviors, components, web adapter/tags/events, live examples, docs application and Pages verification remain open as described in implementation-plan.md.
