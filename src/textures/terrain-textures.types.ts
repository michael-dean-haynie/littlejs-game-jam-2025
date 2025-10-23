import type { TileTexture } from "./textures.types";

export type TerrainTileTextureId = (typeof terrainTileTextures)[number]["id"];

export const terrainTileTextures = [
  /////////////////////////////////////////////////////////////////////////////////////////////
  // tilemaps
  /////////////////////////////////////////////////////////////////////////////////////////////
  {
    id: "terrain.tilemap1",
    src: "terrain/Tilemap_color1.png",
  },
  {
    id: "terrain.tilemap2",
    src: "terrain/Tilemap_color2.png",
  },
  {
    id: "terrain.tilemap3",
    src: "terrain/Tilemap_color3.png",
  },
  {
    id: "terrain.tilemap4",
    src: "terrain/Tilemap_color4.png",
  },
  {
    id: "terrain.tilemap5",
    src: "terrain/Tilemap_color5.png",
  },
] as const satisfies TileTexture[];
