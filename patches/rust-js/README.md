# Compiler patch series

Published base: bc26493ed327ea7e70219c6071776bfb04d9a5ac. series.json is the sole ordered active-patch list.

1899-unsafe-optional-call.patch is exported from local detached review commit e40d8c7. It preserves the safe helper and adds unsafe optional_call_unchecked for a final receiver-interface assertion. Ordinary method extraction, preceding path steps and safe optional calls remain checked. Existing js::cast is retained as the sole unchecked assertion API. There are no runtime class/realm checks.

The focused compiler run passes eight tests/35 assertions; the complete local check:fast --all passes in 403 seconds. All five affected owner mutants are caught. See docs/evidence/1899-validation.json and 1899-full-check.txt. Documentation/comments were updated after the gate; implementation and mutations did not change. The local review commit is not a published compiler revision; the gitlink remains the published base, and setup applies this exact patch idempotently.

#1867 is now upstream in the pinned base. Its duplicate patch is removed; historical proof remains in docs/evidence/1867-validation.json.

The composedClosest production change is unfinished because of generated-source gap #1902. Its separately stored port preview is not an active compiler patch. createDetails remains missing and has executable runtime/declaration contracts for the compiler team. No complete milestone or Pages deployment is claimed.
