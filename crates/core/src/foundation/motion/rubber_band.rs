//! Rust adaptation of UI SDK foundation/motion/rubber-band.ts; see UPSTREAM.md.
// UIScrollView's rubber band: x px of travel past an edge shows as
// (1 − 1 / (x·c / d + 1))·d, which approaches but never reaches d.
// https://oleb.net/blog/2014/05/scrollview-inertia-bouncing-rubberbanding/
const IOS_RUBBER_BAND_COEFFICIENT: f64 = 0.55;

/// How far something dragged past an edge shows, resisting more the further it goes, like iOS.
pub fn rubber_band(overshoot: f64, dimension: f64, coefficient: Option<f64>) -> f64 {
    let coefficient = coefficient.unwrap_or(IOS_RUBBER_BAND_COEFFICIENT);
    if overshoot <= 0.0 {
        return 0.0;
    }
    (1.0 - 1.0 / ((overshoot * coefficient) / dimension + 1.0)) * dimension
}

// The travel that shows as shown. Used when a drag starts inside the band, so
// the finger picks up the sheet where it is instead of jumping.
pub fn rubber_band_inverse(shown: f64, dimension: f64, coefficient: Option<f64>) -> f64 {
    let coefficient = coefficient.unwrap_or(IOS_RUBBER_BAND_COEFFICIENT);
    if shown <= 0.0 {
        return 0.0;
    }
    let ratio = js::math::min((shown / dimension, 0.999999));
    ((1.0 / (1.0 - ratio) - 1.0) * dimension) / coefficient
}

// d(shown)/d(travel). A release inside the band hands the spring the finger's
// velocity times this slope, so the sheet doesn't jump in speed.
pub fn rubber_band_slope(overshoot: f64, dimension: f64, coefficient: Option<f64>) -> f64 {
    let coefficient = coefficient.unwrap_or(IOS_RUBBER_BAND_COEFFICIENT);
    if overshoot <= 0.0 {
        return 1.0;
    }
    let base = (overshoot * coefficient) / dimension + 1.0;
    coefficient / (base * base)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn travel_resists_and_approaches_the_dimension() {
        let small = rubber_band(10.0, 100.0, None);
        let large = rubber_band(1000.0, 100.0, None);
        assert!(0.0 < small && small < 10.0);
        assert!(small < large && large < 100.0);
        assert_eq!(rubber_band(-1.0, 100.0, None), 0.0);
        assert_eq!(rubber_band_slope(0.0, 100.0, None), 1.0);
    }

    #[test]
    fn release_slope_matches_the_derivative() {
        for travel in [1.0, 10.0, 100.0, 1000.0] {
            let h = 0.001;
            let derivative = (rubber_band(travel + h, 100.0, None)
                - rubber_band(travel - h, 100.0, None))
                / (2.0 * h);
            assert!((rubber_band_slope(travel, 100.0, None) - derivative).abs() < 1e-9);
        }
    }
}
