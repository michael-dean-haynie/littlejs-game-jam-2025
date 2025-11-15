import type { V2 } from "../../core/types/simple-vector-2.types";
import type { Texture } from "../textures.types";
import { terrainTiles } from "./terrain/terrain-tile.types";

/** Data for static art from a texture */
export type Tile = {
  /** A unique id for a particular tile */
  id: string;
  /** The texture (image) with the raw raster data */
  texture: Texture;
  /** The pos for the TileInfo */
  pos: V2;
  /** The pos for the TileInfo */
  size: V2;
};

/** A tile which is used between multiple textures */
export type MultiTextureTile = Omit<Tile, "texture">;

export const tiles = [
  ...terrainTiles,
  {
    id: "empty",
    pos: [0, 0],
    size: [32, 32],
    texture: "empty.png",
  },
] as const satisfies Tile[];
export type TileId = (typeof tiles)[number]["id"];
