//! Rust adaptation of UI SDK core. See UPSTREAM.md for provenance and current coverage.
pub mod foundation;
pub use foundation::kernel::events::{
    CompositionFields, CompositionInput, NativeCompositionEvent, WrappedCompositionEvent,
    is_composing, on, select_event,
};
pub use foundation::kernel::undo_stack::{
    UndoRecordOptions, UndoStack, UndoStackOptions, UndoStackSettings, create_undo_stack,
};
pub use foundation::motion::projection::{
    SnapTargetInput, choose_snap_target, nearest_index, project_distance,
};
pub use foundation::motion::rubber_band::{rubber_band, rubber_band_inverse, rubber_band_slope};
pub use foundation::motion::spring::{
    SettleOptions, Spring, settle_time, solve_spring, spring_linear_easing,
};
pub use foundation::number::scale::{
    CustomScale, NumberBounds, NumberScale, ScaleKind, fraction_of, value_at,
};
pub use foundation::number::steps::{clamp, wrap};
pub use foundation::platform::sides::{PhysicalSide, Side, physical_side};
