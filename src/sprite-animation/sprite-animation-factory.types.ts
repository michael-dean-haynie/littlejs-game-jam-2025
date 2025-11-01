import type { SpriteSheetId } from "../textures/sprite-sheets/sprite-sheet.types";
import type {
  DirSpriteSheetMap,
  ISpriteAnimation,
} from "./sprite-animation.types";

export const SPRITE_ANIMATION_FACTORY_TOKEN =
  "SPRITE_ANIMATION_FACTORY_TOKEN" as const;

export interface ISpriteAnimationFactory {
  createSpriteAnimation(
    spriteSheetData: SpriteSheetId | DirSpriteSheetMap,
  ): ISpriteAnimation;
}
