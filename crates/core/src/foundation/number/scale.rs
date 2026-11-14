//! Rust adaptation of UI SDK foundation/number/scale.ts; see UPSTREAM.md.
use super::steps::clamp;

pub struct NumberBounds {
    pub min: f64,
    pub max: f64,
}

#[derive(Clone, Copy)]
pub enum ScaleKind {
    #[cfg_attr(rust_js, rust_js::name = "linear")]
    Linear,
    #[cfg_attr(rust_js, rust_js::name = "log")]
    Log,
}

#[derive(Clone, Copy)]
pub struct CustomScale<'a> {
    pub to: &'a dyn Fn(f64) -> f64,
    pub from: &'a dyn Fn(f64) -> f64,
}

#[cfg_attr(rust_js, rust_js::untagged)]
pub enum NumberScale<'a> {
    Named(ScaleKind),
    Custom(CustomScale<'a>),
}

struct Scales {
    linear: CustomScale<'static>,
    log: CustomScale<'static>,
}

fn linear(value: f64) -> f64 {
    value
}

thread_local! {
    static SCALES: Scales = Scales {
        linear: CustomScale { to: &linear, from: &linear },
        log: CustomScale { to: &f64::ln, from: &f64::exp },
    };
}

pub fn fraction_of(value: f64, range: &NumberBounds, scale: Option<&NumberScale>) -> f64 {
    let to = match scale {
        Some(NumberScale::Custom(scale)) => scale.to,
        Some(NumberScale::Named(ScaleKind::Log)) => SCALES.with(|scales| scales.log.to),
        _ => SCALES.with(|scales| scales.linear.to),
    };
    let low = to(range.min);
    let span = to(range.max) - low;
    let fraction = (to(clamp(value, range.min, range.max)) - low) / span;
    if fraction.is_finite() {
        clamp(fraction, 0.0, 1.0)
    } else {
        0.0
    }
}

pub fn value_at(fraction: f64, range: &NumberBounds, scale: Option<&NumberScale>) -> f64 {
    let (to, from) = match scale {
        Some(NumberScale::Custom(scale)) => (scale.to, scale.from),
        Some(NumberScale::Named(ScaleKind::Log)) => {
            SCALES.with(|scales| (scales.log.to, scales.log.from))
        }
        _ => SCALES.with(|scales| (scales.linear.to, scales.linear.from)),
    };
    let low = to(range.min);
    let value = from(low + clamp(fraction, 0.0, 1.0) * (to(range.max) - low));
    clamp(value, range.min, range.max)
}
