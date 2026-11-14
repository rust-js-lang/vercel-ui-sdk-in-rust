//! Rust adaptation of UI SDK foundation/platform/platform.ts; see UPSTREAM.md.
use super::env::IS_BROWSER;
use js::{Dict, dict};
use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::rc::Rc;
use webapi::{
    Document, DocumentFragment, Element, HTMLElement, KeyboardEvent, Node, ShadowRoot,
    window_global,
};

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Platform {
    #[cfg_attr(rust_js, rust_js::name = "apple")]
    Apple,
    #[cfg_attr(rust_js, rust_js::name = "other")]
    Other,
}

#[cfg_attr(rust_js, rust_js::untagged)]
#[derive(Clone, Copy)]
pub enum PortalTarget<'a> {
    Element(&'a Element),
    Fragment(&'a DocumentFragment),
}

thread_local! {
    static PLATFORM_OVERRIDE: Cell<Option<Platform>> = const { Cell::new(None) };
    static APPLE: Cell<Option<bool>> = const { Cell::new(None) };
    static PARSED: [RefCell<HashMap<String, Rc<Vec<String>>>>; 2] = [RefCell::default(), RefCell::default()];
    static KEY_NAMES: &'static Dict<&'static str> = dict::from_entries(vec![
        ("alt", "Alt"),
        ("option", "Alt"),
        ("opt", "Alt"),
        ("shift", "Shift"),
        ("ctrl", "Control"),
        ("control", "Control"),
        ("cmd", "Meta"),
        ("command", "Meta"),
        ("meta", "Meta"),
        ("backspace", "Backspace"),
        ("delete", "Delete"),
        ("del", "Delete"),
        ("enter", "Enter"),
        ("return", "Enter"),
        ("escape", "Escape"),
        ("esc", "Escape"),
        ("tab", "Tab"),
        ("space", "Space"),
        ("up", "ArrowUp"),
        ("down", "ArrowDown"),
        ("left", "ArrowLeft"),
        ("right", "ArrowRight"),
        ("arrowup", "ArrowUp"),
        ("arrowdown", "ArrowDown"),
        ("arrowleft", "ArrowLeft"),
        ("arrowright", "ArrowRight"),
        ("home", "Home"),
        ("end", "End"),
        ("pageup", "PageUp"),
        ("pagedown", "PageDown"),
    ]);
    static APPLE_GLYPHS: &'static Dict<&'static str> = dict::from_entries(vec![
        ("Meta", "⌘"),
        ("Control", "⌃"),
        ("Alt", "⌥"),
        ("Shift", "⇧"),
        ("Backspace", "⌫"),
        ("Delete", "⌦"),
        ("Enter", "↩"),
        ("Escape", "⎋"),
        ("Tab", "⇥"),
        ("Space", "␣"),
        ("ArrowUp", "↑"),
        ("ArrowDown", "↓"),
        ("ArrowLeft", "←"),
        ("ArrowRight", "→"),
        ("PageUp", "⇞"),
        ("PageDown", "⇟"),
        ("Home", "↖"),
        ("End", "↘"),
    ]);
    static NAMES: &'static Dict<&'static str> = dict::from_entries(vec![
        ("Control", "Ctrl"),
        ("Delete", "Del"),
        ("Escape", "Esc"),
        ("ArrowUp", "Up"),
        ("ArrowDown", "Down"),
        ("ArrowLeft", "Left"),
        ("ArrowRight", "Right"),
    ]);
}

/// The top layer (the popover attribute) keeps popups above everything without
/// portals. Older browsers lack it, and adapters portal to the body instead.
pub fn supports_top_layer() -> bool {
    IS_BROWSER.with(|browser| *browser)
        && js::is_function((
            js::class::<HTMLElement>().prototype(),
            HTMLElement::show_popover,
        ))
}

/// Where a popup should render. An explicit container wins. Without top layer
/// support, the body. Otherwise null: render in place.
#[cfg_attr(rust_js, rust_js::nullable)]
pub fn portal_target(container: Option<PortalTarget<'_>>) -> Option<PortalTarget<'_>> {
    if container.is_some() {
        return container;
    }
    if IS_BROWSER.with(|browser| *browser) && !supports_top_layer() {
        return window_global::document()
            .body()
            .map(|body| PortalTarget::Element(body));
    }
    None
}

// The focused element, inside shadow roots too.
#[cfg_attr(rust_js, rust_js::nullable)]
pub fn active_element(doc: Option<&Document>) -> Option<&'static HTMLElement> {
    let doc = doc.unwrap_or_else(|| window_global::document());
    let mut active = doc.active_element();
    while active
        .and_then(Element::shadow_root)
        .and_then(ShadowRoot::active_element)
        .is_some()
    {
        // SAFETY: these are the original HTMLElement/ShadowRoot assertions.
        // The body deliberately reads shadowRoot again, just as the original.
        let el: &Element = unsafe { js::cast(active.map(js::unknown)) };
        let shadow: &ShadowRoot = unsafe { js::cast(el.shadow_root().map(js::unknown)) };
        active = shadow.active_element();
    }
    unsafe { js::cast(active.map(js::unknown)) }
}

// The node, then each element it shows through in an outer tree: the slot
// it's assigned to and the host of its shadow root. An element in an outer
// tree holds the node when it holds one of these.
pub fn composed_hops(node: &Node) -> Vec<&Node> {
    let mut hops = vec![node];
    let mut at = Some(node);
    while let Some(current) = at {
        // SAFETY: the original reads assignedSlot through an Element assertion;
        // on a non-element this optional member is simply absent.
        let element: &Element = unsafe { js::cast(Some(js::unknown(current))) };
        let next: Option<&Node> = element
            .assigned_slot()
            .map(|slot| -> &Node { slot })
            .or_else(|| current.parent_node())
            .or_else(|| {
                // Partial<ShadowRoot>'s optional host, without a realm check.
                unsafe { js::cast(js::get(current, "host")) }
            });
        if let Some(next) = next
            && !js::strict_equals(Some(next), current.parent_node())
        {
            hops.push(next);
        }
        at = next;
    }
    hops
}

// Whether `container` holds `node`, across shadow roots, like a button in the
// shadow root of a custom element inside a popup. `Node.contains` stops at them.
pub fn composed_contains(container: &Node, node: &Node) -> bool {
    composed_hops(node)
        .iter()
        .any(|hop| container.contains(Some(hop)))
}

// Whether the user asked for less motion. Animations jump instead.
pub fn prefers_reduced_motion() -> bool {
    js::is_function(window_global::match_media)
        && window_global::match_media("(prefers-reduced-motion: reduce)").matches()
}

/// Overrides platform detection for shortcuts and their labels, like in tests or on the server.
pub fn set_platform(platform: Platform) {
    PLATFORM_OVERRIDE.set(Some(platform));
}

pub fn is_apple() -> bool {
    if let Some(platform) = PLATFORM_OVERRIDE.get() {
        return platform == Platform::Apple;
    }
    if let Some(apple) = APPLE.get() {
        return apple;
    }
    let apple = IS_BROWSER.with(|browser| *browser) && {
        let platform = window_global::navigator().platform();
        let platform = if platform.is_empty() {
            window_global::navigator().user_agent()
        } else {
            platform
        };
        js::reg_exp::new("Mac|iPhone|iPad|iPod", "").test(&platform)
    };
    APPLE.set(Some(apple));
    apple
}

// What to assume before the client is known. Servers render this, and the
// first client render matches it, so hydration never sees a mismatch.
pub fn initial_apple() -> bool {
    PLATFORM_OVERRIDE.get() == Some(Platform::Apple)
}

/// "mod+shift+n" becomes "Meta+Shift+N" on Apple platforms and "Control+Shift+N" elsewhere.
pub fn aria_keyshortcuts(shortcut: &str, apple: Option<bool>) -> String {
    let apple = apple.unwrap_or_else(is_apple);
    js::string::split(shortcut, "+")
        .iter()
        .map(|key| {
            let lower = key.to_lowercase();
            if lower == "mod" {
                return if apple { "Meta" } else { "Control" }.to_owned();
            }
            if KEY_NAMES.with(|names| js::truthy(dict::get(*names, &lower))) {
                // SAFETY: the original repeats this unchecked Record read.
                let name: &str = unsafe {
                    js::cast(
                        KEY_NAMES
                            .with(|names| dict::get(*names, &lower))
                            .map(js::unknown),
                    )
                };
                return name.to_owned();
            }
            if js::string::length(key) == 1 {
                key.to_uppercase()
            } else {
                // SAFETY: same unchecked string-index assertion as TypeScript's
                // key[0]. Its missing value still receives toUpperCase in JS.
                let first: &str = unsafe { js::cast(js::string::get(key, 0.0).map(js::unknown)) };
                first.to_uppercase() + &js::string::slice(key, 1.0, None)
            }
        })
        .collect::<Vec<_>>()
        .join("+")
}

/// What to show next to an item: "⌘N" on Apple platforms, "Ctrl+N" elsewhere.
/// The text is wrapped in a left-to-right isolate, so a right-to-left layout
/// never reorders it into "N⌘".
pub fn format_shortcut(shortcut: &str, apple: Option<bool>) -> String {
    let apple = apple.unwrap_or_else(is_apple);
    let keys = js::string::split(&aria_keyshortcuts(shortcut, Some(apple)), "+");
    let text = if apple {
        keys.iter()
            .map(|key| {
                APPLE_GLYPHS
                    .with(|glyphs| dict::get(glyphs, key))
                    .copied()
                    .unwrap_or(key)
                    .to_owned()
            })
            .collect::<Vec<_>>()
            .join("")
    } else {
        keys.iter()
            .map(|key| {
                NAMES
                    .with(|names| dict::get(names, key))
                    .copied()
                    .unwrap_or(key)
                    .to_owned()
            })
            .collect::<Vec<_>>()
            .join("+")
    };
    format!("\u{2066}{text}\u{2069}")
}

// Letters and digits match by physical key, through `event.code`, when the
// typed character isn't the key itself. Option+N on a Mac types "˜", and other
// alphabets type their own letters. Every other key matches by `event.key`.
fn matches_key(event: &KeyboardEvent, key: &str) -> bool {
    let typed = if js::string::length(&event.key()) == 1 {
        event.key().to_lowercase()
    } else {
        event.key()
    };
    if key == "Space" {
        return typed == " ";
    }
    if !js::reg_exp::new("^[A-Z0-9]$", "").test(key) {
        return typed.to_lowercase() == key.to_lowercase();
    }
    if typed == key.to_lowercase() {
        return true;
    }
    // A Latin letter or digit that isn't this key is another key on this layout.
    if js::reg_exp::new("^[a-z0-9]$", "").test(&typed) {
        return false;
    }
    event.code()
        == if js::reg_exp::new(r"\d", "").test(key) {
            format!("Digit{key}")
        } else {
            format!("Key{key}")
        }
}

/// Whether a key press matches a shortcut like "mod+k". mod is Command on
/// Apple platforms and Control elsewhere, and letters match by physical key
/// when the layout types another character, like Option+N on a Mac.
pub fn matches_shortcut(event: &KeyboardEvent, shortcut: &str, apple: Option<bool>) -> bool {
    let apple = apple.unwrap_or_else(is_apple);
    let keys = PARSED.with(|parsed| parsed[usize::from(apple)].borrow().get(shortcut).cloned());
    let keys = keys.unwrap_or_else(|| {
        let keys = Rc::new(js::string::split(
            &aria_keyshortcuts(shortcut, Some(apple)),
            "+",
        ));
        PARSED.with(|parsed| {
            parsed[usize::from(apple)]
                .borrow_mut()
                .insert(shortcut.to_owned(), Rc::clone(&keys))
        });
        keys
    });
    // The split is nonempty, including for an empty shortcut.
    matches_key(event, keys.last().expect("shortcut split is nonempty"))
        && event.meta_key() == keys.iter().any(|key| key == "Meta")
        && event.ctrl_key() == keys.iter().any(|key| key == "Control")
        && event.alt_key() == keys.iter().any(|key| key == "Alt")
        && event.shift_key() == keys.iter().any(|key| key == "Shift")
}

// Whether a shortcut holds Command, Control or Option, so it can't be typing.
pub fn has_command_modifier(keys: &str) -> bool {
    js::reg_exp::new(r"(^|\+)(Meta|Control|Alt)(\+|$)", "")
        .test(&aria_keyshortcuts(keys, Some(true)))
}
