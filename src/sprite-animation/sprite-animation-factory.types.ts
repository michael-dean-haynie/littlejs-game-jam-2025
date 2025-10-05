import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import type { ISpriteAnimation } from "./sprite-animation.types";

export const SPRITE_ANIMATION_FACTORY_TOKEN =
  "SPRITE_ANIMATION_FACTORY_TOKEN" as const;

export interface ISpriteAnimationFactory {
  createSpriteAnimation(
    frames: ReadonlyArray<SpriteAnimationFrame>,
  ): ISpriteAnimation;
}
