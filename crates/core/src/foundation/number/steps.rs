//! Rust adaptation of UI SDK foundation/number/steps.ts; see UPSTREAM.md.
use std::cmp::Ordering;

pub fn clamp(value: f64, min: f64, max: f64) -> f64 {
    js::math::min((js::math::max((value, min)), max))
}

pub fn wrap(value: f64, min: f64, max: f64) -> f64 {
    let span = max - min;
    if span > 0.0 {
        ((((value - min) % span) + span) % span) + min
    } else {
        min
    }
}

#[derive(Clone, Copy)]
#[repr(i8)]
pub enum StepDirection {
    Backward = -1,
    Forward = 1,
}

#[derive(Clone, Copy)]
pub enum StepSize {
    #[cfg_attr(rust_js, rust_js::name = "step")]
    Step,
    #[cfg_attr(rust_js, rust_js::name = "large")]
    Large,
    #[cfg_attr(rust_js, rust_js::name = "small")]
    Small,
}

#[derive(Clone, Copy)]
pub enum NumberBound {
    #[cfg_attr(rust_js, rust_js::name = "min")]
    Min,
    #[cfg_attr(rust_js, rust_js::name = "max")]
    Max,
}

pub struct DirectionalMove {
    pub direction: StepDirection,
    pub size: StepSize,
}

pub struct BoundMove {
    #[cfg_attr(rust_js, rust_js::test(key))]
    pub bound: NumberBound,
}

/// A keyboard or gesture move: steps in a direction, or a bound.
#[cfg_attr(rust_js, rust_js::untagged)]
pub enum NumberMove {
    Bound(BoundMove),
    #[cfg_attr(rust_js, rust_js::otherwise)]
    Directional(DirectionalMove),
}

/// Decimals in a finite number, counting exponent notation.
pub fn decimals_of(value: f64) -> f64 {
    if !value.is_finite() || value.fract() == 0.0 {
        return 0.0;
    }
    let text = js::string(Some(js::unknown(&value))).to_lowercase();
    let mut parts = text.split('e');
    let mantissa = parts.next().unwrap_or_default();
    let exponent = parts.next().map(js::to_number).unwrap_or(0.0);
    let decimals = mantissa.split('.').nth(1).unwrap_or_default().len() as f64;
    js::math::max((0.0, decimals - exponent))
}

/// Rounds decimal noise with JavaScript's toFixed conversion and errors.
pub fn round_to(value: f64, decimals: f64) -> f64 {
    js::to_number(js::number::to_fixed(
        value,
        Some(js::math::min((decimals, 100.0))),
    ))
}

// Noise grows with magnitude, so counts are cut to 15 significant digits.
fn step_count(distance: f64, step: f64) -> f64 {
    js::to_number(js::number::to_precision(distance / step, Some(15.0)))
}

#[derive(Clone, Copy)]
pub struct StepRange {
    pub min: f64,
    pub max: f64,
    pub step: f64,
}

fn step_base(range: &StepRange) -> f64 {
    if range.min.is_finite() {
        range.min
    } else {
        0.0
    }
}

fn precision_of(range: &StepRange) -> f64 {
    js::math::max((decimals_of(range.step), decimals_of(step_base(range))))
}

/// The highest value on the grid, which may be below max.
pub fn max_on_grid(range: &StepRange) -> f64 {
    if !range.max.is_finite() || range.step.partial_cmp(&0.0) != Some(Ordering::Greater) {
        return range.max;
    }
    let base = step_base(range);
    let steps = step_count(range.max - base, range.step).floor();
    round_to(base + steps * range.step, precision_of(range))
}

/// An unbounded grid value, using the supplied rounding function.
pub fn on_grid(value: f64, range: &StepRange, round: Option<&dyn Fn(f64) -> f64>) -> f64 {
    let round = round.unwrap_or(&js::math::round);
    if range.step.partial_cmp(&0.0) != Some(Ordering::Greater) {
        return value;
    }
    let base = step_base(range);
    round_to(
        base + round(step_count(value - base, range.step)) * range.step,
        precision_of(range),
    )
}

