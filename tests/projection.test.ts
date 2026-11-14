import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";


const root = resolve(import.meta.dir, "..");
const probe = process.env.UI_SDK_PROJECTION_PROBE === "1";
if (probe) {
  const provenance = await Bun.file(resolve(root, "test-results/core-probes/foundation/motion/projection/provenance.json")).json();
  expect(new Bun.CryptoHasher("sha256").update(await Bun.file(resolve(root, provenance.source)).text()).digest("hex")).toBe(provenance.sha256);
}
const {projectDistance, nearestIndex, chooseSnapTarget} = await import(resolve(root, probe ? "test-results/core-probes/foundation/motion/projection/src/lib.js" : "crates/core/src/foundation/motion/projection.js"));
const source = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const pin = Bun.spawnSync(["git", "-C", source, "rev-parse", "HEAD"], { timeout: 10000 });
  expect(pin.exitCode).toBe(0);
  expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const original = await import(resolve(source, "packages/core/src/foundation/motion/projection.ts"));
const values = [-Infinity, -1e308, -100, -1, -Number.MIN_VALUE, -0, 0, Number.MIN_VALUE, 0.5, 1, 100, 1e308, Infinity, NaN];
const lists = [[], [0], [100], [0, 100, 200], [-100, 0, 100], [0, 0, 100], [NaN, 100], [-Infinity, 0, Infinity]];

test("release distance and nearest candidate exactly match upstream", () => {
  for (const velocity of values) for (const rate of values) {
    expect(Object.is(projectDistance(velocity, rate), original.projectDistance(velocity, rate))).toBe(true);
  }
  for (const candidates of lists) for (const value of values) {
    expect(nearestIndex(candidates, value)).toBe(original.nearestIndex(candidates, value));
  }
});

test("snap choice preserves slow release, fling direction, ties and skip policy", () => {
  for (const candidates of lists) for (const extent of values) for (const velocity of values) {
    for (const rate of [0, 0.99, 0.998, 1, NaN]) for (const minFlingVelocity of [0, 0.5, Infinity, NaN]) {
      for (const skipSnapPoints of [false, true]) {
        const input = {extent, velocity, candidates, rate, minFlingVelocity, skipSnapPoints};
        expect(chooseSnapTarget(input)).toBe(original.chooseSnapTarget(input));
      }
    }
  }
});
