import {isBrowser, isIOS, isRTL} from "../../crates/core/src/foundation/platform/env.js";

const browser: boolean = isBrowser;
const ios: boolean = isIOS();
const rtl: boolean = isRTL(document.createElement("div"));
isRTL(null);
isRTL(undefined);
// @ts-expect-error The original API requires an input, even when it is undefined.
isRTL();
// @ts-expect-error Element input cannot be a string.
isRTL("element");
// @ts-expect-error Browser presence is a boolean, not a function.
isBrowser();
// @ts-expect-error iOS detection does not take a user agent argument.
isIOS("iPhone");
void [browser, ios, rtl];
