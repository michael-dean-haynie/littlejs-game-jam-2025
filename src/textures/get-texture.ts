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
  const [texture, idx] = getTexture(id);
  return [texture as AnimationTexture, idx];
}

// michael: use type guards or something better
export function getTileTexture(id: TileTextureId): [TileTexture, number] {
  const [texture, idx] = getTexture(id);
  return [texture as TileTexture, idx];
}
