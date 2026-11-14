# Working on this port

Use idiomatic Rust and rust-js. Keep behavior faithful to the pinned vercel-labs/ui source. Source is read from the adjacent local clone, never edited there. Read UPSTREAM.md and docs/implementation-plan.md before changing port scope.

Milestone one is the complete core and Web Components packages plus their Rust/rust-js docs and live examples on GitHub Pages. React is the next phase; other framework adapters are deferred. Do not count a few demonstrations, a manifest, a green build or a deployed placeholder as milestone completion.

Rust owns library, DOM and documentation application behavior. Do not re-export or wrap the original SDK runtime, add stand-in browser bindings, or change valid Rust to hide compiler gaps. Keep original accessibility, keyboard/pointer behavior, focus, identity, event ordering, cancellation, cleanup, RTL and SSR contracts. Preserve assets and Apache notices.

When a compiler or binding gap appears, add a failing regression, file a generic issue with gh, relay it to m3-max through agent-hub, patch this private compiler submodule if needed, and retain a reproducible issue-linked patch. Never modify the shared rust-js checkout or the paused vgpu project. Check the hub regularly during active work and before compiler updates/checkpoints.

Use Bun/Bunx and GitHub CLI. Every shell command has a fitting timeout. Keep tests local; Pages Actions only build/deploy and use current releases pinned to complete commit hashes. Test compiled Rust against actual upstream functions and DOM behavior; add native Rust tests for pure logic. Check exports, source coverage and actual deployed routes as well as test results.

Work on main and push reviewable checkpoints. Commit prefixes: feat(ui-sdk), fix(ui-sdk), perf(ui-sdk), chore(ui-sdk). Include Co-Authored-By: Codex <codex@openai.com>. One agent per machine; no local subagents.
