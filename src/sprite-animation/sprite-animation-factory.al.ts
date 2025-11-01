import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { SpriteAnimation } from "./sprite-animation";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type {
  ISpriteAnimation,
  DirSpriteSheetMap,
} from "./sprite-animation.types";
import type { SpriteSheetId } from "../textures/sprite-sheets/sprite-sheet.types";
import { spriteSheetMap } from "../textures/sprite-sheets/sprite-sheet-map";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
})
export class SpriteAnimationFactory implements ISpriteAnimationFactory {
  private readonly _ljs: ILJS;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  createSpriteAnimation(
    spriteSheetData: SpriteSheetId | DirSpriteSheetMap,
  ): ISpriteAnimation {
    let dirSpriteSheetMap: DirSpriteSheetMap;
    if (typeof spriteSheetData === "string") {
      dirSpriteSheetMap = {
        n: spriteSheetMap[spriteSheetData],
        ne: spriteSheetMap[spriteSheetData],
        e: spriteSheetMap[spriteSheetData],
        se: spriteSheetMap[spriteSheetData],
        s: spriteSheetMap[spriteSheetData],
      };
    } else {
      dirSpriteSheetMap = spriteSheetData;
    }

    return new SpriteAnimation(dirSpriteSheetMap, this._ljs);
  }
}
