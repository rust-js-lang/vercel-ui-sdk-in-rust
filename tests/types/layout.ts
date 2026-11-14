import {layoutOrigin, layoutSize, layoutBox} from "../../crates/core/src/foundation/platform/layout.js";
const element = document.createElement("div");
const point: {x: number; y: number} = layoutOrigin(element);
const size: {width: number; height: number} = layoutSize(element);
const box: {left: number; top: number; width: number; height: number; right: number; bottom: number} = layoutBox(element, element);
// @ts-expect-error The offset parent is required.
layoutBox(element);
// @ts-expect-error Layout measurements require an HTMLElement.
layoutOrigin(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
// @ts-expect-error A point is not the complete box result.
const incomplete: typeof box = point;
void [point, size, box, incomplete];
