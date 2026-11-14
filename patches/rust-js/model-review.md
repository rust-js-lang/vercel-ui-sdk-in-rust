# Shared TypeScript Member review

Private review base:5685772b30db24db7bad00bc58ed37dd33106091. Recorded focused compiler proof below belongs to the earlier e9f75c3 checkpoint; the separate1861 core review has its own focused checks and pending whole-suite comparison. This review is not yet cleared for upstream landing. The revised full check remains pending; P0#1840 holds Intl landing. The durable non-crate owner harness #1848 is now published and adopted; its private implementation copy is removed.

## Model and all consumers

- typescript/index.js owns Member, readMember, member, nested object/interface decoding and printing. construct carries typeParameters/params/returns. The factory prints construct signatures separately from methods named new and class constructors. checkedMembers rejects unknown discriminants, preserving the caller input type.
- builtins/coverage.ts consumes construct signatures for constructor/member inventory and all Intl argument sites. It uses checkedMembers before selecting method/property/construct forms; no source-text constructor regex remains.
- webapi/coverage.ts consumes construct for constructor inventory. Interface members, numeric indexes and typescriptEventMaps all use checkedMembers; only their stated property/method/index kinds contribute to their respective metadata. WebIDL definitions in the same file are a different model and are unchanged.
- react/generate.ts validates Member arrays; attribute/CSS selection explicitly keeps properties and ignores construct. Intrinsic iteration now explicitly selects properties too.
- react/attributes.ts validates inherited/own props and intrinsic fields; properties feed attributes, construct is skipped.
- react/literals.ts validates interfaces and intrinsic fields; only properties contribute literals.
- node/coverage.ts validates object/interface members; only named methods/properties contribute exports, construct is skipped.
- next/coverage.ts validates object/interface members and selects named properties/methods; its class-member model is separate and unchanged.
- next/generate-fonts.ts validates option members and selects properties; construct is skipped.
- react/coverage.ts reads declaration names, not Member kinds; no Member migration applies.
- src/typescript.rs and src/program.rs transport serialized JSON to the printer, not decoded TypeScript Member reader results.
- src/lower/declarations and its dictionaries/functions/namespaces/structures/enums/globals modules produce existing property/method/index JSON. Their class producer translates its own generated fields into the separate ClassMember protocol. No construct Member producer is introduced in Rust.
- src/lower/declarations/written.rs parses rust_js::types text into its own Rust Member enum; it does not consume the TypeScript bridge model. No change here.
- tooling/cargo.js resolves the printer module and includes it in build provenance; it does not interpret members. Packaging/qualification scripts carry the package rather than read Member kinds.
- test/typescript.test.ts checks structured generic/optional/rest constructors in interfaces and nested objects, quoted new methods, exact round trips, and unknown-kind rejection by both checkedMembers and printer. Other consumer tests use their normal coverage/generator paths.

## Proof so far

Revised model and Intl suites:10 pass326 assertions, Bun/Chromium native comparison, strict TypeScript consumer, Rust nonmember rejection and more than 200 derived accepted calls across26 sites. Typecheck passes. The constructor regression failed before implementation; expanded coverage caught a real RelativeTimeFormat supportedLocalesOf options mismatch before correction.

The lead split isolated non-crate owner mutation execution into dev-loop issue #1848, owned here. Intl may land after #1840 without waiting for that harness. Intended durable owner mutations, to register and prove caught under #1848:

- typescript/index.js: omit ConstructSignature decoding; print a construct as a call signature; accept an unknown checkedMembers discriminant. Each must fail the construct/protocol round-trip regression.
- builtins/coverage.ts and webapi/coverage.ts: omit construct recognition from constructor inventory. Their actual inventory/coverage ratchets must fail.
- builtins/intl.ts: remove Locale from locale input membership; remove Date/number or bigint range membership; narrow a full supportedLocalesOf options type to matcher-only. Regenerate in the isolated workspace and compile the source-derived argument callers; each must fail.

No fake registry or README-only mutation proof is claimed. The unchanged controls, mutated generator preparation, package aliases, printer-module selection, leases and per-test target isolation must be validated by the existing runner under #1848.

## Current owner proof

The published #1848 core is adopted via e9f75c3. Its five safety mutants and full checks are upstream evidence. Current combined Intl/model/registry/workspace focused suites pass 35 tests / 42,896 assertions. The ten dependent feature-owner registrations are retained in their own patch.

Current actual owner batch catches 7 of 10; three generator preparations time out at 1 s and are INCONCLUSIVE under #1861. No larger-deadline retry was made. A quiet actual-workspace diagnostic measures 18 ms preparation after 1907 ms copying, so the concurrent failure still needs diagnosis. All workspaces are cleaned.

The previous 15 of 15 combined private proof and 7 m 57 s independent-core full check belong to their recorded 4652 base, before the new preparation deadline. They do not establish current owner-batch success or validate the held Intl feature against P0#1840.
