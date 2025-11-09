import { tile, TileInfo, vec2 } from "littlejsengine";
import { textureIndexMap } from "../texture-index-map";
import { tileMap } from "./tile-map";
import type { TileId } from "./tile.types";

/** Makes a tile by using game-specific ids/constants */
export function mkTile(id: TileId): TileInfo {
  const tileObj = tileMap[id];
  const pos = vec2(...tileObj.pos);
  const size = vec2(...tileObj.size);
  return tile(pos, size, textureIndexMap[tileObj.texture]);
}
