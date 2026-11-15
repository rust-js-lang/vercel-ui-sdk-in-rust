//! Rust adaptation of UI SDK foundation/platform/env.ts; see UPSTREAM.md.
use webapi::{Element, window_global};

thread_local! {
    #[cfg_attr(rust_js, rust_js::name = "isBrowser")]
    pub static IS_BROWSER: bool = js::is_defined(window_global::window) && js::is_defined(window_global::document);
}

// iPhone and iPad, including iPads that report a Mac.
#[cfg_attr(rust_js, rust_js::name = "isIOS")]
pub fn is_ios() -> bool {
    IS_BROWSER.with(|browser| {
        *browser
            && (js::reg_exp::new(r"iP(hone|ad|od)", "")
                .test(&window_global::navigator().platform())
                || (window_global::navigator().platform() == "MacIntel"
                    && window_global::navigator().max_touch_points() > 1.0))
    })
}

/// Whether an element lays out right to left, from its computed direction. False on the server.
#[cfg_attr(rust_js, rust_js::name = "isRTL")]
#[cfg_attr(rust_js, rust_js::present(el))]
pub fn is_rtl(el: Option<&Element>) -> bool {
    el.is_some_and(|el| {
        IS_BROWSER.with(|browser| *browser)
            && window_global::get_computed_style(el, None).direction() == "rtl"
    })
}
