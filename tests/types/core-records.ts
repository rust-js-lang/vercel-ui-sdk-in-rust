import { sheetPhysics } from "../../crates/core/src/lib.js";
import type { NumberMove, SheetPhysics } from "../../crates/core/src/lib.js";

const bound: NumberMove = { bound: "min" };
const move: NumberMove = { direction: -1, size: "large" };
void bound;
void move;

// @ts-expect-error A move direction is exactly -1 or 1.
const badDirection: NumberMove = { direction: 2, size: "step" };
// @ts-expect-error Directional moves require a step size.
const missingSize: NumberMove = { direction: 1 };
// @ts-expect-error Bounds use the declared names.
const badBound: NumberMove = { bound: "middle" };
void badDirection;
void missingSize;
void badBound;

const physics: SheetPhysics = sheetPhysics.ios;
const period: number = physics.response;
const dimension: number | null = physics.rubberBandDimension;
physics.rubberBandDimension = null;
void period;
void dimension;
// @ts-expect-error Dimension is required and explicitly nullable.
physics.rubberBandDimension = undefined;
// @ts-expect-error Spring response must be numeric.
physics.response = "fast";
// @ts-expect-error The skipping policy is a boolean.
physics.skipSnapPoints = 1;
