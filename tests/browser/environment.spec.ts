import {test, expect} from "@playwright/test";

test("environment helpers read real computed directions across elements and documents", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/env.js"), await import("/ported/env.js")];
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.dir = "rtl"; parent.append(child); document.body.append(parent);
    const frame = document.createElement("iframe");
    frame.srcdoc = '<!doctype html><body dir="rtl"><span id="child"></span></body>';
    const loaded = new Promise(resolve => frame.addEventListener("load", resolve, {once: true}));
    document.body.append(frame); await loaded;
    const other = frame.contentDocument!.getElementById("child")!;
    return modules.map(module => {
      parent.dir = "rtl";
      const inherited = module.isRTL(child);
      parent.dir = "ltr";
      return {browser: module.isBrowser, ios: module.isIOS(), inherited, changed: module.isRTL(child), other: module.isRTL(other), missing: [module.isRTL(null), module.isRTL(undefined)]};
    });
  });
  expect(results[1]).toEqual(results[0]);
  expect(results[0]).toMatchObject({browser: true, inherited: true, changed: false, other: true, missing: [false, false]});
});

test("iOS detection preserves native platform short circuiting and touch thresholds", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/env.js"), await import("/ported/env.js")];
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "platform");
    const touchDescriptor = Object.getOwnPropertyDescriptor(navigator, "maxTouchPoints");
    try {
      return modules.map(module => {
        const rows = [];
        for (const platform of ["iPhone", "iPad", "iPod", "MacIntel", "Linux"]) {
          for (const touches of [0, 1, 2]) {
            const calls: string[] = [];
            Object.defineProperty(navigator, "platform", {configurable: true, get() {calls.push("platform"); return platform;}});
            Object.defineProperty(navigator, "maxTouchPoints", {configurable: true, get() {calls.push("touches"); return touches;}});
            rows.push({platform, touches, ios: module.isIOS(), calls});
          }
        }
        return rows;
      });
    } finally {
      if (descriptor) Object.defineProperty(navigator, "platform", descriptor); else Reflect.deleteProperty(navigator, "platform");
      if (touchDescriptor) Object.defineProperty(navigator, "maxTouchPoints", touchDescriptor); else Reflect.deleteProperty(navigator, "maxTouchPoints");
    }
  });
  expect(results[1]).toEqual(results[0]);
  expect(results[0].find(row => row.platform === "MacIntel" && row.touches === 1)?.ios).toBe(false);
  expect(results[0].find(row => row.platform === "MacIntel" && row.touches === 2)?.ios).toBe(true);
});
