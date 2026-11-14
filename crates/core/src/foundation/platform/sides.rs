//! Rust adaptation of UI SDK foundation/platform/sides.ts; see UPSTREAM.md.
/// A side of the anchor. Start and end are logical: swapped in right-to-left layouts.
#[derive(Clone, Copy)]
pub enum Side {
    #[cfg_attr(rust_js, rust_js::name = "top")]
    Top,
    #[cfg_attr(rust_js, rust_js::name = "bottom")]
    Bottom,
    #[cfg_attr(rust_js, rust_js::name = "left")]
    Left,
    #[cfg_attr(rust_js, rust_js::name = "right")]
    Right,
    #[cfg_attr(rust_js, rust_js::name = "start")]
    Start,
    #[cfg_attr(rust_js, rust_js::name = "end")]
    End,
}

/// A side on screen, after logical sides are resolved.
#[derive(Debug, PartialEq)]
pub enum PhysicalSide {
    #[cfg_attr(rust_js, rust_js::name = "top")]
    Top,
    #[cfg_attr(rust_js, rust_js::name = "bottom")]
    Bottom,
    #[cfg_attr(rust_js, rust_js::name = "left")]
    Left,
    #[cfg_attr(rust_js, rust_js::name = "right")]
    Right,
}

// Start and end on screen.
pub fn physical_side(side: Side, rtl: Option<bool>) -> PhysicalSide {
    let rtl = rtl.unwrap_or(false);
    match side {
        Side::Start => {
            if rtl {
                PhysicalSide::Right
            } else {
                PhysicalSide::Left
            }
        }
        Side::End => {
            if rtl {
                PhysicalSide::Left
            } else {
                PhysicalSide::Right
            }
        }
        Side::Top => PhysicalSide::Top,
        Side::Bottom => PhysicalSide::Bottom,
        Side::Left => PhysicalSide::Left,
        Side::Right => PhysicalSide::Right,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_logical_sides_follow_direction() {
        assert_eq!(physical_side(Side::Start, None), PhysicalSide::Left);
        assert_eq!(physical_side(Side::Start, Some(true)), PhysicalSide::Right);
        assert_eq!(physical_side(Side::End, Some(true)), PhysicalSide::Left);
        assert_eq!(physical_side(Side::Top, Some(true)), PhysicalSide::Top);
        assert_eq!(physical_side(Side::Left, Some(true)), PhysicalSide::Left);
    }
}
