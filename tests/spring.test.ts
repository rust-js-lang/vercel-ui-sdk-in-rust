import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";
import { solveSpring, settleTime, springLinearEasing } from "../crates/core/src/foundation/motion/spring.js";

const root = resolve(import.meta.dir, "..");
const source = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const pin = Bun.spawnSync(["git", "-C", source, "rev-parse", "HEAD"], { timeout: 10000 });
  expect(pin.exitCode).toBe(0);
  expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const original = await import(resolve(source, "packages/core/src/foundation/motion/spring.ts"));

test("analytic position and velocity match upstream in all damping regimes", () => {
  for (const response of [-Infinity, -1, -0, 0, 0.0001, 0.34, 1, Infinity, NaN]) {
    for (const damping of [-1, 0, 0.2, 0.88, 1-1e-6, 1-1e-7, 1, 1+1e-7, 1+1e-6, 2, Infinity, NaN]) {
      for (const displacement of [-Infinity, -100, -0, 0, 100, Infinity, NaN]) {
        for (const velocity of [-1, 0, 0.5, Infinity, NaN]) {
          const a = solveSpring(response, damping, displacement, velocity);
          const b = original.solveSpring(response, damping, displacement, velocity);
          for (const t of [-1, -0, 0, 1, 1000/60, 100, 10000, Infinity, NaN]) {
            expect(Object.is(a.position(t), b.position(t))).toBe(true);
            expect(Object.is(a.velocity(t), b.velocity(t))).toBe(true);
          }
        }
      }
    }
  }
});

test("settle times and exact CSS easing samples match upstream", () => {
  for (const damping of [0.2, 0.88, 1, 2, NaN]) {
    const a = solveSpring(0.34, damping, 100, 0.5);
    const b = original.solveSpring(0.34, damping, 100, 0.5);
    for (const options of [undefined, {}, {positionTolerance: 0.01, velocityTolerance: 0.001, step: 0.5, limit: 500}, {limit: -1}, {step: Infinity}, {limit: NaN}]) {
      expect(Object.is(settleTime(a, options), original.settleTime(b, options))).toBe(true);
    }
    for (const [from, to] of [[0, 100], [100, 0], [1, 1], [-0, 0], [0, Infinity], [0, NaN]]) {
      for (const duration of [-1, 0, 100, NaN]) {
        for (const step of [undefined, 1, 1000/120, Infinity, NaN]) {
          expect(springLinearEasing(a, from, to, duration, step)).toBe(original.springLinearEasing(b, from, to, duration, step));
        }
      }
    }
  }
});

test("solver callbacks and option getters keep upstream read order and receiver", () => {
  for (const operation of ["settleTime", "springLinearEasing"] as const) {
    const observations = [];
    for (const implementation of [{settleTime, springLinearEasing}, original]) {
      const calls: unknown[] = [];
      const solver = {
        get position() { calls.push("position"); return function(this: unknown, t: number) { calls.push(["position call", this === solver, t]); return 10-t; }; },
        get velocity() { calls.push("velocity"); return function(this: unknown, t: number) { calls.push(["velocity call", this === solver, t]); return 0; }; },
      };
      const options = {
        get positionTolerance() { calls.push("positionTolerance"); return 0.5; },
        get velocityTolerance() { calls.push("velocityTolerance"); return 0.02; },
        get step() { calls.push("step"); return 1; },
        get limit() { calls.push("limit"); return 12; },
      };
      const result = operation === "settleTime" ? implementation.settleTime(solver, options) : implementation.springLinearEasing(solver, 0, 10, 12, 1);
      observations.push({result, calls});
    }
    expect(observations[0]).toEqual(observations[1]);
  }
});


test("CSS numeric conversion does not invoke Number.prototype.toString", () => {
  const toString = Number.prototype.toString;
  try {
    Number.prototype.toString = () => "changed";
    const solver = {position: (t: number) => 10-t, velocity: () => 0};
    expect(springLinearEasing(solver, 0, 10, 12, 1)).toBe(original.springLinearEasing(solver, 0, 10, 12, 1));
  } finally { Number.prototype.toString = toString; }
});
