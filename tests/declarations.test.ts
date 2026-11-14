import { beforeAll, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(
  process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"),
);

beforeAll(async () => {
  const config = await Bun.file(resolve(root, "upstream.json")).json();
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {
    timeout: 10000,
  });
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(config.revision);
});

function check(file: string) {
  const result = Bun.spawnSync(
    [
      "bunx",
      "--bun",
      "tsc",
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--target",
      "esnext",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "--lib",
      "esnext,dom",
      "--allowImportingTsExtensions",
      file,
    ],
    { cwd: root, timeout: 20000 },
  );
  return {
    exitCode: result.exitCode,
    diagnostics: result.stdout.toString() + result.stderr.toString(),
  };
}

test("native event usage fixture accepts upstream's types and rejects invalid calls", async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-reference-types-"));
  try {
    const fixture = await Bun.file(
      resolve(import.meta.dir, "types/kernel-events.ts"),
    ).text();
    const source = fixture.replace(
      "../../crates/core/src/foundation/kernel/events.js",
      resolve(upstream, "packages/core/src/foundation/kernel/events.ts"),
    );
    const file = join(directory, "reference.ts");
    await Bun.write(file, source);
    expect(check(file)).toEqual({ exitCode: 0, diagnostics: "" });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("native event declarations preserve event names, callback types and options", () => {
  expect(check(resolve(import.meta.dir, "types/kernel-events.ts"))).toEqual({
    exitCode: 0,
    diagnostics: "",
  });
});

test("numeric move and sheet physics declarations keep literal and nullable contracts", () => {
  expect(check(resolve(import.meta.dir, "types/core-records.ts"))).toEqual({
    exitCode: 0,
    diagnostics: "",
  });
});

for (const kind of ["upstream", "compiled"] as const) test("calendar declarations preserve ISODate exports and narrowing: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-calendar-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/calendar.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/date/plain-date.ts")
      : resolve(root, process.env.UI_SDK_CALENDAR_PROBE === "1" ? "test-results/calendar-probe/src/lib.js" : "crates/core/src/foundation/date/plain_date.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/date/plain_date.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});
