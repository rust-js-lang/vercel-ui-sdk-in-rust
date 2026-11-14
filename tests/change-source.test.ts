import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";
const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
const probe = process.env.UI_SDK_DETAILS_PROBE === "1";
if (probe) {
  const provenance = await Bun.file(resolve(root, "test-results/core-probes/foundation/kernel/details/provenance.json")).json();
  expect(new Bun.CryptoHasher("sha256").update(await Bun.file(resolve(root, provenance.source)).text()).digest("hex")).toBe(provenance.sha256);
}
const port = await import(resolve(root, probe ? "test-results/core-probes/foundation/kernel/details/src/lib.js" : "crates/core/src/foundation/kernel/details.js"));
const original = await import(resolve(upstream, "packages/core/src/foundation/kernel/details.ts"));
beforeAll(() => {
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(config.revision);
});
const sources = [undefined, "mouse", "touch", "pen", "keyboard", "virtual", "programmatic", "agent"];
const reasons = ["press", "trigger-press", "custom", "image-load", "image-error", "imperative", "item-removed", "unmount", "reset", "restore", "timeout", "resize", "page-hide"];

test("all source/reason/event combinations preserve lazy input tracking and inherited causes", () => {
  for (const source of sources) for (const reason of reasons) for (const input of sources) {
    const results = [];
    for (const impl of [port, original]) {
      const calls: string[] = [];
      const read = input === undefined ? undefined : () => {calls.push("read"); return input;};
      const value = impl.withSource(source, () => impl.resolveSource(reason, read));
      results.push({value, calls, after: impl.resolveSource("press")});
    }
    expect(results[0]).toEqual(results[1]);
  }
});

test("nested interactions restore every outer source and preserve callback return identity", () => {
  for (const outer of sources) for (const inner of sources) {
    const value = {};
    const results = [];
    for (const impl of [port, original]) {
      const calls: unknown[] = [];
      const returned = impl.withSource(outer, () => {
        calls.push(impl.resolveSource("press"));
        impl.withSource(inner, () => calls.push(impl.resolveSource("press")));
        calls.push(impl.resolveSource("press"));
        return value;
      });
      expect(returned).toBe(value);
      results.push(calls);
    }
    expect(results[0]).toEqual(results[1]);
  }
});

test("throwing callbacks and event-source readers restore context without replacing the exception", () => {
  for (const source of sources) {
    const failure = {};
    for (const impl of [port, original]) {
      let caught: unknown;
      impl.withSource("touch", () => {
        try { impl.withSource(source, () => {throw failure;}); } catch (error) {caught = error;}
        expect(impl.resolveSource("press")).toBe("touch");
      });
      expect(caught).toBe(failure);
      expect(impl.resolveSource("press")).toBe("programmatic");
      try { impl.withSource("keyboard", () => impl.resolveSource("press", () => {throw failure;})); }
      catch (error) {expect(error).toBe(failure);}
      expect(impl.resolveSource("press")).toBe("programmatic");
    }
  }
});

test("source scopes end synchronously when callbacks return promises", async () => {
  for (const impl of [port, original]) {
    const promise = impl.withSource("agent", async () => {
      expect(impl.resolveSource("press")).toBe("agent");
      await Promise.resolve();
      return impl.resolveSource("press");
    });
    expect(impl.resolveSource("press")).toBe("programmatic");
    expect(await promise).toBe("programmatic");
  }
});

test("dismissals use the complete exact reason vocabulary", () => {
  for (const reason of [...reasons, "escape-key", "outside-press", "focus-out", "window-blur", "back", "swipe", "Escape-key", "", "dismiss", "close-press", "item-press"]) {
    expect(port.isDismissal(reason)).toBe(original.isDismissal(reason));
  }
});