pub fn snap_to_step(value: f64, range: &StepRange) -> f64 {
    if range.step.partial_cmp(&0.0) != Some(Ordering::Greater) {
        return clamp(value, range.min, range.max);
    }
    round_to(
        clamp(on_grid(value, range, None), range.min, max_on_grid(range)),
        precision_of(range),
    )
}

/// Moves by a count of grid steps. An off-grid value reaches the grid first.
pub fn step_value(value: f64, steps: f64, range: &StepRange) -> f64 {
    if range.step.partial_cmp(&0.0) != Some(Ordering::Greater) {
        return clamp(value + steps, range.min, range.max);
    }
    let base = step_base(range);
    let position = step_count(value - base, range.step);
    let on_grid = position.fract() == 0.0;
    let from = if on_grid {
        position
    } else if steps > 0.0 {
        position.floor()
    } else {
        position.ceil()
    };
    let next = base + (from + steps) * range.step;
    round_to(
        clamp(next, range.min, max_on_grid(range)),
        precision_of(range),
    )
}

pub struct NumberSnap<'a> {
    pub points: &'a [f64],
    pub threshold: f64,
}

#[derive(Clone, Copy)]
pub struct NumberRange<'a> {
    #[cfg_attr(rust_js, rust_js::flatten)]
    pub range: StepRange,
    pub large_step: Option<f64>,
    pub small_step: Option<f64>,
    pub snap: Option<&'a NumberSnap<'a>>,
}

/// A move on the grid without snap-point handling.
pub fn step_on_grid(value: f64, movement: &DirectionalMove, range: &NumberRange) -> f64 {
    if matches!(movement.size, StepSize::Large) {
        return snap_to_step(
            clamp(
                value
                    + f64::from(movement.direction as i8)
                        * range.large_step.unwrap_or(range.range.step * 10.0),
                range.range.min,
                range.range.max,
            ),
            &range.range,
        );
    }
    if matches!(movement.size, StepSize::Small) && js::truthy(range.small_step.as_ref()) {
        let direction = f64::from(movement.direction as i8);
        let mut next = *range;
        next.range.step = range.small_step.unwrap_or(f64::NAN);
        return step_value(value, direction, &next.range);
    }
    step_value(value, f64::from(movement.direction as i8), &range.range)
}

#[derive(Default)]
pub struct StepByOptions {
    pub snap: Option<bool>,
}

/// A grid move that stops at the first snap point reached ahead.
pub fn step_by(
    value: f64,
    movement: &NumberMove,
    range: &NumberRange,
    options: Option<&StepByOptions>,
) -> f64 {
    let defaults = StepByOptions::default();
    let snap = options.unwrap_or(&defaults).snap.unwrap_or(true);
    let movement = match movement {
        NumberMove::Bound(bound) => {
            return match bound.bound {
                NumberBound::Min => range.range.min,
                NumberBound::Max => max_on_grid(&range.range),
            };
        }
        NumberMove::Directional(movement) => movement,
    };
    let next = step_on_grid(value, movement, range);
    if !snap || range.snap.is_none() {
        return next;
    }
    let snapping = range.snap.unwrap();
    let points = snapping.points;
    let threshold = snapping.threshold;
    let direction = f64::from(movement.direction as i8);
    let mut stop: Option<f64> = None;
    for point in points {
        let ahead = (*point - value) * direction > 0.0;
        let reached = (next + direction * threshold - *point) * direction >= 0.0;
        if ahead && reached && stop.is_none_or(|stop| (*point - stop) * direction < 0.0) {
            stop = Some(*point);
        }
    }
    stop.map_or(next, |stop| clamp(stop, range.range.min, range.range.max))
}

#[derive(Clone, Copy)]
#[cfg_attr(rust_js, rust_js::untagged)]
pub enum SnapEase<'a> {
    Flag(bool),
    Curve(&'a dyn Fn(f64) -> f64),
}

