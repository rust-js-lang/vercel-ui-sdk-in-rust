# Implementation plan

## Scope and order

Upstream is vercel-labs/ui at 220c1a0d7278872286a620a8e4ee4210ca46f9bd, Apache-2.0. The initial inventory contains 389 core source files, 121 web source files, 167 docs application/configuration files, 125 shared/core/web documentation content files, 587 web example files and 61 example style files. Another 292 framework documentation files and the original reference-test inventory are retained in the audit baseline, with deferred work distinguished from milestone-one scope.

These counts describe the source checkout. They are not a promise of one Rust file per TypeScript file and are not completed-port counts. Public export maps and behavior contracts determine coverage.

### 0. Establish the port

- Create the public rust-js-lang/vercel-ui-sdk-in-rust repository on main.
- Preserve Apache license and notices; pin upstream source and an isolated rust-js Git submodule.
- Generate the source/export inventory and begin an evidence-backed port map.
- Establish native Rust, compiled-Rust and direct upstream differential tests before expanding the implementation.
- Keep the vgpu project paused and its existing work untouched.

### 1. Core foundations

- Port numeric/date/text/color/image logic and test boundary values against the original implementations.
- Port the complete kernel: state, equality/identity, follows/views, change reasons and cancellation, lifecycle, controllers, parts, binding, roles/ARIA, live state, selection fanout and history.
- Preserve JS distinctions such as missing versus null, signed zero/NaN, UTF-16 and native Number/Intl semantics at the JS boundary. Do not substitute an approximately equivalent Rust operation.
- Port shared platform work: document/window ownership, DOM ordering, modality, announcements, layers, positioning and shortcuts.

### 2. Behaviors and core components

- Port shared focus/selection/list engines, forms, disclosure, gauges, motion/gestures, direct manipulation, drag and drop, popups, canvas, dates and text.
- Port each component family through its complete state, API, slots, ARIA/data/CSS contracts, controllers and cleanup. Use the upstream export inventory to prevent omissions.
- Port page services: agents/snapshot/act, observe, history, overlays and shortcuts, plus renderer and testing exports.
- Keep the original shared-engine boundaries and lazy-loading/development-only contracts.

### 3. Web Components

- Implement the generic createParts/definePart adapter and schema conversion without importing individual core components into it.
- Implement wrapped targets, property reflection, callbacks as events, form internals, custom element registration, upgrade ordering, reconnect/disconnect and disposal.
- Port all core-backed web parts and per-component entry points. Keep the root side-effect-free and per-entry registrations faithful.
- Verify real custom elements against upstream in Playwright, including nested/shadow DOM, browser-native controls, events, focus, RTL, forms and server-safe imports.

### 4. Documentation and examples

- Port the docs shell, navigation, preferences, search, source/API tables, code presentation and deferred live previews to Rust/rust-js.
- Retain the original information/content/style contracts and adapt executable examples to the actual Rust APIs. Every shipped interactive Web example must use the ported SDK.
- Derive references/custom element metadata from implemented definitions and declarations. Retain Markdown and agent-readable documentation routes.
- Generate static routes, content and search indexes for Pages. Verify repository-base URLs, direct-route reloads, anchors, theme/RTL/mobile behavior, example cleanup and all core/Web doc links.
- Mark React as the next SDK phase and other frameworks as future work; do not run their upstream adapters as a substitute for a port.

### 5. Publish the first milestone

- Audit every in-scope source/export/behavior/example/documentation route against authoritative code and proof. A port map entry alone is insufficient.
- Run meaningful native, compiled and browser tests locally; compare generated JavaScript with upstream and inspect desktop/mobile, theme and RTL output.
- Add a build/deploy-only Pages workflow with current action releases pinned to full hashes. Enable workflow-based Pages using gh.
- Publish a production build and verify the actual public docs, deep links, assets, search and live examples.
- Record the source pin, compiler gitlink, retained patches/issues, test results, screenshots and any explicitly accepted differences. Keep the milestone open while any required item remains incomplete or unverified.

## Later phases

After milestone one: port the React SDK adapter with its concurrent rendering, SSR/hydration, StrictMode, event, ref and state-reading contracts. Vue, Svelte, Solid and other framework adapters remain future work.

## Compiler feedback loop

For each encountered rust-js gap: add a failing regression, file a generic issue with gh, communicate through agent-hub, apply a reviewed local fix in this project's submodule where possible, and retain a reproducible issue-linked patch. Adopt published upstream commits and remove obsolete patches. Never modify another session's shared compiler checkout. Check hub messages regularly during active work and before upgrades/checkpoints.

## Completion gates

| Requirement | Evidence required |
| --- | --- |
| Public repository | gh verifies rust-js-lang/vercel-ui-sdk-in-rust is public and main contains the intended checkpoints |
| Licensing/provenance | retained license/notices, exact upstream and compiler pins, source/hash audit |
| Core | complete export/behavior audit and meaningful native/reference tests |
| Web Components | complete entry/tag/property/event audit and actual browser interaction/lifecycle comparisons |
| Docs | complete in-scope route/content/example audit, Rust application/runtime graph, working static search/Markdown routes |
| Pages | verified deployment plus actual public deep links and working live examples |
| Scope honesty | React and other deferred adapters are not presented as implemented |

No unresolved user preference blocks the initial work. API/hosting decisions discovered during implementation will be resolved from source contracts and tested evidence.
