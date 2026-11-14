import { test as base, expect } from "@playwright/test";

const test = base.extend<{pageErrors: string[]}>({
  pageErrors: [async ({page}, use) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await use(errors);
    expect(errors, "unexpected browser errors").toEqual([]);
  }, {auto: true}],
});

for (const implementation of ["ported", "reference"]) {
  test.describe(implementation + " kernel events", () => {
    test.beforeEach(async ({page}) => { await page.goto("/"); });

    test("native listener identity, receiver, capture, cancellation and idempotent cleanup", async ({page}) => {
      const result = await page.evaluate(async implementation => {
        const {on} = await import("/" + implementation + "/events.js");
        const parent = document.createElement("div");
        const child = document.createElement("button");
        parent.append(child);
        document.body.append(parent);
        const options = {capture: true};
        const added: unknown[][] = [], removed: unknown[][] = [];
        const add = parent.addEventListener, remove = parent.removeEventListener;
        parent.addEventListener = function(...args: Parameters<typeof add>) {
          added.push(args); return add.apply(this, args);
        };
        parent.removeEventListener = function(...args: Parameters<typeof remove>) {
          removed.push(args); return remove.apply(this, args);
        };
        const calls: unknown[] = [];
        let dispatched: Event;
        function listener(this: unknown, event: Event) {
          calls.push({receiver: this === parent, event: event === dispatched,
            target: event.target === child, currentTarget: event.currentTarget === parent,
            phase: event.eventPhase});
          event.preventDefault();
        }
        const cleanup = on(parent, "click", listener, options);
        dispatched = new MouseEvent("click", {bubbles: true, cancelable: true});
        const accepted = child.dispatchEvent(dispatched);
        cleanup(); cleanup();
        child.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}));
        return {calls, accepted, cancelled: dispatched.defaultPrevented,
          addedSame: added[0][1] === listener && added[0][2] === options,
          removedSame: removed.every(args => args[1] === listener && args[2] === options),
          removedCount: removed.length};
      }, implementation);
      expect(result).toEqual({
        calls: [{receiver: true, event: true, target: true, currentTarget: true, phase: 1}],
        accepted: false, cancelled: true, addedSame: true, removedSame: true, removedCount: 2,
      });
    });

    test("once and abort signals retain native lifecycle behavior", async ({page}) => {
      const result = await page.evaluate(async implementation => {
        const {on} = await import("/" + implementation + "/events.js");
        const target = document.createElement("button");
        let once = 0, abort = 0;
        const clearOnce = on(target, "click", () => once++, {once: true});
        target.click(); target.click(); clearOnce();
        const controller = new AbortController();
        const clearAbort = on(target, "click", () => abort++, {signal: controller.signal});
        target.click(); controller.abort(); target.click(); clearAbort(); target.click();
        return {once, abort};
      }, implementation);
      expect(result).toEqual({once: 1, abort: 1});
    });

    test("cleanup reads the original options object at removal time", async ({page}) => {
      const result = await page.evaluate(async implementation => {
        const {on} = await import("/" + implementation + "/events.js");
        const target = document.createElement("button");
        const options = {capture: true};
        let calls = 0;
        const cleanup = on(target, "click", () => calls++, options);
        target.click();
        options.capture = false;
        cleanup();
        target.click();
        options.capture = true;
        cleanup();
        target.click();
        return calls;
      }, implementation);
      expect(result).toBe(2);
    });

    test("selection events are fresh, native and cancellable", async ({page}) => {
      const result = await page.evaluate(async implementation => {
        const {selectEvent} = await import("/" + implementation + "/events.js");
        const first = selectEvent(), second = selectEvent();
        const before = {type: first.type, cancelable: first.cancelable, bubbles: first.bubbles,
          composed: first.composed, target: first.target, timestamp: Number.isFinite(first.timeStamp),
          native: first instanceof Event, fresh: first !== second};
        const target = document.createElement("button");
        target.addEventListener("select", event => event.preventDefault());
        const accepted = target.dispatchEvent(first);
        return {before, accepted, cancelled: first.defaultPrevented,
          target: first.target === target, otherCancelled: second.defaultPrevented};
      }, implementation);
      expect(result).toEqual({
        before: {type: "select", cancelable: true, bubbles: false, composed: false,
          target: null, timestamp: true, native: true, fresh: true},
        accepted: false, cancelled: true, target: true, otherCancelled: false,
      });
    });
  });
}

test("composition detection matches upstream for native, wrapped and strict-valued fields", async ({page}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const ported = await import("/ported/events.js");
    const original = await import("/reference/events.js");
    const samples: unknown[] = [
      {}, new Event("input"),
      new KeyboardEvent("keydown", {key: "Enter", isComposing: true}),
      new KeyboardEvent("keydown", {key: "Enter", keyCode: 229}),
      new InputEvent("input", {data: "字", isComposing: true}),
      new InputEvent("input", {data: "字", isComposing: false}),
    ];
    for (const isComposing of [undefined, false, true, 0, 1, "true", null]) {
      for (const keyCode of [undefined, 0, 13, 229, "229", NaN, null]) {
        samples.push({isComposing, keyCode});
      }
    }
    const observations = [];
    for (const sample of samples) {
      for (const event of [sample, {nativeEvent: sample}, Object.create({nativeEvent: sample})]) {
        observations.push([ported.isComposing(event), original.isComposing(event)]);
      }
    }
    return observations;
  });
  expect(result.length).toBe(165);
  for (const [ported, original] of result) expect(ported).toBe(original);
});

test("composition detection retains getter order, short circuiting and thrown errors", async ({page}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const ported = await import("/ported/events.js");
    const original = await import("/reference/events.js");
    const observations = [];
    for (const composing of [true, false]) {
      const pair = [];
      for (const implementation of [ported, original]) {
        const calls: string[] = [];
        const key = {
          get isComposing() { calls.push("isComposing"); return composing; },
          get keyCode() { calls.push("keyCode"); return 229; },
        };
        const event = new Proxy({get nativeEvent() { calls.push("nativeEvent"); return key; }}, {
          has(target, name) { calls.push("has " + String(name)); return Reflect.has(target, name); },
        });
        pair.push({result: implementation.isComposing(event), calls});
      }
      observations.push(pair);
    }
    for (const event of [{nativeEvent: undefined}, {nativeEvent: null}]) {
      const pair = [];
      for (const implementation of [ported, original]) {
        try { implementation.isComposing(event); pair.push("did not throw"); }
        catch (error) { pair.push(error instanceof TypeError ? "TypeError" : String(error)); }
      }
      observations.push(pair);
    }
    return observations;
  });
  for (const [ported, original] of result) expect(ported).toEqual(original);
});
