import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const provenance = await Bun.file(resolve(root, "upstream.json")).json();
const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
if (revision.exitCode !== 0 || revision.stdout.toString().trim() !== provenance.revision) {
  throw new Error("Reference checkout must match upstream.json before browser comparisons run.");
}

const entries = [
  ["/reference/platform.js", resolve(upstream, "packages/core/src/foundation/platform/platform.ts")],
  ["/ported/platform.js", resolve(root, "crates/core/src/foundation/platform/platform.js")],
  ["/reference/env.js", resolve(upstream, "packages/core/src/foundation/platform/env.ts")],
  ["/ported/env.js", resolve(root, "crates/core/src/foundation/platform/env.js")],
  ["/reference/layout.js", resolve(upstream, "packages/core/src/foundation/platform/layout.ts")],
  ["/ported/layout.js", resolve(root, "crates/core/src/foundation/platform/layout.js")],
  ["/reference/events.js", resolve(upstream, "packages/core/src/foundation/kernel/events.ts")],
  ["/ported/events.js", resolve(root, "crates/core/src/foundation/kernel/events.js")],
] as const;
const modules = new Map<string, string>();
await Promise.all(entries.map(async ([url, entrypoint]) => {
  const result = await Bun.build({entrypoints: [entrypoint], target: "browser", minify: false});
  if (!result.success || result.outputs.length !== 1) {
    throw new AggregateError(result.logs, "Could not bundle browser reference fixture: " + entrypoint);
  }
  modules.set(url, await result.outputs[0].text());
}));

const port = Number(process.env.BROWSER_TEST_PORT ?? 4177);
Bun.serve({
  hostname: "127.0.0.1", port,
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/") return new Response('<!doctype html><html lang="en"><meta charset="utf-8"><title>UI SDK reference fixture</title><body></body></html>', {headers: {"content-type": "text/html"}});
    const module = modules.get(path);
    if (module !== undefined) return new Response(module, {headers: {"content-type": "text/javascript", "cache-control": "no-store"}});
    return new Response("Not found", {status: 404});
  },
});
