import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";
import * as ported from "../crates/core/src/foundation/platform/layout.js";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const original = await import(resolve(upstream, "packages/core/src/foundation/platform/layout.ts"));
beforeAll(async () => {
  const pin = await Bun.file(resolve(root, "upstream.json")).json();
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(pin.revision);
});

// This numeric/getter oracle complements real DOM/iframe coverage in
// tests/browser/layout.spec.ts. Browser bindings remain the production path.
function graph(boxSizing: string, width: string, transform: string, scrolled: boolean) {
  const calls: string[] = [];
  const styles = new Map<object, object>();
  const doc: {body?: object} = {};
  const make = (name: string, offsetParent: object | null, parentElement: object | null, left: number, top: number) => {
    const values: Record<string, unknown> = {offsetParent, parentElement, ownerDocument: doc,
      offsetLeft: left, offsetTop: top, offsetWidth: 80, offsetHeight: 60,
      clientLeft: 2, clientTop: 3, scrollLeft: scrolled && name === "middle" ? 4 : 0,
      scrollTop: scrolled && name === "middle" ? 5 : 0, scrollWidth: 301, scrollHeight: 211};
    const node: Record<string, unknown> = {};
    for (const key of Object.keys(values)) Object.defineProperty(node, key, {get() {calls.push(name + "." + key); return values[key];}});
    node.getBoundingClientRect = () => {calls.push(name + ".rect"); return new Proxy({left: left + 0.25, top: top + 0.5, width: 80.5, height: 60.75}, {get(target, key) {calls.push(name + ".rect." + String(key)); return Reflect.get(target, key);}});};
    styles.set(node, new Proxy({boxSizing, width, height: "42.25px", transform: name === "middle" ? transform : "none", translate: "none", scale: "none", rotate: "none",
      getPropertyValue(property: string) {calls.push(name + ".css:" + property); return property.startsWith("padding") ? "2.75px" : "1.5px";}}, {get(target, key) {calls.push(name + ".style:" + String(key)); return Reflect.get(target, key);}}));
    return node;
  };
  const body = make("body", null, null, 0, 0); doc.body = body;
  const outer = make("outer", body, body, 7, 13);
  const middle = make("middle", outer, outer, 0, 0);
  const child = make("child", outer, middle, 12, 20);
  return {calls, child: child as unknown as HTMLElement, outer: outer as unknown as HTMLElement, styles};
}

test("layout arithmetic and getter order match upstream across content, fallback and transform cases", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");
  try {
    for (const boxSizing of ["content-box", "border-box"]) for (const width of ["0px", "-0px", "13.25px", "auto", "", "NaN", "Infinity", "-Infinity", "1e2px"]) for (const transform of ["none", "scale(1.5)"]) for (const scrolled of [false, true]) {
      const results = [];
      for (const implementation of [original, ported]) {
        const fixture = graph(boxSizing, width, transform, scrolled);
        Object.defineProperty(globalThis, "getComputedStyle", {configurable: true, value(el: object) {fixture.calls.push("computedStyle"); return fixture.styles.get(el);}});
        const origin = implementation.layoutOrigin(fixture.child);
        const size = implementation.layoutSize(fixture.child);
        const box = implementation.layoutBox(fixture.child, fixture.outer);
        results.push({origin, size, box, calls: fixture.calls});
      }
      expect(results[1]).toEqual(results[0]);
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "getComputedStyle", descriptor);
    else Reflect.deleteProperty(globalThis, "getComputedStyle");
  }
});

test("layout runtime exports match the original module", () => {
  expect(Object.keys(ported).sort()).toEqual(Object.keys(original).sort());
});
