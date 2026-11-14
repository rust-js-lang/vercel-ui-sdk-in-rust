import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";
import {stepFromKey} from "../crates/core/src/foundation/number/keys.js";
const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
const original = await import(resolve(upstream, "packages/core/src/foundation/number/keys.ts"));
beforeAll(() => {
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(config.revision);
});

test("numeric keys retain every orientation, direction, arrow policy and modifier", () => {
  for (const key of ["Home", "End", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "", "a"]) {
    for (const orientation of [undefined, "horizontal", "vertical"] as const) for (const dir of [undefined, "ltr", "rtl"] as const) for (const arrows of [undefined, "all", "horizontal", "vertical"] as const) {
      for (const shiftKey of [undefined, false, true]) for (const altKey of [undefined, false, true]) {
        const event = {key, shiftKey, altKey};
        const options = {orientation, dir, arrows};
        expect(stepFromKey(event, options)).toEqual(original.stepFromKey(event, options));
      }
    }
  }
});

test("composition and wrapped native events leave candidate-selection keys alone", () => {
  for (const key of ["Home", "PageUp", "ArrowLeft", "ArrowUp", "a"]) {
    for (const isComposing of [undefined, false, true]) for (const keyCode of [undefined, 0, 13, 229]) {
      for (const wrapped of [false, true]) {
        const fields = {isComposing, keyCode};
        const event = wrapped ? {key, nativeEvent: fields} : {key, ...fields};
        expect(stepFromKey(event)).toEqual(original.stepFromKey(event));
      }
    }
  }
});

test("numeric key mapping preserves getter order, repeated key reads and short circuiting", () => {
  for (const key of ["Home", "End", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "a"]) {
    for (const composing of [false, true]) for (const arrows of ["all", "horizontal", "vertical"] as const) {
      const results = [];
      for (const implementation of [stepFromKey, original.stepFromKey]) {
        const calls: unknown[] = [];
        const event = {get key() {calls.push("key"); return key;}, get isComposing() {calls.push("composing"); return composing;}, get keyCode() {calls.push("keyCode"); return 0;}, get shiftKey() {calls.push("shift"); return false;}, get altKey() {calls.push("alt"); return true;}};
        const options = {get orientation() {calls.push("orientation"); return "horizontal" as const;}, get dir() {calls.push("dir"); return "rtl" as const;}, get arrows() {calls.push("arrows"); return arrows;}};
        const result = implementation(event, options);
        results.push({calls, result});
      }
      expect(results[0]).toEqual(results[1]);
    }
  }
});

test("unrelated modifiers and ignored keys do not read step modifiers", () => {
  for (const key of ["Home", "End", "PageUp", "PageDown", "Enter"]) {
    for (const implementation of [stepFromKey, original.stepFromKey]) {
      const event = {key, get shiftKey(): boolean {throw new Error("shift read");}, get altKey(): boolean {throw new Error("alt read");}, get ctrlKey(): boolean {throw new Error("ctrl read");}, get metaKey(): boolean {throw new Error("meta read");}};
      expect(() => implementation(event)).not.toThrow();
    }
  }
});
