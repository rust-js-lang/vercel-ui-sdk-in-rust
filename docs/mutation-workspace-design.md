# Proposed isolated source-owner mutations (#1848)

Status: design for lead review; not implemented. Extend the existing mutation runner, not a second runner.

Keep Rust compiler batch/schema execution unchanged. Non-crate owners run through the same selection, leases, controls, verdict and CI entry point, using an isolated tracked-source test workspace. A list names one real repository source file; validation checks existence and per-list ownership rather than assuming src/<list>.

Build an unchanged workspace template from the current tracked working tree, including the private patch. For each active mutant, create independent copies of writable sources, applying only its mutation; never hard-link files that can be rewritten. Prefer filesystem copy-on-write where available, with the same correctness under normal copies. Third-party installed dependencies may be shared read-only. Workspace package aliases must resolve to workspace copies, derived from the existing workspace/package manifests rather than another catalog. Test files are also workspace copies, so relative imports reach the mutated source.

Run controls through the identical workspace/package setup. Select the workspace printer explicitly through the existing RUST_JS_TYPESCRIPT contract so inherited environment cannot silently use the original module. Source generators must actually run before their changed output is compiled: add a real generator/output contract test or use the established generation prerequisite, not an ad hoc mutation-only source rewrite. That exact prerequisite is part of review before implementation.

Retain ownRuntime and each test run's separate target under target/mutants. Allocate workspace execution within the existing ADR1146 lease and beside concurrency budget, without an extra worker pool. Each running mutant owns its sources until its tests finish; reuse a template, never overwrite sources used by another active test. Cleanup belongs in the runner's normal/failure/signal path.

Measure unchanged control cost, template creation, warm clone/setup, generator prerequisite, per-mutant tests and peak disk/memory. No cost estimate is presented as measured. Reject a mutant whose source was not executed, a failing control, or a timeout as inconclusive; preserve existing caught/survived rules.

Acceptance starts with the concrete owner mutants in patches/rust-js/model-review.md: parser, printer, Member guard, constructor inventories and generated Intl membership/options narrowing. Prove controls pass and each mutant is caught by its actual test through the normal runner. Then run the affected runner tests and full check, documenting measured costs in the dev-loop ledger.
