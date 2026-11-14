//! Rust adaptation of UI SDK foundation/number/steps.ts; see UPSTREAM.md.

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

#[cfg(test)]
mod tests {
    use super::wrap;

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
