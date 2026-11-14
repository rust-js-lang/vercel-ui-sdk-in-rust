import { beforeAll, expect, test } from "bun:test";
import { resolve } from "node:path";
import { createUndoStack } from "../crates/core/src/foundation/kernel/undo_stack.js";

const root = resolve(import.meta.dir, "..");
const source = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
beforeAll(() => {
  const pin = Bun.spawnSync(["git", "-C", source, "rev-parse", "HEAD"], { timeout: 10000 });
  expect(pin.exitCode).toBe(0);
  expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const original = await import(resolve(source, "packages/core/src/foundation/kernel/undo-stack.ts"));

test("seeded edit traces preserve groups, branching, live settings and exact state identity", () => {
  const states = Array.from({length: 50}, (_, id) => ({id}));
  for (const settingsKind of ["object", "getter"] as const) {
    const settings: {limit?: number; groupDelay?: number} = {};
    const options = settingsKind === "object" ? settings : () => settings;
    const a = createUndoStack(states[0], options);
    const b = original.createUndoStack(states[0], options);
    let random = 20261114;
    const next = () => (random = (Math.imul(random, 1664525) + 1013904223) >>> 0);
    for (let i = 0; i < 5000; i++) {
      const state = states[next() % states.length];
      switch (next() % 11) {
        case 0: case 1: case 2: case 3: {
          const options = {group: [undefined, "", "insert", "delete"][next()%4], time: [i*100, i*500, -i, Infinity, NaN][next()%5]};
          a.record(state, options); b.record(state, options); break;
        }
        case 4: expect(a.undo()).toBe(b.undo()); break;
        case 5: expect(a.redo()).toBe(b.redo()); break;
        case 6: a.seal(); b.seal(); break;
        case 7: a.reset(state); b.reset(state); break;
        case 8: settings.limit = [undefined, -1, 0, 1, 3.5, 100, Infinity, NaN][next()%8]; break;
        case 9: settings.groupDelay = [undefined, -1, 0, 500, Infinity, NaN][next()%6]; break;
        case 10: {
          const update = (state: {id: number}) => states[(state.id+1)%states.length];
          a.map(update); b.map(update); break;
        }
      }
      expect(a.canUndo()).toBe(b.canUndo());
      expect(a.canRedo()).toBe(b.canRedo());
    }
  }
});

test("clock, record getters and settings getters keep upstream evaluation order", () => {
  const results = [];
  const now = Date.now;
  try {
    for (const create of [createUndoStack, original.createUndoStack]) {
      const calls: unknown[] = [];
      Date.now = () => { calls.push("clock"); return 1234; };
      const initial = {id: 0}, state = {id: 1};
      const stack = create(initial, () => {
        calls.push("settings");
        return {get limit() { calls.push("limit"); return 100; }, get groupDelay() { calls.push("delay"); return 500; }};
      });
      stack.record(state, {get group() { calls.push("group"); return "insert"; }, get time() { calls.push("time"); return undefined; }});
      const undo = stack.undo, redo = stack.redo;
      results.push({calls, original: undo() === initial, edited: redo() === state});
    }
  } finally { Date.now = now; }
  expect(results[0]).toEqual(results[1]);
});

test("map callbacks can reset, record and traverse their stack reentrantly", () => {
  const results = [];
  for (const create of [createUndoStack, original.createUndoStack]) {
    const calls: unknown[] = [];
    const stack = create(0);
    stack.record(1, {time: 0}); stack.record(2, {time: 1});
    stack.map((value: number) => {
      calls.push([value, stack.canUndo(), stack.canRedo()]);
      stack.reset(99); stack.record(100, {time: 2}); stack.undo();
      return value + 10;
    });
    calls.push(stack.redo(), stack.redo(), stack.undo(), stack.undo(), stack.undo());
    results.push(calls);
  }
  expect(results[0]).toEqual(results[1]);
});
