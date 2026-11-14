//! Rust adaptation of UI SDK foundation/number/keys.ts; see UPSTREAM.md.
// One keyboard map for numeric controls, as the APG's slider and spinbutton
// patterns describe it, read into a move that step_by applies.
use super::steps::{BoundMove, DirectionalMove, NumberBound, NumberMove, StepDirection, StepSize};
use crate::foundation::kernel::events::{CompositionInput, is_composing};

#[derive(Clone, Copy, Default, PartialEq)]
pub enum Orientation {
    #[default]
    #[cfg_attr(rust_js, rust_js::name = "horizontal")]
    Horizontal,
    #[cfg_attr(rust_js, rust_js::name = "vertical")]
    Vertical,
}

#[derive(Clone, Copy, Default, PartialEq)]
pub enum WritingDirection {
    #[default]
    #[cfg_attr(rust_js, rust_js::name = "ltr")]
    Ltr,
    #[cfg_attr(rust_js, rust_js::name = "rtl")]
    Rtl,
}

#[derive(Clone, Copy, Default, PartialEq)]
pub enum NumberArrows {
    #[default]
    #[cfg_attr(rust_js, rust_js::name = "all")]
    All,
    #[cfg_attr(rust_js, rust_js::name = "horizontal")]
    Horizontal,
    #[cfg_attr(rust_js, rust_js::name = "vertical")]
    Vertical,
}

/// How a control lays out and which arrows it takes.
#[derive(Default)]
pub struct NumberKeyOptions {
    /// Which way the control runs. RTL flips Left/Right only when horizontal.
    pub orientation: Option<Orientation>,
    /// The computed layout direction. Defaults to left-to-right.
    pub dir: Option<WritingDirection>,
    /// Vertical leaves Left/Right to the caret; horizontal leaves Up/Down to the page.
    pub arrows: Option<NumberArrows>,
}

pub struct NumberKeyEvent<'a> {
    pub key: &'a str,
    pub shift_key: Option<bool>,
    pub alt_key: Option<bool>,
    #[cfg_attr(rust_js, rust_js::flatten)]
    pub composition: CompositionInput<'a>,
}

/// The move a key asks of a numeric control, or null for keys left alone.
/// Shift takes the large step; Alt the small one. Composing keys are left alone.
#[cfg_attr(rust_js, rust_js::nullable)]
pub fn step_from_key(
    event: &NumberKeyEvent,
    options: Option<&NumberKeyOptions>,
) -> Option<NumberMove> {
    let defaults = NumberKeyOptions::default();
    let options = options.unwrap_or(&defaults);
    let orientation = options.orientation.unwrap_or_default();
    let dir = options.dir.unwrap_or_default();
    let arrows = options.arrows.unwrap_or_default();
    if is_composing(&event.composition) {
        return None;
    }
    if event.key == "Home" {
        return Some(NumberMove::Bound(BoundMove {
            bound: NumberBound::Min,
        }));
    }
    if event.key == "End" {
        return Some(NumberMove::Bound(BoundMove {
            bound: NumberBound::Max,
        }));
    }
    if event.key == "PageUp" || event.key == "PageDown" {
        return Some(NumberMove::Directional(DirectionalMove {
            direction: if event.key == "PageUp" {
                StepDirection::Forward
            } else {
                StepDirection::Backward
            },
            size: StepSize::Large,
        }));
    }
    let flip = dir == WritingDirection::Rtl && orientation == Orientation::Horizontal;
    let vertical = if arrows == NumberArrows::Horizontal {
        None
    } else if event.key == "ArrowUp" {
        Some(StepDirection::Forward)
    } else if event.key == "ArrowDown" {
        Some(StepDirection::Backward)
    } else {
        None
    };
    let horizontal = if arrows == NumberArrows::Vertical {
        None
    } else if event.key == "ArrowRight" {
        Some(if flip {
            StepDirection::Backward
        } else {
            StepDirection::Forward
        })
    } else if event.key == "ArrowLeft" {
        Some(if flip {
            StepDirection::Forward
        } else {
            StepDirection::Backward
        })
    } else {
        None
    };
    let direction = vertical.or(horizontal)?;
    Some(NumberMove::Directional(DirectionalMove {
        direction,
        size: if event.shift_key.unwrap_or(false) {
            StepSize::Large
        } else if event.alt_key.unwrap_or(false) {
            StepSize::Small
        } else {
            StepSize::Step
        },
    }))
}
