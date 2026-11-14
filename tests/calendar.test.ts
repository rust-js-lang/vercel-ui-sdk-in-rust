import {beforeAll, expect, test} from "bun:test";
import {resolve} from "node:path";

const root = resolve(import.meta.dir, "..");
const upstream = resolve(process.env.UI_SDK_UPSTREAM_DIR ?? resolve(root, "../vercel-ui"));
const config = await Bun.file(resolve(root, "upstream.json")).json();
const probe = process.env.UI_SDK_CALENDAR_PROBE === "1";
if (probe) {
  const provenance = await Bun.file(resolve(root, "test-results/calendar-probe/provenance.json")).json();
  const source = await Bun.file(resolve(root, provenance.source)).text();
  expect(new Bun.CryptoHasher("sha256").update(source).digest("hex")).toBe(provenance.sha256);
}
const port = await import(resolve(root, probe ? "test-results/calendar-probe/src/lib.js" : "crates/core/src/foundation/date/plain_date.js"));
const original = await import(resolve(upstream, "packages/core/src/foundation/date/plain-date.ts"));
beforeAll(() => {
  const revision = Bun.spawnSync(["git", "-C", upstream, "rev-parse", "HEAD"], {timeout: 10000});
  expect(revision.exitCode).toBe(0);
  expect(revision.stdout.toString().trim()).toBe(config.revision);
});
function outcome(fn: () => unknown) {
  try { return {value: fn()}; }
  catch (error) { return {error: error instanceof Error ? [error.name, error.message] : error}; }
}
const dates = ["0001-01-01", "0099-02-28", "1582-10-15", "1900-02-28", "1969-12-31", "1970-01-01", "2000-02-29", "2024-01-31", "2026-12-31", "2100-03-01", "9999-12-31"];
const invalid = ["", "0000-01-01", "2026-02-29", "1900-02-29", "2026-00-01", "2026-13-01", "2026-01-00", "2026-01-32", "26-01-01", "2026-1-01", "😀😀😀😀", "2026-01-01\n"];
const offsets = [-Infinity, -10000000, -400, -31, -1, -0, 0, 0.5, 1, 7, 28, 31, 365, 400, 10000000, Infinity, NaN];

test("calendar parsing and conversion preserve validation, Date fields and undefined", () => {
  for (const value of [...dates, ...invalid, undefined, null]) {
    expect(port.dateParts(value)).toEqual(original.dateParts(value));
    expect(port.isISODate(value)).toBe(original.isISODate(value));
    expect(port.toISODate(value)).toBe(original.toISODate(value));
  }
  for (const value of [new Date(NaN), new Date(0), new Date(2024, 1, 29), {year: 2000, month: 2, day: 29}, {year: 1900, month: 2, day: 29}]) {
    expect(port.toISODate(value)).toBe(original.toISODate(value));
  }
  for (const year of [0, 1, 99, 1900, 2000, 2100, 9999, 10000, NaN]) {
    for (const month of [-1, 0, 0.5, 1, 2, 3, 12, 13, Infinity, NaN]) {
      expect(port.daysInMonth(year, month)).toBe(original.daysInMonth(year, month));
      for (const day of [0, 1, 1.5, 28, 29, 30, 31, 32, NaN]) expect(port.isoDate(year, month, day)).toBe(original.isoDate(year, month, day));
    }
  }
});

test("calendar arithmetic matches every supported operation at boundaries and nonfinite offsets", () => {
  for (const date of dates) {
    for (const name of ["addDays", "addMonths", "addYears"] as const) {
      for (const offset of offsets) expect(outcome(() => port[name](date, offset))).toEqual(outcome(() => original[name](date, offset)));
    }
    for (const name of ["weekday", "startOfMonth", "endOfMonth"] as const) expect(port[name](date)).toBe(original[name](date));
    for (const start of [undefined, -1, 0, 1, 6, 7, 1.5, NaN]) {
      for (const name of ["startOfWeek", "endOfWeek"] as const) expect(outcome(() => port[name](date, start))).toEqual(outcome(() => original[name](date, start)));
    }
    for (const other of dates) {
      expect(port.daysBetween(date, other)).toBe(original.daysBetween(date, other));
      expect(port.isSameMonth(date, other)).toBe(original.isSameMonth(date, other));
    }
  }
});

test("month grids retain original shape, overflow clamping and option getter order", () => {
  for (const date of dates) for (const weekStartsOn of [undefined, 0, 1, 6]) for (const fixedWeeks of [undefined, true, false]) {
    expect(port.monthGrid(date, {weekStartsOn, fixedWeeks})).toEqual(original.monthGrid(date, {weekStartsOn, fixedWeeks}));
  }
  const results = [];
  for (const impl of [port, original]) {
    const calls: string[] = [];
    const value = impl.monthGrid("2024-02-29", {get weekStartsOn() {calls.push("start"); return 1;}, get fixedWeeks() {calls.push("fixed"); return false;}});
    results.push({calls, value});
  }
  expect(results[0]).toEqual(results[1]);
});

test("invalid arithmetic preserves exact RangeError messages and UTF-16 slicing/comparison", () => {
  for (const date of invalid) for (const name of ["addDays", "addMonths", "addYears", "weekday", "endOfMonth", "monthGrid"] as const) {
    expect(outcome(() => port[name](date, 1))).toEqual(outcome(() => original[name](date, 1)));
  }
  const strings = [...dates.slice(0, 2), "", "😀abcdefghi", "\ue000abcdefghi", "a😀😀😀😀"];
  for (const date of strings) {
    expect(port.startOfMonth(date)).toBe(original.startOfMonth(date));
    for (const min of [...strings, undefined, null]) for (const max of [...strings, undefined, null]) {
      expect(port.clampDate(date, min, max)).toBe(original.clampDate(date, min, max));
    }
  }
});
