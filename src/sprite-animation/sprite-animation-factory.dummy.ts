import { Autoloadable } from "../core/autoload/autoloadable";
import type { SpriteAnimation } from "./sprite-animation";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.types";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
  executionContext: "test",
})
export class SpriteAnimationFactoryDummy implements ISpriteAnimationFactory {
  createSpriteAnimation(): SpriteAnimation {
    throw new Error("Method not implemented.");
  }
}
