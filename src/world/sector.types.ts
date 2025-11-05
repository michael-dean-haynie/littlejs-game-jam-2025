import { noCap } from "../core/util/no-cap";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type {
  TileLayer,
  Vector2,
} from "../littlejsengine/littlejsengine.types";

/** The distance from the center of a sector to the edge (flat side) in world units */
export const sectorExtent = 5;

export const sectorSize = extToGridSize(sectorExtent);

/** Converts a sector coordinate to a world coordinate. */
export function sctr2Wrld(sector: Vector2): Vector2 {
  return sector.scale(sectorSize);
}

/** Converts a world coordinate to a sector coordinate. */
export function wrld2Sctr(world: Vector2): Vector2 {
  return world
    .add(vec2(sectorSize / 2))
    .scale(1 / sectorSize)
    .floor();
}

/**
 * Centers a grid (with discrete center, odd side length) on zero and returns the bounds (so 11 would be from -5 to 5).
 * This is inclusive.
 */
export function gridSizeToExtent(size: number): number {
  return (size - 1) / 2;
}

/** Get's the key for a coordinate for use in a map. X and Y are expected to be whole numbers. */
export function coordToKey({ x, y }: Vector2): string {
  // noCap(x % 1 === 0, "Expected x to be a whole number.");
  // noCap(y % 1 === 0, "Expected y to be a whole number.");
  x = Math.round(x);
  y = Math.round(y);
  // add zero to avoie -0 situations
  return `${x + 0},${y + 0}`;
}

export function keyToCoord(key: string): Vector2 {
  const [x, y] = key.split(",").map(Number);
  noCap(!isNaN(x), "Expected x to be a number.");
  noCap(!isNaN(y), "Expected y to be a number.");
  noCap(x % 1 === 0, "Expected x to be a whole number.");
  noCap(y % 1 === 0, "Expected y to be a whole number.");
  return vec2(x, y);
}

/**
 * ===========================================================
 * NEW STUFF WITH REWORK
 * ===========================================================
 */

export const phases = ["none", "noise", "layers"] as const;
export type Phase = (typeof phases)[number];
export const phaseIdxMap = Object.fromEntries(
  phases.map((phase, index) => [phase, index]),
) as { [K in Phase]: number };

export function advancePhase(sector: Sector, newPhase: Phase): void {
  const { neededFor } = sector;
  if (phaseIdxMap[neededFor] > phaseIdxMap[newPhase]) return;
  sector.neededFor = newPhase;
}

export type Sector = {
  // Position in sector-space
  pos: Vector2;
  // Position in world-space
  worldPos: Vector2;
  // Phase of rendering that this sector is needed for
  neededFor: Phase;
  // Layer caches for fast rendering
  layers?: TileLayer[];
};

/**
 * Converts a scalar "extent" into a scalar "size".
 * The "extent" is a whole number which works kind of like a radius.
 * A "size" is the length/width of a square grid.
 * This is mainly for creating a grid with a discrete center (e.g. 1x1, 3x3, 5x5, ...etc).
 */
export function extToGridSize(extent: number) {
  noCap(extent > 0, "Extent should be greater than 0");
  return Math.floor(Math.abs(extent)) * 2 + 1;
}

/** Converts a sector coordinate to a world coordinate. */
export function sectorToWorld(sector: Vector2, sectorExtent: number): Vector2 {
  const sectorSize = extToGridSize(sectorExtent);
  return sector.scale(sectorSize);
}

/** Converts a world coordinate to a sector coordinate. */
export function worldToSector(world: Vector2, sectorExtent: number): Vector2 {
  const sectorSize = extToGridSize(sectorExtent);
  return world
    .add(vec2(sectorSize / 2))
    .scale(1 / sectorSize)
    .floor();
}
