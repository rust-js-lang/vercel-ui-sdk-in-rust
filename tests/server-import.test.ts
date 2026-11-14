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
