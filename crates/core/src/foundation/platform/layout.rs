//! Rust adaptation of UI SDK foundation/platform/layout.ts; see UPSTREAM.md.
use webapi::{CSSStyleProperties, Element, HTMLElement, window_global};

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LayoutPoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LayoutSize {
    pub width: f64,
    pub height: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LayoutBox {
    pub left: f64,
    pub top: f64,
    pub width: f64,
    pub height: f64,
    pub right: f64,
    pub bottom: f64,
}

fn is_transformed(style: &CSSStyleProperties) -> bool {
    style.transform() != "none"
        || style.translate() != "none"
        || style.scale() != "none"
        || style.rotate() != "none"
}

// Elements up to the offset parent can move the rects without touching the
// offsets, by a transform, or by scrolling when they aren't the offset parent.
fn moves_rects(node: &HTMLElement, parent: &HTMLElement) -> bool {
    let mut current: Option<&Element> = Some(node);
    while let Some(el) = current {
        if js::strict_equals(el, parent) {
            break;
        }
        let scrolled = !js::strict_equals(el, node)
            && (js::truthy(Some(&el.scroll_left())) || js::truthy(Some(&el.scroll_top())));
        if scrolled || is_transformed(window_global::get_computed_style(el, None)) {
            return true;
        }
        current = el.parent_element();
    }
    false
}

// offsetLeft rounds to whole pixels, so the fraction comes from the rects,
// scaled back to layout pixels. Offsets from the body skip its margin, and
// rects a pixel or more away from the offsets were moved, so the offsets stand.
fn offset_in(node: &HTMLElement, parent: &HTMLElement) -> LayoutPoint {
    let offset = LayoutPoint {
        x: node.offset_left() + parent.client_left(),
        y: node.offset_top() + parent.client_top(),
    };
    if js::strict_equals(Some(parent), node.owner_document().body()) || moves_rects(node, parent) {
        return offset;
    }
    let rect = node.get_bounding_client_rect();
    let parent_rect = parent.get_bounding_client_rect();
    let size = layout_size(parent);
    let x = ((rect.left() - parent_rect.left()) * size.width) / parent_rect.width()
        + parent.scroll_left();
    let y = ((rect.top() - parent_rect.top()) * size.height) / parent_rect.height()
        + parent.scroll_top();
    LayoutPoint {
        x: if (x - offset.x).abs() < 1.0 {
            x
        } else {
            offset.x
        },
        y: if (y - offset.y).abs() < 1.0 {
            y
        } else {
            offset.y
        },
    }
}

// An element's place in the page's layout: its border box's offset from the
// start of the offset parent chain. Offsets come from layout, so transforms and
// scrolling never move them.
pub fn layout_origin(el: &HTMLElement) -> LayoutPoint {
    let mut x = 0.0;
    let mut y = 0.0;
    let mut current = Some(el);
    while let Some(node) = current {
        // SAFETY: this is the same HTMLElement assertion as the original
        // offsetParent traversal, without changing its runtime representation.
        let parent: Option<&HTMLElement> =
            unsafe { js::cast(node.offset_parent().map(js::unknown)) };
        if let Some(parent) = parent {
            let offset = offset_in(node, parent);
            x += offset.x;
            y += offset.y;
        } else {
            x += node.offset_left();
            y += node.offset_top();
        }
        // Read again as the original for-loop update does, including after
        // the no-parent branch. DOM getters may have observable side effects.
        current = unsafe { js::cast(node.offset_parent().map(js::unknown)) };
    }
    LayoutPoint { x, y }
}

// An element's border box size in layout pixels, keeping the fraction that
// offsetWidth rounds away. Inline elements have no computed size, so they fall
// back to the offsets.
pub fn layout_size(el: &HTMLElement) -> LayoutSize {
    let style = window_global::get_computed_style(el, None);
    let total = |names: &[&str]| {
        names.iter().fold(0.0, |sum, name| {
            let value = js::parse_float(style.get_property_value(name));
            sum + if js::truthy(Some(&value)) { value } else { 0.0 }
        })
    };
    let content_box = style.box_sizing() != "border-box";
    let width = js::parse_float(style.width())
        + if content_box {
            total(&[
                "padding-left",
                "padding-right",
                "border-left-width",
                "border-right-width",
            ])
        } else {
            0.0
        };
    let height = js::parse_float(style.height())
        + if content_box {
            total(&[
                "padding-top",
                "padding-bottom",
                "border-top-width",
                "border-bottom-width",
            ])
        } else {
            0.0
        };
    LayoutSize {
        width: if width.is_finite() {
            width
        } else {
            el.offset_width()
        },
        height: if height.is_finite() {
            height
        } else {
            el.offset_height()
        },
    }
}

// An element's box inside a container's scrollable area: the offset from each
// edge of that area, and the size. What an indicator positioned inside the
// container needs to cover the element.
pub fn layout_box(el: &HTMLElement, container: &HTMLElement) -> LayoutBox {
    let at = layout_origin(el);
    let origin = layout_origin(container);
    let left = at.x - origin.x - container.client_left();
    let top = at.y - origin.y - container.client_top();
    let LayoutSize { width, height } = layout_size(el);
    let area = LayoutSize {
        width: container.scroll_width(),
        height: container.scroll_height(),
    };
    LayoutBox {
        left,
        top,
        width,
        height,
        right: area.width - (left + width),
        bottom: area.height - (top + height),
    }
}
