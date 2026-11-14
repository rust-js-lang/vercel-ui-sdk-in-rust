//! Rust adaptation of UI SDK foundation/motion/spring.ts; see UPSTREAM.md.
use std::f64::consts::PI;

// An analytic damped spring, parameterized like SwiftUI: response (the period
// of the undamped oscillation, in seconds) and damping_ratio (1 is critical).
// Positions are in px, times in ms and velocities in px/ms, so one solver
// serves every driver.
pub struct Spring {
    pub position: Box<dyn Fn(f64) -> f64>,
    pub velocity: Box<dyn Fn(f64) -> f64>,
}

// Solves x'' = −ω²x − 2ζωx' for a start displacement (position − target) and
// velocity, and returns closures over the coefficients, so sampling it every
// frame allocates nothing.
/// A damped spring; position and velocity sample at a time in milliseconds.
pub fn solve_spring(response: f64, damping_ratio: f64, displacement: f64, velocity: f64) -> Spring {
    let omega = (2.0 * PI) / (response * 1000.0);
    let zeta = damping_ratio;
    if (zeta - 1.0).abs() < 1e-6 {
        return critically_damped(omega, displacement, velocity);
    }
    if zeta < 1.0 {
        return underdamped(omega, zeta, displacement, velocity);
    }
    overdamped(omega, zeta, displacement, velocity)
}

fn underdamped(omega: f64, zeta: f64, x0: f64, v0: f64) -> Spring {
    let decay = zeta * omega;
    let damped = omega * (1.0 - zeta * zeta).sqrt();
    let b = (v0 + decay * x0) / damped;
    Spring {
        position: Box::new(move |t| {
            (-decay * t).exp() * (x0 * (damped * t).cos() + b * (damped * t).sin())
        }),
        velocity: Box::new(move |t| {
            let cos = (damped * t).cos();
            let sin = (damped * t).sin();
            (-decay * t).exp() * ((b * damped - decay * x0) * cos - (x0 * damped + decay * b) * sin)
        }),
    }
}

fn critically_damped(omega: f64, x0: f64, v0: f64) -> Spring {
    let b = v0 + omega * x0;
    Spring {
        position: Box::new(move |t| (-omega * t).exp() * (x0 + b * t)),
        velocity: Box::new(move |t| (-omega * t).exp() * (b - omega * (x0 + b * t))),
    }
}

fn overdamped(omega: f64, zeta: f64, x0: f64, v0: f64) -> Spring {
    let root = (zeta * zeta - 1.0).sqrt();
    let fast = -omega * (zeta + root);
    let slow = -omega * (zeta - root);
    let slow_weight = (v0 - fast * x0) / (slow - fast);
    let fast_weight = x0 - slow_weight;
    Spring {
        position: Box::new(move |t| {
            slow_weight * (slow * t).exp() + fast_weight * (fast * t).exp()
        }),
        velocity: Box::new(move |t| {
            slow_weight * slow * (slow * t).exp() + fast_weight * fast * (fast * t).exp()
        }),
    }
}

#[derive(Default)]
pub struct SettleOptions {
    pub position_tolerance: Option<f64>,
    pub velocity_tolerance: Option<f64>,
    pub step: Option<f64>,
    pub limit: Option<f64>,
}

// The first time, in ms, when the spring is within position_tolerance px of
// rest and slower than velocity_tolerance px/ms. Checking both skips the zero
// crossings of an underdamped spring, where it passes the target at speed.
pub fn settle_time(solver: &Spring, options: Option<&SettleOptions>) -> f64 {
    let defaults = SettleOptions::default();
    let options = options.unwrap_or(&defaults);
    let position_tolerance = options.position_tolerance.unwrap_or(0.5);
    let velocity_tolerance = options.velocity_tolerance.unwrap_or(0.02);
    let step = options.step.unwrap_or(1.0);
    let limit = options.limit.unwrap_or(10_000.0);
    let mut t = 0.0;
    while t <= limit {
        if (solver.position)(t).abs() <= position_tolerance
            && (solver.velocity)(t).abs() <= velocity_tolerance
        {
            return t;
        }
        t += step;
    }
    limit
}

// A CSS linear() easing that replays the spring from from to to, sampled
// every step ms, for a WAAPI animation of duration ms on the compositor.
// Progress overshoots past 1 when the spring bounces, which linear() allows.
pub fn spring_linear_easing(
    solver: &Spring,
    from: f64,
    to: f64,
    duration: f64,
    step: Option<f64>,
) -> String {
    let step = step.unwrap_or(1000.0 / 120.0);
    let distance = to - from;
    // No distance, no progress to ease. Callers sample positions instead.
    if distance.abs() < 1e-6 {
        return "linear".to_owned();
    }
    let mut stops = Vec::new();
    let mut t = 0.0;
    while t < duration {
        stops.push(round(1.0 + (solver.position)(t) / distance));
        t += step;
    }
    stops.push("1".to_owned());
    format!("linear({})", stops.join(", "))
}

fn round(value: f64) -> String {
    format!(
        "{}",
        js::shown(js::math::round(value * 10_000.0) / 10_000.0)
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_damping_regimes_preserve_initial_conditions_and_approach_rest() {
        for damping in [0.3, 0.88, 1.0, 1.0000001, 1.5, 2.0] {
            let spring = solve_spring(0.34, damping, 100.0, 0.5);
            assert!(((spring.position)(0.0) - 100.0).abs() < 1e-10);
            assert!(((spring.velocity)(0.0) - 0.5).abs() < 1e-10);
            assert!((spring.position)(10_000.0).abs() < 1e-10);
            assert!((spring.velocity)(10_000.0).abs() < 1e-10);
        }
    }

    #[test]
    fn settling_requires_both_position_and_velocity() {
        let spring = Spring {
            position: Box::new(|_| 0.0),
            velocity: Box::new(|t| if t < 5.0 { 1.0 } else { 0.0 }),
        };
        assert_eq!(settle_time(&spring, None), 5.0);
    }
}
