import { noCap } from "../core/util/no-cap";
import {
  textures,
  type AnimationTexture,
  type AnimationTextureId,
  type Texture,
  type TextureId,
  type TileTexture,
  type TileTextureId,
} from "./textures.types";

export function getTexture(id: TextureId): [Texture, number] {
  const idx = textures.findIndex((txt) => txt.id === id);
  noCap(idx !== -1, "Was not able to find texture.");
  return [textures[idx], idx];
}

// michael: use type guards or something better
export function getAnimationTexture(
  id: AnimationTextureId,
): [AnimationTexture, number] {
  return getTexture(id) as [AnimationTexture, number];
}

// michael: use type guards or something better
export function getTileTexture(id: TileTextureId): [TileTexture, number] {
  return getTexture(id) as [TileTexture, number];
}
