import type { OrdinalDirection } from "../../../core/types/directions.types";
import type { ILJS } from "../../../littlejsengine/littlejsengine.impure";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";
import type {
  TileInfo,
  Vector2,
} from "../../../littlejsengine/littlejsengine.types";
import type { RampDirection } from "../../../terrain/terrain-thing.types";
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

export type Axis = "x" | "y";

/** Whether the lower level is grass or water (NOTE: not supporting water directly to cliff face for now)*/
export type CliffType = "water" | "grass";

/** Makes a terrain tile by using game-specific ids/constants */
export function mkTerrainTile(
  cliffs: OrdinalDirection[],
  cliffIdx: number,
  rampToWest: boolean,
  rampToEast: boolean,
  ljs: ILJS,
  cliffFace = false,
): TileInfo {
  if (cliffIdx < 1) {
    return mkTile("terrain.water", ljs);
  }

  // north edge is cliff ... etc
  const northCliff = cliffs.includes("n");
  const southCliff = cliffs.includes("s");
  const westCliff = cliffs.includes("w") && !rampToWest;
  const eastCliff = cliffs.includes("e") && !rampToEast;

  const cliffType: CliffType = cliffIdx > 1 ? "grass" : "water";

  let pos = cliffTypeOriginMap[cliffType];

  // prevent cliff face for water, base grass
  if (cliffFace && cliffIdx < 2) {
    cliffFace = false;
  }
  if (cliffFace) {
    pos = pos.add(vec2(0, 1));
  }

  if (northCliff && southCliff) {
    pos = pos.add(bothOffset(cliffType, "y"));
    if (cliffFace) {
      // prevent cliff base being water (edge case)
      pos = pos.add(vec2(0, -2));
    }
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

const rampDirOriginMap: { [key in RampDirection]: Vector2 } = {
  e: vec2(0, 5),
  w: vec2(3, 5),
};

export function mkRampTile(
  rampDir: RampDirection,
  cliffIdx: number,
  ljs: ILJS,
  topHalf = false,
) {
  let pos = rampDirOriginMap[rampDir];
  if (topHalf) {
    pos = pos.add(vec2(0, -1));
  }
  return ljs.tile(
    pos.y * 9 + pos.x,
    vec2(tileScale),
    textureIndexMap[cliffIdxTextureMap[cliffIdx + 1]],
  );
}
