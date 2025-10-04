import type { SpriteAnimation } from "./sprite-animation";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";

export const SPRITE_ANIMATION_FACTORY_TOKEN =
  "SPRITE_ANIMATION_FACTORY_TOKEN" as const;

export interface ISpriteAnimationFactory {
  createSpriteAnimation(
    frames: ReadonlyArray<SpriteAnimationFrame>,
  ): SpriteAnimation;
}
