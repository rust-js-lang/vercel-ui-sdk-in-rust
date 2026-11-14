//! Rust adaptation of UI SDK foundation/motion/physics.ts; see UPSTREAM.md.
use std::cell::Cell;

/// The numbers behind a sheet's motion. Every driver reads the same preset.
#[derive(Clone)]
pub struct SheetPhysics {
    /// Spring period in seconds, for releases without momentum and programmatic moves.
    pub response: Cell<f64>,
    /// Damping ratio for those moves. One never overshoots.
    pub damping_ratio: Cell<f64>,
    /// Damping ratio when a release carries momentum and can overshoot.
    pub momentum_damping_ratio: Cell<f64>,
    /// Per-millisecond deceleration used to project a fling.
    pub projection_rate: Cell<f64>,
    /// Below this speed in px/ms a release settles on the nearest snap point.
    pub min_fling_velocity: Cell<f64>,
    /// Whether a fast fling can pass over snap points.
    pub skip_snap_points: Cell<bool>,
    /// The rubber band's coefficient past an edge or a refused dismissal.
    pub rubber_band: Cell<f64>,
    /// Maximum stretch in px, or null for the container's size.
    #[cfg_attr(rust_js, rust_js::nullable)]
    pub rubber_band_dimension: Cell<Option<f64>>,
    /// Travel in px before touch or pen moves the sheet.
    pub touch_slop: Cell<f64>,
    /// Travel in px before a mouse drag moves the sheet.
    pub mouse_slop: Cell<f64>,
    /// Browser theme-color dimming, as the opacity of black.
    pub dim: Cell<f64>,
    /// How far back in ms a release velocity looks at samples.
    pub velocity_horizon: Cell<f64>,
}

pub struct SheetPhysicsPresets {
    pub ios: SheetPhysics,
}

// ios is fitted to iOS 26.5 system sheets recorded frame by frame.
thread_local! {
    pub static SHEET_PHYSICS: SheetPhysicsPresets = const { SheetPhysicsPresets {
        ios: SheetPhysics {
            response: Cell::new(0.34),
            damping_ratio: Cell::new(1.0),
            momentum_damping_ratio: Cell::new(0.88),
            projection_rate: Cell::new(0.99),
            min_fling_velocity: Cell::new(0.5),
            skip_snap_points: Cell::new(true),
            // UIKit's sheet band stops near 23pt: d 24, c 1.9 fit the recording.
            rubber_band: Cell::new(1.9),
            rubber_band_dimension: Cell::new(Some(24.0)),
            touch_slop: Cell::new(8.0),
            mouse_slop: Cell::new(4.0),
            dim: Cell::new(0.2),
            velocity_horizon: Cell::new(70.0),
        },
    } };
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::foundation::motion::spring::solve_spring;

    #[test]
    fn default_sheet_spring_settles_without_overshoot() {
        SHEET_PHYSICS.with(|presets| {
            let physics = &presets.ios;
            let spring = solve_spring(
                physics.response.get(),
                physics.damping_ratio.get(),
                100.0,
                0.0,
            );
            let mut previous = 100.0;
            for time in (0..=1000).step_by(10) {
                let position = (spring.position)(f64::from(time));
                assert!(position >= 0.0 && position <= previous);
                previous = position;
            }
            assert!(previous < 0.01);
        });
    }
}
