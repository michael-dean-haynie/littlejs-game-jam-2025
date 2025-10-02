import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { ENGINE_TOKEN, type IEngine } from "../engine/engine.contracts";
import { SpriteAnimation } from "./sprite-animation";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.contracts";
import type { SpriteAnimationFrame } from "./sprite-animation-frame";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
})
export class SpriteAnimationFactory implements ISpriteAnimationFactory {
  private readonly _engine: IEngine;

  constructor(@inject(ENGINE_TOKEN) engine: IEngine) {
    this._engine = engine;
  }

  createSpriteAnimation(
    frames: ReadonlyArray<SpriteAnimationFrame>,
  ): SpriteAnimation {
    return new SpriteAnimation(frames, this._engine);
  }
}
