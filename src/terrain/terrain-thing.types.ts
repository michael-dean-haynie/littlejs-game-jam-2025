import type { Vector2 } from "../littlejsengine/littlejsengine.types";

export const TERRAIN_THING_TOKEN = "TERRAIN_THING_TOKEN" as const;

export type ITerrainThing = {
  render(): void;
  getCliffIdx(pos: Vector2): number;
  getCliffHeight(pos: Vector2): number;
};

export type TerrainConfig = {
  paintTerrain: boolean;
  useTiles: boolean;
  cameraZoom: number;
  extent: number; // in sectors, to render
  seed: number;
  scale: number;
  octaves: number;
  persistance: number;
  lacunarity: number;
  offsetX: number; // in sectors
  offsetY: number; // in sectors
  // interval:  [0, 1] (expected to be in ascending order)
  cliffHeightBounds: number[];
  clamp: number;
};
