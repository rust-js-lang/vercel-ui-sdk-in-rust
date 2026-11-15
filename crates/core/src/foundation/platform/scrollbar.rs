//! Rust adaptation of UI SDK foundation/platform/scrollbar.ts; see UPSTREAM.md.
use webapi::{Element, Node, PointerEvent, window_global};

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ScrollbarPoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ScrollbarBorders {
    pub top: f64,
    pub right: f64,
    pub bottom: f64,
    pub left: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ScrollbarBox {
    pub width: f64,
    pub height: f64,
    pub client_left: f64,
    pub client_top: f64,
    pub client_width: f64,
    pub client_height: f64,
    pub borders: ScrollbarBorders,
}

// Whether a press landed on an element's scrollbar rather than its content.
// Coordinates are relative to the element's border box.
pub fn on_scrollbar(point: &ScrollbarPoint, r#box: &ScrollbarBox) -> bool {
    let ScrollbarPoint { x, y } = *point;
    let ScrollbarBox { borders, .. } = r#box;
    let in_borders = x >= borders.left
        && x < r#box.width - borders.right
        && y >= borders.top
        && y < r#box.height - borders.bottom;
    // The padding box. In right-to-left layouts, clientLeft includes a scrollbar on the left.
    let in_padding = x >= r#box.client_left
        && x < r#box.client_left + r#box.client_width
        && y >= r#box.client_top
        && y < r#box.client_top + r#box.client_height;
    in_borders && !in_padding
}

pub fn pressed_scrollbar(event: &PointerEvent, target: &Node) -> bool {
    if !js::instance_of(target, js::class::<Element>()) {
        return false;
    }
    // SAFETY: the same-realm native instanceof above proves this Element.
    let target: &Element = unsafe { js::cast(Some(js::unknown(target))) };
    let doc = target.owner_document();
    // The page's own scrollbar sits outside the root element's client area.
    if js::strict_equals(Some(target), doc.document_element()) {
        return event.client_x() >= target.client_width()
            || event.client_y() >= target.client_height();
    }
    if target.client_width() == 0.0 && target.client_height() == 0.0 {
        return false;
    }
    let rect = target.get_bounding_client_rect();
    let style = window_global::get_computed_style(target, None);
    on_scrollbar(
        &ScrollbarPoint {
            x: event.client_x() - rect.left(),
            y: event.client_y() - rect.top(),
        },
        &ScrollbarBox {
            width: rect.width(),
            height: rect.height(),
            client_left: target.client_left(),
            client_top: target.client_top(),
            client_width: target.client_width(),
            client_height: target.client_height(),
            borders: ScrollbarBorders {
                top: js::or(js::parse_float(style.border_top_width()), 0.0),
                right: js::or(js::parse_float(style.border_right_width()), 0.0),
                bottom: js::or(js::parse_float(style.border_bottom_width()), 0.0),
                left: js::or(js::parse_float(style.border_left_width()), 0.0),
            },
        },
    )
}

#[cfg(test)]
mod tests {
    use super::{ScrollbarBorders, ScrollbarBox, ScrollbarPoint, on_scrollbar};

    #[test]
    fn rtl_gutter_and_bottom_rail_exclude_content_and_borders() {
        let geometry = ScrollbarBox {
            width: 100.0,
            height: 80.0,
            client_left: 17.0,
            client_top: 2.0,
            client_width: 80.0,
            client_height: 60.0,
            borders: ScrollbarBorders {
                top: 2.0,
                right: 3.0,
                bottom: 4.0,
                left: 1.0,
            },
        };
        for (x, y, expected) in [
            (0.0, 20.0, false),
            (1.0, 20.0, true),
            (16.999, 20.0, true),
            (17.0, 20.0, false),
            (97.0, 20.0, false),
            (20.0, 62.0, true),
            (20.0, 76.0, false),
            (f64::NAN, 20.0, false),
            (f64::INFINITY, 20.0, false),
        ] {
            assert_eq!(on_scrollbar(&ScrollbarPoint { x, y }, &geometry), expected);
        }
    }
}
