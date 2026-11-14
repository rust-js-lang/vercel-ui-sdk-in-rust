# Compiler fixes

The Git submodule pins published rust-js; setup applies the issue-linked patch below. Rust application source does not work around compiler gaps.

- [#1827](https://github.com/rust-js-lang/rust-js/issues/1827): all six Ordering predicates and function values, extending the existing numeric representation. Patch base: c3c62cccd7562126e7b27e40f8b0c6fbc37aba14.
- Proof: native/program/library/production corpus comparison passes; three semantic mutations caught; compiler TypeScript typecheck passes. Calendar source compiles and passes 2,588 upstream comparisons. Full SDK still blocked by #1820.
- Upstream lead owns final full check and publication. Remove patch and setup hook after adopting the published fix; never silently skip a patch mismatch.

Apply with `bun scripts/apply-compiler-patches.ts` (idempotent, fails on a mismatch). The paused vgpu port's patches are not copied here.
