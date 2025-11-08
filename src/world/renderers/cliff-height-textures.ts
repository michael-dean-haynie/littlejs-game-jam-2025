import { textureIndexMap } from "../../textures/texture-index-map";
import type { Texture } from "../../textures/textures.types";

export const cliffHieghtTextures: { [index: number]: Texture } = {
  1: "terrain/Tilemap_color1.png",
  2: "terrain/Tilemap_color2.png",
  3: "terrain/Tilemap_color3.png",
  4: "terrain/Tilemap_color4.png",
  5: "terrain/Tilemap_color5.png",
} as const;

export const cliffHieghtTextureIndexMap: { [index: number]: number } = {
  1: textureIndexMap[cliffHieghtTextures[1]],
  2: textureIndexMap[cliffHieghtTextures[2]],
  3: textureIndexMap[cliffHieghtTextures[3]],
  4: textureIndexMap[cliffHieghtTextures[4]],
  5: textureIndexMap[cliffHieghtTextures[5]],
} as const;
