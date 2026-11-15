import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";
import * as ported from "../crates/core/src/foundation/platform/platform.js";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const original = await import(resolve(upstream, "packages/core/src/foundation/platform/platform.ts"));
beforeAll(async () => {
  const pin = await Bun.file(resolve(root, "upstream.json")).json();
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(pin.revision);
});

function capture(run: () => unknown) {
  try {return {value: run()};}
  catch (error) {return {error: {name: error.name, message: error.message}};}
}

const shortcuts = ["mod+k", "mod+shift+n", "ctrl+alt+delete", "command+option+return", "meta+escape", "space", "up", "arrowleft", "pageup", "backspace", "opt+del", "control+home", "shift+tab", "cmd+end", "a", "1", "ß", "\u0277", "\ua7dd", "İ", "ı", "σ", "ς", "ẞ", "é", "😀", "\ud800", "\udfff", "constructor", "__proto__", "toString", "hasOwnProperty", "unrecognized", "", "+", "mod+", "mod++n", "A+B", "Control+N", "ctrl+n+n", "shift+mod+alt+z"];

test("shortcut aliases, Unicode, inherited names and invalid forms retain upstream results", () => {
  for (const apple of [true, false]) {
    for (const shortcut of shortcuts) {
      for (const name of ["ariaKeyshortcuts", "formatShortcut", "hasCommandModifier"]) {
        expect(capture(() => ported[name](shortcut, apple))).toEqual(capture(() => original[name](shortcut, apple)));
      }
    }
  }
});

test("shortcut dictionary reads preserve inherited getters, falsy values and repeated reads", () => {
  const key = "agentlookup";
  const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, key);
  try {
    for (const values of [["Meta", "Alt"], ["", "Shift"], [null, "Control"], [undefined, "Meta"], ["Meta", undefined]]) {
      const results = [];
      for (const implementation of [original, ported]) {
        const calls: string[] = [];
        let index = 0;
        Object.defineProperty(Object.prototype, key, {configurable: true, get() {calls.push("lookup"); return values[index++ % values.length];}});
        results.push({result: capture(() => implementation.ariaKeyshortcuts(key, false)), calls});
      }
      expect(results[1]).toEqual(results[0]);
    }
  } finally {
    if (descriptor) Object.defineProperty(Object.prototype, key, descriptor);
    else Reflect.deleteProperty(Object.prototype, key);
  }
});

test("shortcut matching preserves physical layout fallback and modifier getter order", () => {
  const keys = ["k", "K", "n", "˜", "л", "1", "!", " ", "Enter", "Esc", "Escape", "ArrowLeft", "é", "😀", ""];
  const codes = ["KeyK", "KeyN", "Digit1", "Unidentified"];
  const candidates = ["mod+k", "mod+shift+n", "alt+n", "ctrl+1", "space", "enter", "escape", "left", "é", "😀"];
  for (const apple of [true, false]) for (const shortcut of candidates) for (const key of keys) for (const code of codes) for (let modifiers = 0; modifiers < 16; modifiers++) {
    const results = [];
    for (const implementation of [original, ported]) {
      const calls: string[] = [];
      const fields = {key, code, metaKey: !!(modifiers & 1), ctrlKey: !!(modifiers & 2), altKey: !!(modifiers & 4), shiftKey: !!(modifiers & 8)};
      const event = Object.fromEntries(Object.keys(fields).map(name => [name, undefined]));
      for (const name of Object.keys(fields)) Object.defineProperty(event, name, {get() {calls.push(name); return fields[name];}});
      results.push({result: capture(() => implementation.matchesShortcut(event, shortcut, apple)), calls});
    }
    expect(results[1]).toEqual(results[0]);
  }
});

test("shortcut event getter exceptions retain their identity and evaluation boundary", () => {
  for (const throwing of ["key", "code", "metaKey", "ctrlKey", "altKey", "shiftKey"]) {
    const results = [];
    for (const implementation of [original, ported]) {
      const marker = {};
      const calls: string[] = [];
      const values = {key: "л", code: "KeyK", metaKey: true, ctrlKey: false, altKey: false, shiftKey: false};
      const event = {};
      for (const name of Object.keys(values)) Object.defineProperty(event, name, {get() {calls.push(name); if (name === throwing) throw marker; return values[name];}});
      let thrown = false;
      try {implementation.matchesShortcut(event, "mod+k", true);} catch (error) {thrown = error === marker;}
      results.push({calls, thrown});
    }
    expect(results[1]).toEqual(results[0]);
    expect(results[0].thrown).toBe(true);
  }
});

test("platform overrides preserve initial hydration values and shortcut defaults", () => {
  for (const platform of ["apple", "other", "apple", "other"]) {
    const rows = [original, ported].map(module => {
      module.setPlatform(platform);
      return {initial: module.initialApple(), current: module.isApple(), aria: module.ariaKeyshortcuts("mod+n"), text: module.formatShortcut("mod+n")};
    });
    expect(rows[1]).toEqual(rows[0]);
    expect(rows[0].initial).toBe(platform === "apple");
  }
});

test("platform runtime exports match the complete original module", () => {
  expect(Object.keys(ported).sort()).toEqual(Object.keys(original).sort());
});

test("composed closest retains the complete original source structure", () => {
  const transpiler = new Bun.Transpiler({loader:"js", minifyWhitespace:true, minifySyntax:false, minifyIdentifiers:false});
  expect(transpiler.transformSync(ported.composedClosest.toString()))
    .toBe(transpiler.transformSync(original.composedClosest.toString()));
});
