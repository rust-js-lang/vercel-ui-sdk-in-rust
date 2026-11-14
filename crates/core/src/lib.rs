//! Rust adaptation of UI SDK core. See UPSTREAM.md for provenance and current coverage.
pub mod foundation;
pub use foundation::date::plain_date::{
    DateInput, DateParts, IsoDate, MonthGridOptions, add_days, add_months, add_years, clamp_date,
    date_parts, days_between, days_in_month, end_of_month, end_of_week, is_iso_date, is_same_month,
    iso_date, month_grid, start_of_month, start_of_week, to_iso_date, weekday,
};
pub use foundation::kernel::details::{ChangeSource, is_dismissal, resolve_source, with_source};
pub use foundation::kernel::events::{
    CompositionFields, CompositionInput, NativeCompositionEvent, WrappedCompositionEvent,
    is_composing, on, select_event,
};
pub use foundation::kernel::undo_stack::{
    UndoRecordOptions, UndoStack, UndoStackOptions, UndoStackSettings, create_undo_stack,
};
pub use foundation::motion::physics::{SHEET_PHYSICS, SheetPhysics, SheetPhysicsPresets};
pub use foundation::motion::projection::{
    SnapTargetInput, choose_snap_target, nearest_index, project_distance,
};
pub use foundation::motion::rubber_band::{rubber_band, rubber_band_inverse, rubber_band_slope};
pub use foundation::motion::spring::{
    SettleOptions, Spring, settle_time, solve_spring, spring_linear_easing,
};
pub use foundation::number::keys::{
    NumberArrows, NumberKeyEvent, NumberKeyOptions, Orientation, WritingDirection, step_from_key,
};
pub use foundation::number::scale::{
    CustomScale, NumberBounds, NumberScale, ScaleKind, fraction_of, value_at,
};
pub use foundation::number::steps::{
    BoundMove, DirectionalMove, NumberBound, NumberMove, NumberRange, NumberScrub, NumberSnap,
    ScrubOptions, SnapEase, StepByOptions, StepDirection, StepRange, StepSize, clamp, decimals_of,
    max_on_grid, on_grid, round_to, scrub_to, snap_to_step, step_by, step_on_grid, step_value,
    wrap,
};
pub use foundation::platform::sides::{PhysicalSide, Side, physical_side};

pub use foundation::platform::layout::{
    LayoutBox, LayoutPoint, LayoutSize, layout_box, layout_origin, layout_size,
};

pub use foundation::platform::env::{IS_BROWSER, is_ios, is_rtl};

pub use foundation::platform::support::{
    Platform, PortalTarget, active_element, aria_keyshortcuts, composed_contains, composed_hops,
    format_shortcut, has_command_modifier, initial_apple, is_apple, matches_shortcut,
    portal_target, prefers_reduced_motion, set_platform, supports_top_layer,
};
