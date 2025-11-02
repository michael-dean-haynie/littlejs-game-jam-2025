import type { Tile } from "../tile.types";

export const terrainTiles = [
  {
    id: "terrain.water",
    pos: [0, 0],
    size: [64, 64],
    texture: "terrain/Water_Background_color.png",
  },
  {
    id: "terrain.shadow",
    pos: [56, 56],
    size: [80, 80],
    texture: "terrain/Shadow.png",
  },
] as const satisfies Tile[];

export type TerrainTileId = (typeof terrainTiles)[number]["id"];
