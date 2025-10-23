import type { Vector2 } from "../littlejsengine/littlejsengine.types";

export const TERRAIN_THING_TOKEN = "TERRAIN_THING_TOKEN" as const;

export type ITerrainThing = {
  seed: unknown;
  render(): void;
  /** Sample the noise function for a particular point in the world space. Returns value where -1 < v < 1. */
  sample(point: Vector2): number;
};
