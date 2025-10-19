import type { TileInfo } from "../littlejsengine/littlejsengine.types";
import type { TextureId } from "../textures/textures.types";
import type { ISpriteAnimation } from "./sprite-animation.types";

export const SPRITE_ANIMATION_FACTORY_TOKEN =
  "SPRITE_ANIMATION_FACTORY_TOKEN" as const;

export interface ISpriteAnimationFactory {
  createSpriteAnimation(textureId: TextureId): ISpriteAnimation;
  createTileInfo(textureId: TextureId): TileInfo;
}
