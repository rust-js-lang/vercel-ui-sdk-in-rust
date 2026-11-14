//! Rust adaptation of UI SDK foundation/motion/projection.ts; see UPSTREAM.md.
// Where a released sheet comes to rest. UIScrollView decelerates by a fixed
// rate per millisecond, so a release at v px/ms travels v·r/(1 − r) before it
// stops (WWDC18 803). 0.998 is normal, 0.99 is fast.
/// How far a released object travels before stopping, slowing at rate per millisecond.
pub fn project_distance(velocity: f64, rate: f64) -> f64 {
    (velocity * rate) / (1.0 - rate)
}

pub struct SnapTargetInput<'a> {
    /// The extent at release, in px.
    pub extent: f64,
    /// Px/ms, positive toward a larger extent.
    pub velocity: f64,
    /// Ascending resting extents, in px.
    pub candidates: &'a [f64],
    /// Per-millisecond deceleration used for the projection.
    pub rate: f64,
    /// Below this speed, the nearest candidate wins.
    pub min_fling_velocity: f64,
    /// Whether a fling can pass over a candidate.
    pub skip_snap_points: bool,
}

// Picks the index of the candidate extent a release settles on. Candidates
// are ascending extents, including 0 when the sheet can be dismissed.
// Velocity is the extent's velocity in px/ms, positive when growing.
pub fn choose_snap_target(input: &SnapTargetInput) -> usize {
    let extent = input.extent;
    let velocity = input.velocity;
    let candidates = input.candidates;
    if velocity.abs() < input.min_fling_velocity {
        return nearest_index(candidates, extent);
    }
    let projected = extent + project_distance(velocity, input.rate);
    let next_in_direction = first_beyond(candidates, extent, js::math::sign(velocity));
    let mut target = nearest_index(candidates, projected);
    let is_behind = if velocity > 0.0 {
        candidates
            .get(target)
            .is_some_and(|candidate| *candidate <= extent + 0.5)
    } else {
        candidates
            .get(target)
            .is_some_and(|candidate| *candidate >= extent - 0.5)
    };
    if is_behind && let Some(next) = next_in_direction {
        target = next;
    }
    if !input.skip_snap_points
        && let Some(next) = next_in_direction
    {
        target = if velocity > 0.0 {
            target.min(next)
        } else {
            target.max(next)
        };
    }
    target
}

pub fn nearest_index(candidates: &[f64], value: f64) -> usize {
    let mut best = 0;
    for (index, candidate) in candidates.iter().enumerate().skip(1) {
        if (*candidate - value).abs() < (candidates[best] - value).abs() {
            best = index;
        }
    }
    best
}

// The first candidate strictly past extent in direction.
fn first_beyond(candidates: &[f64], extent: f64, direction: f64) -> Option<usize> {
    if direction > 0.0 {
        candidates
            .iter()
            .position(|candidate| *candidate > extent + 0.5)
    } else {
        candidates
            .iter()
            .rposition(|candidate| *candidate < extent - 0.5)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn projection_matches_geometric_deceleration() {
        assert!((project_distance(2.0, 0.99) - 198.0).abs() < 1e-10);
        assert_eq!(project_distance(-2.0, 0.5), -2.0);
        assert_eq!(project_distance(1.0, 0.0), 0.0);
    }

    #[test]
    fn nearest_ties_favor_the_first_candidate() {
        assert_eq!(nearest_index(&[0.0, 100.0, 200.0], 50.0), 0);
        assert_eq!(nearest_index(&[0.0, 100.0, 200.0], 151.0), 2);
        assert_eq!(nearest_index(&[], 100.0), 0);
    }
}
