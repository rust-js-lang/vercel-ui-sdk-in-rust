# Source provenance

Upstream: https://github.com/vercel-labs/ui

Pinned revision: `220c1a0d7278872286a620a8e4ee4210ca46f9bd`, upstream main when cloned on 2026-11-14. This is a reproducible baseline; it does not claim upstream will not advance.

Source checkout: `../vercel-ui`, read-only. The existing `../ui` checkout is a different project and is not this port's reference.

Upstream license: Apache License 2.0. LICENSE is retained verbatim. Rust translations are modifications/adaptations of the recorded source; file-level notices and the source map identify provenance. The rust-js submodule retains its own licensing.

`upstream.json` owns the revision. `scripts/upstream-inventory.ts` reads only Git-tracked source files from that checkout, checks its revision and records SHA-256 values. Package exports are taken from the pinned package manifests, not maintained as another editable API list.
