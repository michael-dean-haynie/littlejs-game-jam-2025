import type { OrdinalDirection } from "../../../core/types/directions.types";
import type { ILJS } from "../../../littlejsengine/littlejsengine.impure";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";
import type {
  TileInfo,
  Vector2,
} from "../../../littlejsengine/littlejsengine.types";
import { textureIndexMap } from "../../texture-index-map";
import type { TerrainTexture } from "../../textures.types";
import { mkTile } from "../mk-tile";

const tileScale = 64; // from pixels to 1 tile
const cliffTypeOriginMap: { [key in CliffType]: Vector2 } = {
  water: vec2(1),
  grass: vec2(6, 1),
};
const cliffIdxTextureMap: { [index: number]: TerrainTexture } = {
  1: "terrain/Tilemap_color1.png",
  2: "terrain/Tilemap_color2.png",
  3: "terrain/Tilemap_color3.png",
  4: "terrain/Tilemap_color4.png",
  5: "terrain/Tilemap_color5.png",
} as const;

// offset for situations like when it is a north AND south cliff (in pixels)
function bothOffset(type: CliffType, axis: Axis): Vector2 {
  const tileScalar = type === "grass" && axis === "y" ? 3 : 2;
  const tileVector = axis === "x" ? vec2(tileScalar, 0) : vec2(0, tileScalar);
  return tileVector;
}

/** Whether the lower level is grass or water (NOTE: not supporting water directly to cliff face for now)*/
export type Axis = "x" | "y";

/** Whether the lower level is grass or water (NOTE: not supporting water directly to cliff face for now)*/
export type CliffType = "water" | "grass";

/** Makes a terrain tile by using game-specific ids/constants */
export function mkTerrainTile(
  cliffs: OrdinalDirection[],
  cliffIdx: number,
  ljs: ILJS,
  cliffFace = false,
): TileInfo {
  if (cliffIdx < 1) {
    return mkTile("terrain.water", ljs);
  }

  // north edge is cliff ... etc
  const northCliff = cliffs.includes("n");
  const southCliff = cliffs.includes("s");
  const westCliff = cliffs.includes("w");
  const eastCliff = cliffs.includes("e");

  const cliffType: CliffType = cliffIdx > 1 ? "grass" : "water";

  let pos = cliffTypeOriginMap[cliffType];

  if (cliffFace && cliffIdx > 1) {
    pos = pos.add(vec2(0, 1));
  }

  if (northCliff && southCliff) {
    pos = pos.add(bothOffset(cliffType, "y"));
  } else if (northCliff) {
    pos = pos.add(vec2(0, -1));
  } else if (southCliff) {
    pos = pos.add(vec2(0, 1));
  }

  if (westCliff && eastCliff) {
    pos = pos.add(bothOffset(cliffType, "x"));
  } else if (westCliff) {
    pos = pos.add(vec2(-1, 0));
  } else if (eastCliff) {
    pos = pos.add(vec2(1, 0));
  }

  return ljs.tile(
    pos.y * 9 + pos.x,
    vec2(tileScale),
    textureIndexMap[cliffIdxTextureMap[cliffIdx]],
  );
}
