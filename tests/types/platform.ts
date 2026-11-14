import {activeElement, ariaKeyshortcuts, composedContains, composedHops, formatShortcut, hasCommandModifier, initialApple, isApple, matchesShortcut, portalTarget, prefersReducedMotion, setPlatform, supportsTopLayer} from "../../crates/core/src/foundation/platform/platform.js";

const element: HTMLElement | null = activeElement();
activeElement(document);
const container: Element | DocumentFragment | null = portalTarget(document.createDocumentFragment());
portalTarget(document.body);
portalTarget(null);
portalTarget(undefined);
const hops: Node[] = composedHops(document.createTextNode("label"));
const contained: boolean = composedContains(document.body, document.createTextNode("label"));
const key: string = ariaKeyshortcuts("mod+k", false);
const label: string = formatShortcut("mod+k");
const command: boolean = hasCommandModifier("alt+k");
const initial: boolean = initialApple();
const apple: boolean = isApple();
const motion: boolean = prefersReducedMotion();
const top: boolean = supportsTopLayer();
const match: boolean = matchesShortcut(new KeyboardEvent("keydown"), "mod+k", true);
setPlatform("apple"); setPlatform("other");
// @ts-expect-error Only the original platform choices are accepted.
setPlatform("linux");
// @ts-expect-error Event must be a keyboard event.
matchesShortcut(new Event("keydown"), "mod+k");
// @ts-expect-error Strings cannot be portal containers.
portalTarget("body");
// @ts-expect-error Nodes cannot be shortcut labels.
formatShortcut(document.body);
void [element,container,hops,contained,key,label,command,initial,apple,motion,top,match];
