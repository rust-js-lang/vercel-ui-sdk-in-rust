import {test, expect} from "@playwright/test";

test("active element descends nested shadow roots and preserves repeated native getter reads", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/platform.js"), await import("/ported/platform.js")];
    const host = document.createElement("div"); host.id = "outer";
    const root = host.attachShadow({mode: "open"});
    const inner = document.createElement("div"); inner.id = "inner";
    const innerRoot = inner.attachShadow({mode: "open"});
    const input = document.createElement("input"); input.id = "focused";
    innerRoot.append(input); root.append(inner); document.body.append(host); input.focus();
    return modules.map(module => {
      const calls: string[] = [];
      for (const [el, shadow] of [[host, root], [inner, innerRoot]] as const) {
        Object.defineProperty(el, "shadowRoot", {configurable: true, get() {calls.push(el.id + ".shadowRoot"); return shadow;}});
      }
      const found = module.activeElement();
      return {same: found === input, id: found?.id, calls};
    });
  });
  expect(results[1]).toEqual(results[0]);
  expect(results[0].same).toBe(true);
});

test("composed traversal crosses slots, text nodes, shadow roots and iframe realms", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/platform.js"), await import("/ported/platform.js")];
    const frame = document.createElement("iframe");
    frame.srcdoc = '<!doctype html><body></body>';
    const loaded = new Promise(resolve => frame.addEventListener("load", resolve, {once: true}));
    document.body.append(frame); await loaded;
    const rows = [];
    for (const doc of [document, frame.contentDocument!]) {
      const host = doc.createElement("div"); host.id = "host";
      const shadow = host.attachShadow({mode:"open"});
      const slot = doc.createElement("slot"); slot.id = "slot";
      shadow.append(slot);
      const button = doc.createElement("button"); button.id = "button"; button.textContent = "label";
      host.append(button); doc.body.append(host);
      const text = button.firstChild!;
      rows.push(modules.map(module => ({
        hops: module.composedHops(text).map((node: Node) => node instanceof doc.defaultView!.Element ? (node as Element).id : node.nodeName),
        contains: [module.composedContains(host, text), module.composedContains(slot, text), module.composedContains(shadow, text), module.composedContains(button, host)],
      })));
    }
    return rows;
  });
  for (const rows of results) {
    expect(rows[1]).toEqual(rows[0]);
    expect(rows[0]).toEqual({hops: ["#text", "slot", "host"], contains: [true, true, true, false]});
  }
});

test("portal targets preserve explicit node identity, top-layer fallback and null", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/platform.js"), await import("/ported/platform.js")];
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "showPopover");
    try {
      const explicit = document.createElement("div");
      const fragment = document.createDocumentFragment();
      const results = [];
      for (const support of [true, false]) {
        Object.defineProperty(HTMLElement.prototype, "showPopover", {configurable: true, value: support ? function() {} : undefined});
        results.push(modules.map(module => ({supported: module.supportsTopLayer(), explicit: module.portalTarget(explicit) === explicit, fragment: module.portalTarget(fragment) === fragment, fallback: [undefined, null].map(value => {
          const target = module.portalTarget(value);
          return {body: target === document.body, null: target === null, missing: target === undefined};
        })})));
      }
      return results;
    } finally {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "showPopover", descriptor); else Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
    }
  });
  for (const row of results) expect(row[1]).toEqual(row[0]);
  expect(results[0][0].fallback).toEqual([{body:false,null:true,missing:false},{body:false,null:true,missing:false}]);
  expect(results[1][0].fallback).toEqual([{body:true,null:false,missing:false},{body:true,null:false,missing:false}]);
});

test("reduced-motion follows actual browser media preferences", async ({page}) => {
  await page.goto("/");
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    await page.emulateMedia({reducedMotion});
    const result = await page.evaluate(async () => {
      const original = await import("/reference/platform.js");
      const ported = await import("/ported/platform.js");
      return [original.prefersReducedMotion(), ported.prefersReducedMotion()];
    });
    expect(result).toEqual([reducedMotion === "reduce", reducedMotion === "reduce"]);
  }
});

test("composed closest reads optional method once and retains receiver without reading own call", async ({page}) => {
  await page.goto("/");
  const results = await page.evaluate(async () => {
    const modules = [await import("/reference/platform.js"), await import("/ported/platform.js")];
    return modules.map(module => {
      const calls: unknown[] = [];
      const parent = document.createElement("button");
      const node = document.createTextNode("label"); parent.append(node); document.body.append(parent);
      function closest(this: Node, selector: string) {calls.push(["invoke", this === node, selector]); return parent;}
      Object.defineProperty(closest, "call", {get() {throw new Error("must not read call");}});
      Object.defineProperty(node, "closest", {get() {calls.push("get"); return closest;}});
      const found = module.composedClosest(node, "button");
      parent.remove();
      return {same: found === parent, calls};
    });
  });
  expect(results[1]).toEqual(results[0]);
  expect(results[0]).toEqual({same:true, calls:["get",["invoke",true,"button"]]});
});

test("composed closest preserves real selectors, null results and cross-realm identity", async ({page}) => {
  await page.goto("/");
  const rows = await page.evaluate(async () => {
    const modules = [await import("/reference/platform.js"), await import("/ported/platform.js")];
    const frame = document.createElement("iframe");
    frame.srcdoc = "<!doctype html><body></body>";
    const loaded = new Promise(resolve => frame.addEventListener("load", resolve, {once:true}));
    document.body.append(frame);
    await loaded;
    const rows = [];
    for (const doc of [document, frame.contentDocument!]) {
      const host = doc.createElement("section");
      const shadow = host.attachShadow({mode:"open"});
      const slot = doc.createElement("slot");
      shadow.append(slot);
      const button = doc.createElement("button");
      button.textContent = "label";
      host.append(button);
      doc.body.append(host);
      const text = button.firstChild!;
      rows.push(modules.map(module => ({
        button: module.composedClosest(button, "button") === button,
        // The original follows the slot before the light-DOM parent.
        slot: module.composedClosest(text, "slot") === slot,
        host: module.composedClosest(text, "section") === host,
        missing: module.composedClosest(text, ".missing") === null,
        // The original generic selector promise is intentionally unchecked.
        arbitraryElement: module.composedClosest(host, "section") === host,
      })));
      host.remove();
    }
    frame.remove();
    return rows;
  });
  for (const row of rows) {
    expect(row[1]).toEqual(row[0]);
    expect(row[0]).toEqual({button:true,slot:true,host:true,missing:true,arbitraryElement:true});
  }
});
