import { tile, TileInfo, vec2 } from "littlejsengine";
import { textureIndexMap } from "../texture-index-map";
import { tileMap } from "./tile-map";
import type { TileId } from "./tile.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";

/** Makes a tile by using game-specific ids/constants */
export function mkTile_deprecated(id: TileId, ljs: ILJS): TileInfo {
  const tile = tileMap[id];
  const pos = vec2(...tile.pos);
  const size = vec2(...tile.size);
  return ljs.tile(pos, size, textureIndexMap[tile.texture]);
}

/** Makes a tile by using game-specific ids/constants */
export function mkTile(id: TileId): TileInfo {
  const tileObj = tileMap[id];
  const pos = vec2(...tileObj.pos);
  const size = vec2(...tileObj.size);
  return tile(pos, size, textureIndexMap[tileObj.texture]);
}
