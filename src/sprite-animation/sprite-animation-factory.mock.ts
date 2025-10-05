import { mock } from "vitest-mock-extended";
import { Autoloadable } from "../core/autoload/autoloadable";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "./sprite-animation-factory.types";
import { SpriteAnimationMock } from "./sprite-animation.mock";

@Autoloadable({
  serviceIdentifier: SPRITE_ANIMATION_FACTORY_TOKEN,
  executionContext: "test",
})
export class SpriteAnimationFactoryMock {
  // michael: figure out how to autload non-classes so I can make this officially implement the interface
  constructor() {
    return mock<ISpriteAnimationFactory>({
      createSpriteAnimation: () => new SpriteAnimationMock(),
    });
  }
}
