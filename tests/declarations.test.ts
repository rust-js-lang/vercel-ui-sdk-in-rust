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
      : resolve(root, process.env.UI_SDK_CALENDAR_PROBE === "1" ? "test-results/core-probes/foundation/date/plain_date/src/lib.js" : "crates/core/src/foundation/date/plain_date.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/date/plain_date.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});

test("root calendar reexports preserve the annotated ISODate name", () => {
  expect(check(resolve(import.meta.dir, "types/root-calendar.ts"))).toEqual({exitCode: 0, diagnostics: ""});
});

for (const kind of ["upstream", "compiled"] as const) test("layout declarations preserve HTML inputs and geometry results: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-layout-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/layout.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/platform/layout.ts")
      : resolve(root, "crates/core/src/foundation/platform/layout.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/platform/layout.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {rmSync(directory, {recursive: true, force: true});}
});

for (const kind of ["upstream", "compiled"] as const) test("environment declarations preserve platform and Element inputs: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-environment-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/environment.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/platform/env.ts")
      : resolve(root, "crates/core/src/foundation/platform/env.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/platform/env.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {rmSync(directory, {recursive: true, force: true});}
});

for (const kind of ["upstream", "compiled"] as const) test("platform declarations preserve DOM, shortcut and platform contracts: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-platform-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/platform.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/platform/platform.ts")
      : resolve(root, "crates/core/src/foundation/platform/platform.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/platform/platform.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {rmSync(directory, {recursive: true, force: true});}
});

for (const kind of ["upstream", "compiled"] as const) test("composed closest declarations preserve generic element constraints: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-closest-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/composed-closest.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/platform/platform.ts")
      : resolve(root, "crates/core/src/foundation/platform/platform.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/platform/platform.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {rmSync(directory, {recursive: true, force: true});}
});

for (const kind of ["upstream", "compiled"] as const) test("scrollbar declarations preserve point, geometry and pointer contracts: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-scrollbar-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/scrollbar.ts")).text();
    const target = kind === "upstream"
      ? resolve(upstream, "packages/core/src/foundation/platform/scrollbar.ts")
      : resolve(root, "crates/core/src/foundation/platform/scrollbar.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replace("../../crates/core/src/foundation/platform/scrollbar.js", target));
    expect(check(file)).toEqual({exitCode: 0, diagnostics: ""});
  } finally {rmSync(directory, {recursive: true, force: true});}
});

for (const kind of ["upstream", "compiled"] as const) test("change details preserve the complete vocabulary and conditional contracts: " + kind, async () => {
  const directory = mkdtempSync(join(tmpdir(), "ui-sdk-details-types-"));
  try {
    const fixture = await Bun.file(resolve(import.meta.dir, "types/change-details.ts")).text();
    const reference = resolve(upstream, "packages/core/src/foundation/kernel/details.ts");
    const target = kind === "upstream" ? reference : resolve(root, "crates/core/src/foundation/kernel/details.js");
    const file = join(directory, "consumer.ts");
    await Bun.write(file, fixture.replaceAll("__CANDIDATE_DETAILS__", target).replaceAll("__REFERENCE_DETAILS__", reference));
    expect(check(file)).toEqual({exitCode:0, diagnostics:""});
  } finally {rmSync(directory, {recursive:true, force:true});}
});
