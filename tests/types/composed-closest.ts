import {composedClosest} from "../../crates/core/src/foundation/platform/platform.js";

const button: HTMLButtonElement | null = composedClosest<HTMLButtonElement>(document.createTextNode("label"), "button");
const element: Element | null = composedClosest(document.body, "[role]");
// @ts-expect-error The result must be an Element subtype, as in the original.
composedClosest<string>(document.body, "button");
// @ts-expect-error A text node cannot be the generic result type.
composedClosest<Text>(document.body, "button");
void [button, element];