#[derive(Default)]
pub struct ScrubOptions<'a> {
    pub snap: Option<bool>,
    pub ease: Option<SnapEase<'a>>,
}

/// A scrubbed value and the snap point it is pulled toward.
pub struct NumberScrub {
    pub value: f64,
    #[cfg_attr(rust_js, rust_js::present)]
    pub point: Option<f64>,
}

/// Finds the nearest snap point, or the grid, with an optional easing curve.
pub fn scrub_to(value: f64, range: &NumberRange, options: Option<&ScrubOptions>) -> NumberScrub {
    let defaults = ScrubOptions::default();
    let options = options.unwrap_or(&defaults);
    let snap = options.snap.unwrap_or(true);
    let ease = options.ease;
    let mut nearest: Option<f64> = None;
    let threshold = range.snap.map_or(0.0, |snap| snap.threshold);
    if snap && let Some(snapping) = range.snap {
        for point in snapping.points {
            if (*point - value).abs() <= threshold
                && nearest.is_none_or(|nearest| (*point - value).abs() < (nearest - value).abs())
            {
                nearest = Some(*point);
            }
        }
    }
    let Some(nearest) = nearest else {
        return NumberScrub {
            value: snap_to_step(value, &range.range),
            point: None,
        };
    };
    let point = clamp(nearest, range.range.min, range.range.max);
    if ease.is_none()
        || matches!(ease, Some(SnapEase::Flag(false)))
        || threshold.partial_cmp(&0.0) != Some(Ordering::Greater)
    {
        return NumberScrub {
            value: point,
            point: Some(point),
        };
    }
    let closeness = 1.0 - (point - value).abs() / threshold;
    let pull = match ease.unwrap() {
        SnapEase::Flag(_) => closeness,
        SnapEase::Curve(curve) => curve(closeness),
    };
    NumberScrub {
        value: clamp(
            value + (point - value) * pull,
            range.range.min,
            range.range.max,
        ),
        point: Some(point),
    }
}

#[cfg(test)]
mod tests {
    use super::{StepRange, max_on_grid, wrap};

    #[test]
    fn nonpositive_or_nan_steps_leave_the_grid_maximum_unchanged() {
        for step in [f64::NEG_INFINITY, -1.0, 0.0, f64::NAN] {
            assert_eq!(
                max_on_grid(&StepRange {
                    min: 1.0,
                    max: 10.0,
                    step
                }),
                10.0
            );
        }
        let negative_zero = max_on_grid(&StepRange {
            min: 0.0,
            max: -0.0,
            step: 0.0,
        });
        assert_eq!(negative_zero.to_bits(), (-0.0_f64).to_bits());
        assert!(
            max_on_grid(&StepRange {
                min: 0.0,
                max: f64::NAN,
                step: 1.0
            })
            .is_nan()
        );
    }

    #[test]
    fn wraps_in_both_directions_and_excludes_the_upper_bound() {
        assert_eq!(wrap(370.0, 0.0, 360.0), 10.0);
        assert_eq!(wrap(-10.0, 0.0, 360.0), 350.0);
        assert_eq!(wrap(360.0, 0.0, 360.0), 0.0);
        assert_eq!(wrap(21.0, 10.0, 20.0), 11.0);
    }

    #[test]
    fn invalid_spans_return_the_lower_bound_including_its_zero_sign() {
        assert_eq!(wrap(12.0, 5.0, 5.0), 5.0);
        assert_eq!(wrap(12.0, 5.0, 1.0), 5.0);
        assert_eq!(wrap(12.0, -0.0, f64::NAN).to_bits(), (-0.0_f64).to_bits());
        assert!(wrap(12.0, f64::NAN, 5.0).is_nan());
    }

    #[test]
    fn non_finite_values_follow_remainder_semantics() {
        assert!(wrap(f64::INFINITY, 0.0, 360.0).is_nan());
        assert!(wrap(1.0, f64::NEG_INFINITY, f64::INFINITY).is_nan());
        assert!(wrap(f64::NAN, 0.0, 360.0).is_nan());
    }
}
