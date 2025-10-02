import type { SpriteAnimation } from "./sprite-animation";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";

export const SPRITE_ANIMATION_FACTORY_TOKEN = Symbol(
  "SPRITE_ANIMATION_FACTORY_TOKEN",
);

export interface ISpriteAnimationFactory {
  createSpriteAnimation(
    frames: ReadonlyArray<SpriteAnimationFrame>,
  ): SpriteAnimation;
}
