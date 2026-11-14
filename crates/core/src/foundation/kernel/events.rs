//! Rust adaptation of UI SDK foundation/kernel/events.ts; see UPSTREAM.md.
use webapi::{AddEventListenerOptions, Event, EventInit, EventTargetExt, Listen, event};

/// Adds a listener and returns what removes it. The same listener and options are retained.
pub fn on<'a, Target, Name>(
    target: &'a Target,
    name: Name,
    listener: &'static dyn Fn(&'static <Target as Listen<Name>>::Event),
    options: Option<&'a AddEventListenerOptions<'a>>,
) -> impl Fn() + 'a
where
    Target: EventTargetExt + Listen<Name>,
    Name: Copy + 'a,
{
    target.add_event_listener(
        name,
        listener,
        options.map(|options| options as &dyn webapi::IntoAddEventListenerOptionsOrBool),
    );
    move || {
        target.remove_event_listener(
            name,
            listener,
            options.map(|options| options as &dyn webapi::IntoEventListenerOptionsOrBool),
        )
    }
}

// What an onSelect handler receives when no DOM event is left to cancel, like
// for a shortcut or a controller's call. A real Event, so target, timeStamp
// and preventDefault behave as on a click; Node has Event too.
pub fn select_event() -> &'static Event {
    event::new(
        "select",
        Some(EventInit {
            cancelable: Some(true),
            ..EventInit::default()
        }),
    )
}

/// Optional composition fields shared by keyboard/input events and framework events.
#[derive(Default)]
pub struct CompositionFields {
    pub is_composing: Option<bool>,
    pub key_code: Option<f64>,
}

#[cfg_attr(rust_js, rust_js::untagged)]
pub enum NativeCompositionEvent<'a> {
    Event(&'a Event),
    Fields(&'a CompositionFields),
}

pub struct WrappedCompositionEvent<'a> {
    #[cfg_attr(rust_js, rust_js::test)]
    pub native_event: NativeCompositionEvent<'a>,
}

#[cfg_attr(rust_js, rust_js::untagged)]
pub enum CompositionInput<'a> {
    Wrapped(WrappedCompositionEvent<'a>),
    #[cfg_attr(rust_js, rust_js::otherwise)]
    Direct(&'a CompositionFields),
}

// Every payload is an object, never null or undefined.
unsafe impl js::Defined for CompositionInput<'_> {}

/// Whether an input method is composing text. Safari's legacy key code 229
/// counts even when is_composing is false, so the final candidate is left alone.
pub fn is_composing(event: &CompositionInput) -> bool {
    let event = js::unknown(event);
    let key = if js::has(event, "nativeEvent") {
        js::get(event, "nativeEvent")
    } else {
        Some(event)
    };
    // SAFETY: the input union guarantees an object. Its two fields are optional.
    // Like the upstream assertion, a plain Event need not declare either one.
    let key: &CompositionFields = unsafe { js::cast(key) };
    key.is_composing == Some(true) || key.key_code == Some(229.0)
}
