# Proposal: one TypeScript authority for JavaScript builtins

Status: approved by the compiler lead on 2026-11-15 under the user decision; no generator or dependency changes implemented by this document. Tracks rust-js #1903, #1904 and the SDK's week-info blocker #1831. Milestone one still requires the complete core, Web Components, docs/examples and verified Pages site.

## Evidence and immediate library selection

The private compiler's published base is 95b15e6. Its parser package already uses TypeScript 7.1.0-beta, while builtins/coverage.ts separately reads typescript-es 5.9.3 and restricts files to ES5 through ES2024. ADR0283 intentionally established that older arrangement; #1903 and #1904 explicitly authorize replacing it.

The local TypeScript clone's v7.0.2 library declares Intl.Locale.getWeekInfo and WeekInfo. Official npm metadata confirms typescript 7.0.2 exists. This is a verified target, not a claim about the earliest release containing the method.

A read-only probe of the installed 7.1.0-beta engine opened a project with lib: ["esnext"]. The program returned 94 default ES library files, including lib.esnext.intl.d.ts; getWeekInfo was present and legacy weekInfo absent. These files are supplied by the engine's platform package. Guessing a top-level node_modules/typescript/lib directory would select the wrong location.

Proposed #1903 implementation:

1. Extend the existing @rust-js/typescript session with explicit library selection. Existing open(files) callers retain noLib behavior; open(files, {lib:["esnext"]}) asks the same engine for its standard library graph.
2. Expose that program's default-library filenames through session.libraries(), using TypeScript's own default-library classification. Read their declarations through the existing session.read operation.
3. Use this one session/library selection for both member coverage and argument-union conformance. Remove the old year regex and the typescript-es dependency. The parser's existing exact pin becomes the library pin too, already satisfying the approved 7.0.2+ minimum.
4. Keep definitions as the single update command. Its metadata requests must run through Bun, preserving its existing release cool-off and approved release channels. Include the builtins regeneration/coverage report as well as the required webapi and existing React-port checks. Do not silently bless removed members.

The lead approved this approach. One condition remains for implementation: test a stable 7.x parser first and use it if compatible. Retain the beta only if the canonical parser API needs it, with the precise compatibility evidence in an ADR. The single pin must govern both parser and library.

## Generation boundary

    pinned TypeScript engine
             |
             v
    native default-library graph
             |
             v
    @rust-js/typescript declaration model
             |
             v
    builtin normalization + semantic policy
             |
             v
    canonical Rust binding representation
             |
             +-- Rust declarations
             +-- source/provenance and unrepresented cases
             +-- coverage + generated native/TS callers

Discover native constructor/namespace roots and their reachable types from that graph. The hand policy may exclude operations Rust std already owns; it must not hide a newly added native root by retaining the old SCOPE list. Every newly visible unsupported root/member remains in the coverage report with its blocking issue.

TypeScript owns member names, overloads, generic constraints, argument/result types, optionality, readonly fields, inheritance and literal unions. No handwritten list repeats those signatures. Normalization combines the declarations TypeScript merges, including namespace/interface/constructor fragments and referenced libraries; it preserves overload relationships and computed symbol keys.

The compiler's existing binding rules own their Rust/JS meaning. Generation consumes them rather than inventing a second convention. In particular, reuse the argument-union forms from #1830/#1834, the present and none_undefined contracts, canonical native numbers, class/interface relations, callback forms and throwing-result representation. Shared naming stays in scripts/rust-names. If a general binding-rendering rule is duplicated with the webapi generator, move that rule to one owner and migrate both consumers in the same change; do not create a third copy or rewrite unrelated WebIDL normalization.

The generator must not turn TypeScript's unrepresentable conditional, mapped or dependent generic forms into any, narrow an overload, omit undefined, invent runtime checks, or silently drop a member. An unsupported selected declaration is reported with its exact declaration/source and the missing compiler capability. Add the failing case and fix that owner before claiming the corresponding API generated.

## What remains specified by hand

TypeScript does not describe all runtime semantics or rust-js's Rust boundary. A small explicit policy owns only those facts:

- Which JavaScript operations are already supplied by Rust std, so native Array/String/Map operations do not acquire competing bindings.
- Which operations can throw and are represented by Result, and which native callable constructors retain their callable behavior. These facts come from the existing semantic owners and standards, not an inferred TypeScript signature.
- Native borrowing/lifetime, numeric and identity representation where TypeScript has no Rust equivalent. Representation choices must preserve all source argument/result cases.
- Rust-specific intrinsic APIs such as method, optional_call, optional_call_unchecked, cast, JSX and interop traits. They have no TypeScript library function to generate.
- Stable Rust naming decisions for distinct established constructor jobs and documented compatibility decisions. This cannot become another member/signature catalog or a reason to retain aliases.

Each policy entry identifies the fact missing from TypeScript, its owner and proof. No entry may override a declared union, optional key or overload merely to make lowering easier. JsError-to-unknown (#1905) and callback parameter naming (#1906) remain their assigned owners' work; generation consumes their final contracts.

## Type mapping and difficult cases

Required versus optional is independent of whether a value may be undefined. Required slots use the present contract; undefined-only native results use none_undefined; null remains a separate native representation. Preserve readonly results and own-key behavior. An Option must not make a required parameter optional by accident.

String-literal unions and mixed argument unions derive from the declaration graph. Generic and overload relationships use the existing typed native argument/associated-result machinery where it expresses the complete input set. If it cannot, extend that machinery first. Do not flatten correlated parameters into independent broad unions or reduce callback arity.

Known native classes and records retain their public TypeScript identities, inheritance and generics. Calls read properties and methods with the original receiver/evaluation behavior. An unchecked generic promise is explicit unsafe Rust under the user's approved policy; generation does not insert instanceof checks or assert a stronger result interface than the source promises.

The SDK's legacy weekInfo fallback illustrates the boundary: the pinned library declares getWeekInfo but not weekInfo. Generate the real standard method/result. The original SDK's private legacy record assertion remains an explicit app boundary, preserving its firstDay-only promise. Do not manufacture an extra standard member in a handwritten binding table.

## Migration and proof

First establish the engine-backed library owner and report the complete coverage delta, without disguising newly visible ESNext gaps. Run definitions and inspect every generated js-crate/webapi change.

After design approval, migrate vertically: Intl.Locale and the week-info result first, then the rest of Intl, typed arrays/buffers, errors and the remaining standard builtins. For each migrated group, delete its old member-spec generator/declarations as the generated owner takes over. Other groups retain their existing authority until migrated; no member has two authorities at any point. Complete migration requires removing all old handwritten standard-member specifications, not stopping after Locale.

Retain the current Rust API where it accurately represents the source. Before changing an established constructor or generic surface, compare native Rust callers, generated JavaScript and strict TypeScript declarations; bring unavoidable public changes to the lead. Do not preserve two APIs as a migration convenience.

Proof must include deterministic regeneration, a clean-checkout no-diff rerun, provenance/library hashes, full member and argument/result coverage deltas, real Rust callers derived from the library graph, independent strict TypeScript callers, and Bun/Chromium behavior for actual native APIs. Include property/getter ordering, thrown identity, optional/missing/null behavior, overload correlation, symbol keys, and generic/Promise contracts. Mutation tests must catch lost union alternatives and weakened required/optional rules. Existing webapi output remains unchanged unless a reviewed source or shared rule change requires it.

Run the complete compiler gate and affected mutations before landing. Adopt the published compiler revision in the SDK, remove obsolete retained patches, then resume and verify the stopped port. A generator file or a green member-name coverage percentage alone does not prove signature or behavior fidelity.

## New audit findings awaiting implementation review

#1912 fixes computed symbol keys in the declaration reader, with a canonical
inventory formatter consumed by browser coverage; its independent patch is
inactive pending the full gate. #1914 shows that Rust-owned operations can
still require a distinct host-native boundary: native non-locale String case
conversion follows the host’s Unicode tables, while Rust correctly follows
the toolchain’s. The generator policy must distinguish these jobs rather than
exclude the host operation as an equivalent, use locale-sensitive substitutes,
or add a second handwritten standard-member catalog. Concrete Locale API
corrections and stable-versus-beta updater policy remain with the lead for
pre-review; no established Rust API is changed by this proposal update.
