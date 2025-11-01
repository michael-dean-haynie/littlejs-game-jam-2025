import { tiles, type Tile, type TileId } from "./tile.types";

export const tileMap = Object.fromEntries(
  tiles.map((tile) => [tile.id, tile]),
) as { [K in TileId]: Tile };
