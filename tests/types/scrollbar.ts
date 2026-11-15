import {onScrollbar, pressedScrollbar} from "../../crates/core/src/foundation/platform/scrollbar.js";
const rail: boolean = onScrollbar({x: 15.5, y: 8}, {
  width: 100, height: 80, clientLeft: 17, clientTop: 2, clientWidth: 80, clientHeight: 60,
  borders: {top: 2, right: 3, bottom: 4, left: 1},
});
const pressed: boolean = pressedScrollbar(new PointerEvent("pointerdown"), document.createTextNode("label"));
// @ts-expect-error Pointer coordinates require a PointerEvent.
pressedScrollbar(new Event("pointerdown"), document.body);
// @ts-expect-error All four border measurements are required.
onScrollbar({x: 0, y: 0}, {width: 100, height: 80, clientLeft: 1, clientTop: 2, clientWidth: 80, clientHeight: 60, borders: {top: 2, right: 3, left: 1}});
// @ts-expect-error Geometry cannot be a DOM element.
onScrollbar({x: 0, y: 0}, document.body);
void [rail, pressed];
