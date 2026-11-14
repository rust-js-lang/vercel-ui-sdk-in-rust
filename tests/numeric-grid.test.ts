import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";
import * as ported from "../crates/core/src/foundation/number/steps.js";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(
  process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"),
);
const pin = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {
    timeout: 10000,
  });
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(pin.revision);
});
const original = await import(
  resolve(upstream, "packages/core/src/foundation/number/steps.ts")
);
const values = [
  -Infinity,
  -1e308,
  -360,
  -3.5,
  -1,
  -Number.MIN_VALUE,
  -0,
  0,
  Number.MIN_VALUE,
  0.1,
  0.1 + 0.2,
  0.5,
  1,
  1.5,
  9,
  10,
  11,
  123456788.99999999,
  98765432101.23,
  1e308,
  Infinity,
  NaN,
];
const ranges = [
  { min: 0, max: 10, step: 1 },
  { min: 1, max: 10, step: 2 },
  { min: -3, max: 3.4, step: 0.2 },
  { min: 0.1, max: 1, step: 0.1 },
  { min: 0, max: 1, step: 1e-7 },
  { min: 0, max: 1e12, step: 0.01 },
  { min: -Infinity, max: Infinity, step: 1 },
  { min: -Infinity, max: 10, step: 2 },
  { min: 0, max: 10, step: 0 },
  { min: 0, max: 10, step: -1 },
  { min: 0, max: 10, step: NaN },
  { min: 0, max: 10, step: Infinity },
  { min: 10, max: 0, step: 1 },
  { min: -0, max: 0, step: 1 },
  { min: NaN, max: 10, step: 1 },
  { min: 0, max: NaN, step: 1 },
];

function observe(run: () => unknown) {
  try {
    return { value: run() };
  } catch (error) {
    return {
      error: { name: (error as Error).name, message: (error as Error).message },
    };
  }
}

test("decimal precision and rounding preserve native conversion and RangeErrors", () => {
  for (const value of values) {
    expect(ported.decimalsOf(value)).toBe(original.decimalsOf(value));
    for (const decimals of [
      -Infinity,
      -100,
      -2.5,
      -1,
      -0,
      0,
      0.5,
      1,
      2.7,
      15,
      100,
      101,
      1000,
      Infinity,
      NaN,
    ]) {
      const a = observe(() => ported.roundTo(value, decimals));
      const b = observe(() => original.roundTo(value, decimals));
      if ("value" in a && "value" in b)
        expect(Object.is(a.value, b.value)).toBe(true);
      else expect(a).toEqual(b);
    }
  }
});

test("grids and fractional steps match upstream for finite and exceptional inputs", () => {
  for (const range of ranges) {
    expect(Object.is(ported.maxOnGrid(range), original.maxOnGrid(range))).toBe(
      true,
    );
    for (const value of values) {
      expect(
        Object.is(
          ported.snapToStep(value, range),
          original.snapToStep(value, range),
        ),
      ).toBe(true);
      for (const round of [
        undefined,
        Math.round,
        Math.floor,
        Math.ceil,
        (n: number) => n,
      ]) {
        expect(
          Object.is(
            ported.onGrid(value, range, round),
            original.onGrid(value, range, round),
          ),
        ).toBe(true);
      }
      for (const steps of [-Infinity, -2, -1, 0, 0.5, 1, 2, Infinity, NaN]) {
        expect(
          Object.is(
            ported.stepValue(value, steps, range),
            original.stepValue(value, steps, range),
          ),
        ).toBe(true);
      }
    }
  }
});

test("directional and bound moves match first reached snaps and custom step sizes", () => {
  const movements: ported.NumberMove[] = [{ bound: "min" }, { bound: "max" }];
  for (const direction of [-1, 1] as const)
    for (const size of ["step", "large", "small"] as const)
      movements.push({ direction, size });
  for (const base of ranges.slice(0, 6)) {
    for (const threshold of [-1, 0, 0.25, 1, Infinity, NaN]) {
      const range = {
        ...base,
        largeStep: 2.5,
        smallStep: 0.25,
        snap: { points: [9, 1, 5, -1, 11, 5], threshold },
      };
      for (const value of values)
        for (const movement of movements)
          for (const snap of [undefined, true, false]) {
            expect(
              Object.is(
                ported.stepBy(value, movement, range, { snap }),
                original.stepBy(value, movement, range, { snap }),
              ),
            ).toBe(true);
          }
    }
  }
});

