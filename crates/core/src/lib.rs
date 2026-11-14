//! Rust adaptation of UI SDK core. See UPSTREAM.md for provenance and current coverage.
pub mod foundation;
pub use foundation::motion::rubber_band::{rubber_band, rubber_band_inverse, rubber_band_slope};
pub use foundation::motion::spring::{
    SettleOptions, Spring, settle_time, solve_spring, spring_linear_easing,
};
pub use foundation::number::steps::{clamp, wrap};
pub use foundation::platform::sides::{PhysicalSide, Side, physical_side};
