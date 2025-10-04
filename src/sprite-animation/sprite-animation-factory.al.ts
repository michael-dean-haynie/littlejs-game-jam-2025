import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { SpriteAnimation } from "./sprite-animation";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.types";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
})
export class SpriteAnimationFactory implements ISpriteAnimationFactory {
  private readonly _ljs: ILJS;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  createSpriteAnimation(
    frames: ReadonlyArray<SpriteAnimationFrame>,
  ): SpriteAnimation {
    return new SpriteAnimation(frames, this._ljs);
  }
}
