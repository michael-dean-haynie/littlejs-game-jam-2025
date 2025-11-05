import type { OrdinalDirection } from "../core/types/directions.types";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";

export const rampDirections = ["w", "e"] as const satisfies OrdinalDirection[];
export type RampDirection = (typeof rampDirections)[number];

export type Cell = {
  /** Position in world-space */
  pos: Vector2;
  /** Position relative to center of sector */
  sectorPos: Vector2;
  /** Position relative to origin of canvas (bottom left) */
  canvasPos: Vector2;
  /** Raw noise value for generating terrain */
  noise: number;
  /** Cliff height - result of quantized noise value */
  cliffHeight: number;
  /** If this cell is a ramp, the direction it faces (ascending) */
  rampDir?: RampDirection;
};
