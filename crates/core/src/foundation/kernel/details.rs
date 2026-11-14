//! Rust adaptation of UI SDK kernel/details.ts; see UPSTREAM.md.
use std::cell::Cell;
use std::collections::HashSet;

/// How an interaction caused a change.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ChangeSource {
    #[cfg_attr(rust_js, rust_js::name = "mouse")]
    Mouse,
    #[cfg_attr(rust_js, rust_js::name = "touch")]
    Touch,
    #[cfg_attr(rust_js, rust_js::name = "pen")]
    Pen,
    #[cfg_attr(rust_js, rust_js::name = "keyboard")]
    Keyboard,
    #[cfg_attr(rust_js, rust_js::name = "virtual")]
    Virtual,
    #[cfg_attr(rust_js, rust_js::name = "programmatic")]
    Programmatic,
    #[cfg_attr(rust_js, rust_js::name = "agent")]
    Agent,
}

const DISMISS_REASONS: &[&str] = &[
    "escape-key",
    "outside-press",
    "focus-out",
    "window-blur",
    "back",
    "swipe",
];

thread_local! {
    static PROGRAMMATIC_REASONS: HashSet<&'static str> = HashSet::from([
        "image-load", "image-error", "imperative", "item-removed", "unmount",
        "reset", "restore", "timeout", "resize", "page-hide",
    ]);
    // The source of the change being dispatched, inherited by cascades.
    static CAUSE: Cell<Option<ChangeSource>> = const { Cell::new(None) };
}

/// Whether the reason dismissed a layer rather than selected something in it.
pub fn is_dismissal(reason: &str) -> bool {
    DISMISS_REASONS.contains(&reason)
}

/// Resolves a change's source without reading input tracking unless needed.
pub fn resolve_source(
    reason: &str,
    event_source: Option<&dyn Fn() -> ChangeSource>,
) -> ChangeSource {
    if CAUSE.with(Cell::get) == Some(ChangeSource::Agent) {
        return ChangeSource::Agent;
    }
    if PROGRAMMATIC_REASONS.with(|reasons| reasons.contains(reason)) {
        return ChangeSource::Programmatic;
    }
    if let Some(event_source) = event_source {
        let source = event_source();
        if source == ChangeSource::Programmatic {
            return CAUSE.with(Cell::get).unwrap_or(source);
        }
        return source;
    }
    CAUSE.with(Cell::get).unwrap_or(ChangeSource::Programmatic)
}

// A Rust scope guard is the original try/finally: even a panic or a thrown
// callback restores the source the outer interaction was running with.
struct RestoreSource(Option<ChangeSource>);

impl Drop for RestoreSource {
    fn drop(&mut self) {
        CAUSE.with(|cause| cause.set(self.0));
    }
}

/// Runs work as part of an interaction, restoring the outer source afterward.
/// For work after await, pass the action's saved source to another call.
pub fn with_source<T>(source: Option<ChangeSource>, run: impl FnOnce() -> T) -> T {
    let outer = CAUSE.with(|cause| cause.replace(source));
    let _restore = RestoreSource(outer);
    run()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cascades_inherit_and_restore_nested_sources() {
        assert_eq!(resolve_source("press", None), ChangeSource::Programmatic);
        let result = with_source(Some(ChangeSource::Keyboard), || {
            assert_eq!(resolve_source("press", None), ChangeSource::Keyboard);
            with_source(Some(ChangeSource::Agent), || {
                assert_eq!(resolve_source("reset", None), ChangeSource::Agent);
            });
            assert_eq!(resolve_source("reset", None), ChangeSource::Programmatic);
            assert_eq!(resolve_source("press", None), ChangeSource::Keyboard);
            42
        });
        assert_eq!(result, 42);
        assert_eq!(resolve_source("press", None), ChangeSource::Programmatic);
    }

    #[test]
    fn input_tracking_is_lazy_and_programmatic_events_inherit_the_cause() {
        let calls = Cell::new(0);
        let read = || {
            calls.set(calls.get() + 1);
            ChangeSource::Programmatic
        };
        with_source(Some(ChangeSource::Agent), || {
            assert_eq!(resolve_source("press", Some(&read)), ChangeSource::Agent);
        });
        assert_eq!(
            resolve_source("reset", Some(&read)),
            ChangeSource::Programmatic
        );
        assert_eq!(calls.get(), 0);
        with_source(Some(ChangeSource::Keyboard), || {
            assert_eq!(resolve_source("press", Some(&read)), ChangeSource::Keyboard);
        });
        assert_eq!(calls.get(), 1);
    }

    #[cfg(not(rust_js))]
    #[test]
    fn unwinding_restores_the_outer_source() {
        with_source(Some(ChangeSource::Touch), || {
            assert!(
                std::panic::catch_unwind(|| with_source(Some(ChangeSource::Agent), || panic!(
                    "stop"
                )))
                .is_err()
            );
            assert_eq!(resolve_source("press", None), ChangeSource::Touch);
        });
        assert_eq!(resolve_source("press", None), ChangeSource::Programmatic);
    }
}
