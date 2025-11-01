import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { TileInfo } from "../../littlejsengine/littlejsengine.types";
import { textureIndexMap } from "../texture-index-map";
import { tileMap } from "./tile-map";
import type { TileId } from "./tile.types";

/** Makes a tile by using game-specific ids/constants */
export function mkTile(id: TileId, ljs: ILJS): TileInfo {
  const tile = tileMap[id];
  const pos = vec2(...tile.pos);
  const size = vec2(...tile.size);
  return ljs.tile(pos, size, textureIndexMap[tile.texture]);
}
