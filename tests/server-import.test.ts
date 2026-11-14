import { expect, test } from "bun:test";
import { resolve } from "node:path";

test("kernel event modules import without browser globals on the server", () => {
  const root = resolve(import.meta.dir, "..");
  const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
  for (const file of [
    resolve(root, "crates/core/src/foundation/kernel/events.js"),
    resolve(upstream, "packages/core/src/foundation/kernel/events.ts"),
  ]) {
    const code = 'for (const name of ["window","document","Event"]) Object.defineProperty(globalThis,name,{value:undefined,configurable:true});\n'
      + 'const module=await import(' + JSON.stringify(file) + ');\n'
      + 'console.log(JSON.stringify(Object.keys(module).sort()));';
    const result = Bun.spawnSync(["bun", "-e", code], {cwd: root, timeout: 10000});
    expect({exitCode: result.exitCode, stderr: result.stderr.toString(),
      exports: result.stdout.toString().trim()}).toEqual({
      exitCode: 0, stderr: "", exports: JSON.stringify(["isComposing", "on", "selectEvent"]),
    });
  }
});

test("platform imports and explicit-document focus work without browser globals", () => {
  const root = resolve(import.meta.dir, "..");
  const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
  const rows = [];
  for (const file of [resolve(upstream, "packages/core/src/foundation/platform/platform.ts"), resolve(root, "crates/core/src/foundation/platform/platform.js")]) {
    const code = `
      for (const name of ["window","document","HTMLElement","matchMedia","navigator"]) Reflect.deleteProperty(globalThis,name);
      const module = await import(FILE);
      const calls = [];
      const doc = {get activeElement() {calls.push("active"); return null;}};
      const explicit = module.activeElement(doc);
      let missing;
      try {module.activeElement();} catch(error) {missing = error.name;}
      console.log(JSON.stringify({explicit, missing, calls, top:module.supportsTopLayer(), portal:module.portalTarget(), motion:module.prefersReducedMotion(), initial:module.initialApple(), apple:module.isApple(), shortcut:module.ariaKeyshortcuts("mod+k")}));
    `.replace("FILE", JSON.stringify(file));
    const result = Bun.spawnSync(["bun", "-e", code], {cwd:root,timeout:10000});
    expect({exitCode:result.exitCode,stderr:result.stderr.toString()}).toEqual({exitCode:0,stderr:""});
    rows.push(JSON.parse(result.stdout.toString()));
  }
  expect(rows[1]).toEqual(rows[0]);
  expect(rows[0]).toEqual({explicit:null,missing:"ReferenceError",calls:["active"],top:false,portal:null,motion:false,initial:false,apple:false,shortcut:"Control+K"});
});
