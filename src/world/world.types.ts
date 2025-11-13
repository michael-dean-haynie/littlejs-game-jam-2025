import type { Vector2 } from "littlejsengine";

/** Either true 2d, or 2.5d */
export type Perspective = "topdown" | "topdown-oblique";

export type WorldConfig = {
  cameraZoom: number;
  renderTerrain: boolean;
  useTiles: boolean;
  topDownPerspective: boolean;
  /** How big individual sectors are */
  sectorExtent: number;
  /** How far out to render sectors */
  sectorRenderExtent: number;
  /** How far out to load pathing for sectors */
  sectorPathingExtent: number;
  /** For deterministic randomness */
  seed: number;
  /** Terrain noise Scale */
  tnScale: number;
  tnOctaves: number;
  tnPersistance: number;
  tnLacunarity: number;
  /** Terrain noise x offset (in world units) */
  tnOffsetX: number;
  /** Terrain noise y offset (in world units) */
  tnOffsetY: number;
  tnClamp: number;
  /** The boundaries that define different cliff levels (should be asc) */
  cliffHeightBounds: number[];
  /** The terrain slope between cells must be below this for a ramp to be placed */
  rampSlopeThreshold: number;
  /** Draw debug rectangles around sectors with phase info */
  debugSectors: boolean;
  /** Draw debug rectangles astar pathing obstacles */
  debugPathing: boolean;
};

export const defaultWorldConfig: WorldConfig = {
  cameraZoom: 101,
  renderTerrain: true,
  useTiles: true,
  topDownPerspective: false,
  sectorExtent: 2,
  sectorPathingExtent: 3,
  sectorRenderExtent: 3,
  seed: 5486,
  tnScale: 184,
  tnOctaves: 4,
  tnPersistance: 0.56,
  tnLacunarity: 3.2,
  tnOffsetX: 0,
  tnOffsetY: 0,
  tnClamp: 0.37,
  cliffHeightBounds: [0.17, 0.33, 0.5, 0.67, 0.83],
  rampSlopeThreshold: 0.11,
  debugSectors: false,
  debugPathing: false,
};

/** Fast 2d map key */
export function f2dmk(vector: Vector2): number;
export function f2dmk(x: number, y: number): number;
export function f2dmk(a: Vector2 | number, b?: number): number {
  const x = b === undefined ? (a as Vector2).x : (a as number);
  const y = b === undefined ? (a as Vector2).y : (b as number);

  return ((Math.round(x) + 32767) << 16) | (Math.round(y) + 32767);
}
