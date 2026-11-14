import {test, expect} from "@playwright/test";

test("layout geometry matches upstream across fractional boxes, transforms and scrolling", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const original = await import("/reference/layout.js");
    const ported = await import("/ported/layout.js");
    const results = [];
    document.body.style.margin = "13.25px";
    for (const boxSizing of ["content-box", "border-box"]) {
      for (const transform of ["none", "translate(0.3px, 0.7px)", "scale(1.25)"]) {
        for (const scrolled of [false, true]) {
          const parent = document.createElement("div");
          const middle = document.createElement("div");
          const child = document.createElement("div");
          parent.style.cssText = "position:relative;width:201.5px;height:143.25px;padding:4.5px;border:3px solid;overflow:scroll";
          middle.style.cssText = "width:400px;height:300px;overflow:scroll;transform:" + transform;
          child.style.cssText = "position:relative;left:7.3px;top:11.6px;width:97.25px;height:44.75px;padding:2.5px 3.75px;border:1px solid;box-sizing:" + boxSizing;
          middle.append(child); parent.append(middle); document.body.append(parent);
          if (scrolled) {parent.scrollLeft = 5; parent.scrollTop = 9; middle.scrollLeft = 3; middle.scrollTop = 4;}
          const measure = (module: typeof original) => ({origin: module.layoutOrigin(child), size: module.layoutSize(child), box: module.layoutBox(child, parent)});
          results.push({original: measure(original), ported: measure(ported)});
          parent.remove();
        }
      }
    }
    return results;
  });
  expect(results).toHaveLength(12);
  for (const row of results) expect(row.ported).toEqual(row.original);
});

test("layout measurement preserves detached, inline and body-offset behavior", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/layout.js"), await import("/ported/layout.js")];
    const detached = document.createElement("div");
    const inline = document.createElement("span");
    const absolute = document.createElement("div");
    inline.textContent = "Fractional inline text";
    inline.style.cssText = "font-size:13.3px;padding:1.2px;border:1px solid";
    absolute.style.cssText = "position:absolute;left:23.7px;top:41.4px;width:51.5px;height:22.25px";
    document.body.style.cssText = "margin:9.5px";
    document.body.append(inline, absolute);
    return modules.map(module => [detached, inline, absolute, document.body].map(el => ({origin: module.layoutOrigin(el), size: module.layoutSize(el), box: module.layoutBox(el, document.body)})));
  });
  expect(results[1]).toEqual(results[0]);
});

test("layout traversal retains repeated offset-parent reads and native getter order", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/layout.js"), await import("/ported/layout.js")];
    const results = [];
    const nativeStyle = window.getComputedStyle;
    try {
      for (const module of modules) {
        const calls: string[] = [];
        const parent = document.createElement("div");
        const child = document.createElement("div");
        parent.append(child); document.body.append(parent);
        for (const [el, name] of [[child, "child"], [parent, "parent"]] as const) {
          for (const [key, value] of Object.entries({offsetParent: el === child ? parent : null, offsetLeft: 12, offsetTop: 20, offsetWidth: 80, offsetHeight: 60, clientLeft: 2, clientTop: 3, scrollLeft: 0, scrollTop: 0})) {
            Object.defineProperty(el, key, {configurable: true, get() {calls.push(name + "." + key); return value;}});
          }
        }
        for (const [el, name] of [[child, "child"], [parent, "parent"]] as const) {
          const measure = el.getBoundingClientRect.bind(el);
          el.getBoundingClientRect = () => {calls.push(name + ".rect"); return new Proxy(measure(), {get(target, key) {calls.push(name + ".rect." + String(key)); return Reflect.get(target, key, target);}});};
        }
        const style = {
          get transform() {calls.push("transform"); return "none";},
          get translate() {calls.push("translate"); return "none";},
          get scale() {calls.push("scale"); return "none";},
          get rotate() {calls.push("rotate"); return "none";},
          get boxSizing() {calls.push("boxSizing"); return "content-box";},
          get width() {calls.push("width"); return "auto";},
          get height() {calls.push("height"); return "44.25px";},
          getPropertyValue(name: string) {calls.push(name); return name === "padding-top" ? "NaN" : "2.5px";},
        };
        window.getComputedStyle = function(this: unknown) {"use strict"; calls.push(this === undefined ? "computedStyle" : "boundComputedStyle"); return style as unknown as ReturnType<typeof nativeStyle>;};
        const origin = module.layoutOrigin(child);
        const size = module.layoutSize(child);
        const originReads = [...calls];
        const box = module.layoutBox(child, parent);
        results.push({origin, size, box, calls, originReads});
        parent.remove();
      }
    } finally {window.getComputedStyle = nativeStyle;}
    return results;
  });
  expect(results[1]).toEqual(results[0]);
  expect(results[0].originReads.filter(call => call === "child.offsetParent")).toHaveLength(2);
  expect(results[0].originReads.filter(call => call === "parent.offsetParent")).toHaveLength(2);
});

test("layout accepts elements from another document without adding realm checks", async ({page}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const original = await import("/reference/layout.js");
    const ported = await import("/ported/layout.js");
    const frame = document.createElement("iframe");
    frame.srcdoc = '<!doctype html><body style="margin:11.5px"><div id="container" style="position:relative;width:210.75px;height:120.5px;padding:3.25px;border:2px solid"><div id="child" style="position:absolute;left:7.3px;top:9.6px;width:63.25px;height:24.75px;padding:1.5px"></div></div>';
    const loaded = new Promise(resolve => frame.addEventListener("load", resolve, {once: true}));
    document.body.append(frame);
    await loaded;
    const child = frame.contentDocument!.getElementById("child")!;
    const container = frame.contentDocument!.getElementById("container")!;
    const measure = (module: typeof original) => ({origin: module.layoutOrigin(child), size: module.layoutSize(child), box: module.layoutBox(child, container)});
    return {sameRealm: child instanceof HTMLElement, original: measure(original), ported: measure(ported)};
  });
  expect(result.sameRealm).toBe(false);
  expect(result.ported).toEqual(result.original);
});
