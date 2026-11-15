import {beforeAll, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import * as ported from "../crates/core/src/foundation/platform/scrollbar.js";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const original = await import(resolve(upstream, "packages/core/src/foundation/platform/scrollbar.ts"));
beforeAll(async () => {
  const pin = await Bun.file(resolve(root, "upstream.json")).json();
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(pin.revision);
});

test("scrollbar exports match the complete original module", () => {
  expect(Object.keys(ported).sort()).toEqual(Object.keys(original).sort());
});

test("scrollbar hit testing preserves fractional edges, RTL gutters and nonfinite coordinates", () => {
  const borders = {top:2.5,right:3.5,bottom:4.5,left:1.5};
  for (const clientLeft of [1.5,17.5]) for (const clientWidth of [0,79,95]) for (const clientHeight of [0,60,76]) {
    const box = {width:100,height:80,clientLeft,clientTop:2.5,clientWidth,clientHeight,borders};
    const xs=[-Infinity,-1,-0,0,1.499,1.5,17.499,17.5,79,95,96.499,96.5,100,Infinity,NaN];
    const ys=[-Infinity,-1,-0,0,2.499,2.5,59,62.499,62.5,75.499,75.5,80,Infinity,NaN];
    for(const x of xs) for(const y of ys) expect(ported.onScrollbar({x,y},box)).toBe(original.onScrollbar({x,y},box));
  }
});

test("scrollbar numeric getters retain destructuring and short-circuit read order", () => {
  for(const coordinate of [{x:NaN,y:4},{x:1,y:4},{x:96,y:4},{x:20,y:76},{x:20,y:20}]) {
    const rows = [original,ported].map(module => {
      const calls:string[]=[];
      const record = (prefix:string, values:Record<string,unknown>) => Object.fromEntries(Object.entries(values).map(([name,value])=>[name,{get(){calls.push(prefix+name);return value;},enumerable:true}]));
      const point=Object.defineProperties({},record("point.",coordinate));
      const borders=Object.defineProperties({},record("borders.",{top:2,right:3,bottom:4,left:1}));
      const box=Object.defineProperties({},record("box.",{width:100,height:80,clientLeft:1,clientTop:2,clientWidth:80,clientHeight:60,borders}));
      return {result:module.onScrollbar(point,box),calls};
    });
    expect(rows[1]).toEqual(rows[0]);
  }
});

test("scrollbar bodies retain the original source structure", () => {
  const source = readFileSync(resolve(upstream, "packages/core/src/foundation/platform/scrollbar.ts"), "utf8");
  const generated = readFileSync(resolve(root, "crates/core/src/foundation/platform/scrollbar.js"), "utf8");
  // Compare function bodies after TypeScript erasure and formatting. The
  // original exports its declarations at the end; Rust exports them in place.
  const exports = "\nexport { onScrollbar, pressedScrollbar }\n";
  expect(source.endsWith(exports)).toBe(true);
  const transpiler = new Bun.Transpiler({loader:"ts", minifyWhitespace:true, minifySyntax:false, minifyIdentifiers:false});
  expect(transpiler.transformSync(generated.replace(/^export function /gm, "function ")))
    .toBe(transpiler.transformSync(source.slice(0, -exports.length)));
});
