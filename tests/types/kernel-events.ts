import {on} from "../../crates/core/src/foundation/kernel/events.js";

const button = document.createElement("button");
on(button, "click", event => {
  event.preventDefault();
  event.clientX;
  // @ts-expect-error Native click events have no arbitrary property.
  event.nonexistentEventProperty;
}, {capture: true, once: true});

on(document, "keydown", event => { event.key; }, {capture: false});

// @ts-expect-error Capture must be a boolean.
on(button, "click", () => {}, {capture: "wrong"});

// @ts-expect-error The event name must belong to the native event map.
on(button, "not-a-native-event", () => {});