test("scrubbing preserves nearest ties, clamping, disabled snaps and easing", () => {
  for (const base of ranges)
    for (const threshold of [-1, 0, 0.25, 1, Infinity, NaN]) {
      const range = {
        ...base,
        snap: { points: [9, 1, 5, -1, 11, 5], threshold },
      };
      for (const value of values)
        for (const snap of [undefined, true, false]) {
          for (const ease of [
            undefined,
            false,
            true,
            (n: number) => n * n,
            (n: number) => 2 - n,
          ]) {
            const a = ported.scrubTo(value, range, { snap, ease });
            const b = original.scrubTo(value, range, { snap, ease });
            expect(Object.is(a.value, b.value)).toBe(true);
            expect(Object.is(a.point, b.point)).toBe(true);
          }
        }
    }
});

test("unsnapped scrubs retain their required own point property with undefined", () => {
  const range = { min: 0, max: 10, step: 1 };
  const a = ported.scrubTo(3.5, range),
    b = original.scrubTo(3.5, range);
  expect(Object.keys(a)).toEqual(Object.keys(b));
  expect(Object.hasOwn(a, "point")).toBe(true);
  expect(a).toStrictEqual(b);
});

test("numeric callbacks, range getters and union checks retain upstream evaluation order", () => {
  for (const operation of [
    "maxOnGrid",
    "onGrid",
    "snapToStep",
    "stepValue",
    "stepOnGrid",
    "stepBy",
    "scrubTo",
  ] as const) {
    const results = [];
    for (const implementation of [ported, original]) {
      const calls: unknown[] = [];
      const snapping = {
        get points() {
          calls.push("points");
          return [0, 1, 5, 10];
        },
        get threshold() {
          calls.push("threshold");
          return 0.5;
        },
      };
      const range = {
        get min() {
          calls.push("min");
          return 0;
        },
        get max() {
          calls.push("max");
          return 10;
        },
        get step() {
          calls.push("step");
          return 0.1;
        },
        get largeStep() {
          calls.push("largeStep");
          return 2.5;
        },
        get smallStep() {
          calls.push("smallStep");
          return 0.25;
        },
        get snap() {
          calls.push("snap");
          return snapping;
        },
        get extra() {
          calls.push("extra");
          return "copied by a spread";
        },
      };
      const movement = new Proxy({ direction: 1, size: "small" } as const, {
        has(target, key) {
          calls.push("has " + String(key));
          return Reflect.has(target, key);
        },
        get(target, key, receiver) {
          calls.push("move " + String(key));
          return Reflect.get(target, key, receiver);
        },
      });
      const options = {
        get snap() {
          calls.push("option snap");
          return true;
        },
        get ease() {
          calls.push("option ease");
          return (n: number) => {
            calls.push(["ease", n]);
            return n * n;
          };
        },
      };
      const round = (n: number) => {
        calls.push(["round", n]);
        return Math.floor(n);
      };
      let value;
      switch (operation) {
        case "maxOnGrid":
          value = implementation.maxOnGrid(range);
          break;
        case "onGrid":
          value = implementation.onGrid(1.3, range, round);
          break;
        case "snapToStep":
          value = implementation.snapToStep(1.3, range);
          break;
        case "stepValue":
          value = implementation.stepValue(1.3, 1, range);
          break;
        case "stepOnGrid":
          value = implementation.stepOnGrid(1.3, movement, range);
          break;
        case "stepBy":
          value = implementation.stepBy(1.3, movement, range, options);
          break;
        case "scrubTo":
          value = implementation.scrubTo(1.3, range, options);
          break;
      }
      results.push({ value, calls });
    }
    expect(results[0], operation).toEqual(results[1]);
  }
});

test("copying a flattened range never reads an absent nested range property", () => {
  const range = Object.assign(Object.create({
    get range() { throw new Error("unexpected nested range read"); },
  }), {min: 0, max: 10, step: 1, smallStep: 0.25});
  const movement = {direction: 1, size: "small"};
  const expected = original.stepOnGrid(1.3, movement, range);
  expect(expected).toBe(1.5);
  expect(ported.stepOnGrid(1.3, movement, range)).toBe(expected);
});
