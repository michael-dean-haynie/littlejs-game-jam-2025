import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { IUnit } from "../units/unit.types";

export const WORLD_TOKEN = "WORLD_TOKEN" as const;

export interface IWorld {
  init(): void;
  update(): void;
  get perspective(): Perspective;

  unit?: IUnit;
  getTerrainHeight(pos: Vector2): number;
}

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
  /** For deterministic randomness */
  seed: number;
  /** Terrain noise Scale */
  tnScale: number;
  tnOctaves: number;
  tnPersistance: number;
  tnLacunarity: number;
  /** Terrain noise x offset (in sectors) */
  tnOffsetX: number;
  /** Terrain noise y offset (in sectors) */
  tnOffsetY: number;
  tnClamp: number;
  /** The boundaries that define different cliff levels (should be asc) */
  cliffHeightBounds: number[];
  /** The terrain slope between cells must be below this for a ramp to be placed */
  rampSlopeThreshold: number;
};

export const defaultWorldConfig: WorldConfig = {
  cameraZoom: 56,
  renderTerrain: true,
  useTiles: false,
  topDownPerspective: true,
  sectorExtent: 5,
  sectorRenderExtent: 2,
  seed: 3851,
  tnScale: 184,
  tnOctaves: 4,
  tnPersistance: 0.56,
  tnLacunarity: 3.2,
  tnOffsetX: -2,
  tnOffsetY: 1,
  tnClamp: 0.37,
  cliffHeightBounds: [0.2, 0.4, 0.6, 0.8],
  rampSlopeThreshold: 0.11,
};

/** Fast 2d map key */
export function f2dmk(vector: Vector2): number;
export function f2dmk(x: number, y: number): number;
export function f2dmk(a: Vector2 | number, b?: number): number {
  const x = b === undefined ? (a as Vector2).x : (a as number);
  const y = b === undefined ? (a as Vector2).y : (b as number);

  return ((Math.round(x) + 32767) << 16) | (Math.round(y) + 32767);
}
