import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";
import { rubberBand, rubberBandInverse, rubberBandSlope } from "../crates/core/src/foundation/motion/rubber_band.js";
import { physicalSide, type Side } from "../crates/core/src/foundation/platform/sides.js";

const root = resolve(import.meta.dir, "..");
const source = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const pin = Bun.spawnSync(["git", "-C", source, "rev-parse", "HEAD"], { timeout: 10000 });
  expect(pin.exitCode).toBe(0);
  expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const motion = await import(resolve(source, "packages/core/src/foundation/motion/rubber-band.ts"));
const sides = await import(resolve(source, "packages/core/src/foundation/platform/sides.ts"));
const values = [-Infinity, -1e308, -100, -1, -Number.MIN_VALUE, -0, 0, Number.MIN_VALUE, 0.55, 1, 24, 100, 1e308, Infinity, NaN];

for (const [name, actual] of [
  ["rubberBand", rubberBand],
  ["rubberBandInverse", rubberBandInverse],
  ["rubberBandSlope", rubberBandSlope],
] as const) {
  test(name + " exactly matches upstream, including defaults and exceptional numbers", () => {
    for (const amount of values) for (const dimension of values) {
      for (const coefficient of [undefined, ...values]) {
        expect(Object.is(actual(amount, dimension, coefficient), motion[name](amount, dimension, coefficient))).toBe(true);
      }
    }
  });
}

test("every physical and logical side matches upstream in both writing directions", () => {
  for (const side of ["top", "bottom", "left", "right", "start", "end"] as Side[]) {
    for (const rtl of [undefined, false, true]) {
      expect(physicalSide(side, rtl)).toBe(sides.physicalSide(side, rtl));
    }
  }
});
