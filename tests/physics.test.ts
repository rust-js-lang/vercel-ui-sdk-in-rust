import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";
import { sheetPhysics } from "../crates/core/src/foundation/motion/physics.js";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(
  process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"),
);
const config = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {
    timeout: 10000,
  });
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(config.revision);
});
const original = await import(
  resolve(upstream, "packages/core/src/foundation/motion/physics.ts")
);

test("sheet physics presets retain all upstream tuning and object data", () => {
  expect(sheetPhysics).toEqual(original.sheetPhysics);
  expect(Object.getPrototypeOf(sheetPhysics)).toBe(Object.prototype);
  expect(Object.getPrototypeOf(sheetPhysics.ios)).toBe(Object.prototype);
});

test("preset fields remain mutable shared values, including a null dimension", async () => {
  const module =
    await import("../crates/core/src/foundation/motion/physics.js");
  const dimension = sheetPhysics.ios.rubberBandDimension;
  try {
    sheetPhysics.ios.rubberBandDimension = null;
    expect(module.sheetPhysics).toBe(sheetPhysics);
    expect(module.sheetPhysics.ios).toBe(sheetPhysics.ios);
    expect(module.sheetPhysics.ios.rubberBandDimension).toBeNull();
  } finally {
    sheetPhysics.ios.rubberBandDimension = dimension;
  }
});
