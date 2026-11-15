# Architecture

The first milestone is a real core/Web Components SDK with usable documentation, not a visual demonstration of a few controls. The source pin and complete upstream export maps live in upstream.json and docs/upstream-inventory.json.

## Package boundaries

```text
                    Rust application code
                           |
                    ui-sdk-core
           +---------------+----------------+
           |               |                |
         kernel         behaviors       page services
    state/lifecycle     focus/lists     agents/history/
    parts/controllers   forms/popups    overlays/shortcuts
           |               |                |
           +---------------+----------------+
                           |
                     ui-sdk-web
            custom elements / generic adapter
              attributes, properties, events
                           |
                   Rust docs application
                 live Rust/Web examples
                           |
            pinned rust-js -> ES modules -> Vite
                           |
                    GitHub Pages
```

- Core follows the original dependency direction: kernel, platform, behavior families, component behavior, page services. A shared engine remains shared; component-specific behavior does not move into the generic adapter.
- Web owns custom element registration, wrapping native elements, schema-driven properties/attributes/events, connection/reconnection, binding and disposal. Original tag names and registration side effects remain part of the contract. The root entry must remain safe on a server and have no registration side effects.
- Documentation owns navigation, source/API presentation, search, preferences and example loading. Its live examples use the ported core/Web packages. Prose, CSS and media may stay in their original formats. Application and example behavior is Rust, not an import of the original TypeScript SDK.
- The React adapter is a later phase. Implementing the docs does not count as porting that SDK adapter. Vue, Svelte, Solid and other adapters remain explicitly deferred.
- Build-time scripts use Bun. Any compiler support required at runtime must be included in package artifacts; consumers must not install another UI runtime to replace the original zero-dependency contract.

## Behavior that must survive

State snapshots and identity, controlled/uncontrolled ownership, listener order and reentrancy, live keys that avoid rendering, lifecycle keep/release/destroy, cancellation and complete cleanup are correctness requirements.

DOM contracts include keyboard and pointer behavior, composition/IME, focus recovery and trapping, native button/link/input semantics, ARIA, data attributes, CSS variables, RTL, disabled/read-only states, forms, nested popups, portals and shadow roots. Importing without browser globals must remain safe wherever upstream supports it.

Web registration preserves the ui- prefix, per-entry imports, first-definition-wins behavior and diagnostics. Change events retain their detail, cancellation, composed/non-bubbling behavior and timing. A custom element cannot be replaced by a screenshot or an unrelated framework component.

Rust APIs should be idiomatic while representing the same capabilities. JS-boundary types preserve native values, optionality, unions and exceptions. Representation decisions need a focused native/reference test and a recorded reason; unsupported compiler behavior is fixed or clearly refused, not hidden behind casts, stand-in bindings or application rewrites.

## Unchecked upstream type promises

User decision, 2026-11-15: preserve the original JavaScript behavior and use
explicit unsafe Rust entry points for its unchecked type assertions. Do not
insert runtime class/realm checks or narrow the original JavaScript callers.
The Rust safety contract states which native interface or reason/event
relationship the caller must guarantee. This applies to generic selector
results, asserted focused elements and the change-details constructor.

These assertions implement the original boundary contract; they are not a
way to hide missing compiler support. Typed generic record construction,
own accessors and conditional declarations still require the canonical
compiler/bindings representation.

The compiler lead confirmed on 2026-11-15 that the existing stack-overflow abort guards around observable scope restoration remain accepted generated output. Rust aborts after a stack overflow; a bare JavaScript finally could restore state and continue. ADR0262 therefore requires the guards because results change. This is no new semantic exception and does not approve unrelated source differences. Scope-guard issue #1833 targets conservative throwing classification while retaining that machinery.

## Proof and provenance

The checked-in inventory is derived from the upstream Git-tracked files and manifests. It includes source hashes and distinguishes core, web, documentation, deferred framework documentation, web examples, styles and reference tests. It is evidence of scope, not proof of implementation.

The port map records actual Rust or retained-asset destinations and their validation evidence. An unmapped source or export remains open. Generated manifests, type declarations and documentation tables derive from their owners rather than becoming competing editable catalogs.

Native Rust tests cover pure logic. Compiled-Rust differential tests call the actual pinned upstream functions. Playwright compares original and ported Web Components through the same interaction traces, including accessibility/focus, events, lifecycle, RTL, forms, shadow DOM, SSR imports and cleanup. Exact semantic assertions remain separate from screenshots.

## Documentation hosting

GitHub Pages serves a static production build below the repository base path. Replace server-only delivery mechanisms with build-time content/index generation and static routes; preserve the resulting content and interactions. Direct links, reloads, fragments, assets, search, examples and Markdown/agent endpoints need verification on the actual deployed site.

Core, shared getting-started/agent/guide content and Web Components documentation ship with milestone one. Other framework material must clearly reflect its deferred implementation; their adapters are not silently pulled into the runtime to make examples appear ported.

Pages Actions build and deploy only. Tests run locally. Action versions are verified when the workflow is written and pinned to complete commit hashes. No deployment is marked successful solely from an Action status: the public routes and examples must work.
