import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
beforeAll(async () => {
  const pin = await Bun.file(resolve(root, "upstream.json")).json();
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(pin.revision);
});

function exercise(file: string) {
  // Each process has its own host globals; each query loads a fresh module so
  // the module-time browser flag is compared separately from later calls.
  const code = `
    const output = [];
    let index = 0;
    for (const [hasWindow, hasDocument] of [[false,false],[true,false],[false,true],[true,true]]) {
      for (const platform of ["iPhone","iPad","iPod","MacIntel","Macintosh","Linux", "prefixiPhonesuffix"]) {
        for (const touches of [0,1,2,5]) {
          const calls = [];
          const define = (name, value) => Object.defineProperty(globalThis, name, {value, configurable:true});
          define("window", hasWindow ? {} : undefined);
          define("document", hasDocument ? {} : undefined);
          define("navigator", {get platform() {calls.push("platform"); return platform;}, get maxTouchPoints() {calls.push("touches"); return touches;}});
          define("getComputedStyle", function(el) {"use strict"; calls.push(["style", this === undefined, el.id]); return {get direction() {calls.push("direction"); return el.direction;}};});
          const module = await import(FILE + "?host=" + index++);
          const ios = module.isIOS();
          const rtl = [undefined, null, {id:"ltr",direction:"ltr"}, {id:"rtl",direction:"rtl"}, {id:"other",direction:"RTL"}].map(el => module.isRTL(el));
          const before = module.isBrowser;
          define("window", undefined); define("document", undefined);
          const after = module.isBrowser;
          const repeated = module.isIOS();
          output.push({keys:Object.keys(module).sort(),before,after,ios,repeated,rtl,calls});
        }
      }
    }
    console.log(JSON.stringify(output));
  `.replace("FILE", JSON.stringify(file));
  const result = Bun.spawnSync(["bun", "-e", code], {cwd: root, timeout: 10000});
  expect({exitCode: result.exitCode, stderr: result.stderr.toString()}).toEqual({exitCode: 0, stderr: ""});
  return JSON.parse(result.stdout.toString());
}

test("environment exports, server guards, iOS detection and getter order match upstream", () => {
  const original = exercise(resolve(upstream, "packages/core/src/foundation/platform/env.ts"));
  const ported = exercise(resolve(root, "crates/core/src/foundation/platform/env.js"));
  expect(original).toHaveLength(112);
  expect(ported).toEqual(original);
});
