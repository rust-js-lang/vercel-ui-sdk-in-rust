# createDetails: compiler binding contract

Reference: pinned vercel-labs/ui 220c1a0, packages/core/src/foundation/kernel/details.ts. This is a compiler-design input, not a claim that the constructor is implemented.

The user explicitly approved preserving unchecked JavaScript behavior through unsafe Rust entry points on 2026-11-15. The original constructor accepts a keyboard reason with a MouseEvent and asserts the resulting event type. Do not insert runtime event checks or narrow the JavaScript declaration.

Required type behavior:

- A const generic Given extends { reason: string; event?: Event } retains literal reasons, readonly extra fields, symbols and their types.
- Cancelable extends boolean defaults to true. True produces ChangeDetails<Given["reason"]>; false produces CommitDetails<Given["reason"]>; a boolean variable produces their conditional union.
- Intersect that conditional result with Omit<Given, "reason" | "event" | "source">. Extra fields named cancel/canceled survive in false mode; true mode overwrites them at runtime, as the original does.
- EventOf maps each original ReasonVocabulary key to its original DOM event union; unknown reasons use Event. Distributive ChangeDetails/CommitDetails permit reason-based event narrowing.
- Preserve all original exported aliases, defaults, optional keys, readonly canceled and the isDismissal type predicate. The vocabulary must have one semantic source, not a hand-maintained duplicate.

Required runtime body:

    if (!cancelable) return { ...given, source }
    let canceled = false
    return {
      ...given,
      source,
      cancel: () => { canceled = true },
      get canceled() { return canceled },
    }

The Rust function must be unsafe where it asserts unchecked input/result relationships. Its JavaScript and declaration must retain this original ABI.

Spread must use JavaScript own enumerable properties, including symbols, in the original order. It must not read inherited or nonenumerable properties. Input getters and Proxy ownKeys/getOwnPropertyDescriptor/get traps run in exactly the original order, including keys overwritten later. Preserve thrown values unchanged. Do not mutate given. A missing event stays absent; an own undefined event stays an own key.

The canceled property is a live own enumerable configurable accessor with no setter. cancel is detachable, idempotent and independent per returned object. Spreading details snapshots canceled at the time of the spread.

Executable contracts in this repository:

- tests/change-details.test.ts: complete runtime export audit, original contract sanity, compiled/reference comparisons, getter and Proxy trace comparisons, descriptors and cancellation.
- tests/types/change-details.ts, instantiated through tests/declarations.test.ts: equality of all aliases, constructor assignability both ways, literal inference, reason narrowing and negative cases.

The original runtime and strict declaration fixtures pass. Compiled fixtures currently fail because createDetails and several aliases are missing. No replacement implementation or handwritten JavaScript binding has been added.
