import { box2d, tile, vec2, WHITE, type Vector2 } from "littlejsengine";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.contracts";
import { Autoloadable } from "../core/autoload/autoloadable";
import { Warrior } from "../warrior";
import { Box2dObjectAdapter } from "../box-2d-object";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "../sprite-animation/sprite-animation-factory.contracts";
import { inject } from "inversify";

@Autoloadable({
  serviceIdentifier: WARRIOR_FACTORY_TOKEN,
})
export class WarriorFactory implements IWarriorFactory {
  private readonly _spriteAnimationFactory: ISpriteAnimationFactory;

  constructor(
    @inject(SPRITE_ANIMATION_FACTORY_TOKEN)
    spriteAnimationFactory: ISpriteAnimationFactory,
  ) {
    this._spriteAnimationFactory = spriteAnimationFactory;
  }

  createWarrior(position: Vector2): Warrior {
    // michael: find a way for "Warrior" to own this stuff
    // this factory should just handle dependency resolution stuff
    const b2ObjAdpt = new Box2dObjectAdapter(
      position,
      vec2(10),
      tile(0, 192, 0, 0),
      0,
      WHITE,
      box2d.bodyTypeDynamic,
    );

    // michael: test if this is needed and remove? maybe matters for collision?
    // this.drawSize = this.size.scale(1.02); // slightly enlarge to cover gaps

    b2ObjAdpt.addBox(b2ObjAdpt.size);

    const spriteAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: tile(0, 192, 0, 0), duration: 5 },
      { tileInfo: tile(1, 192, 0, 0), duration: 5 },
      { tileInfo: tile(2, 192, 0, 0), duration: 5 },
      { tileInfo: tile(3, 192, 0, 0), duration: 5 },
      { tileInfo: tile(4, 192, 0, 0), duration: 5 },
      { tileInfo: tile(5, 192, 0, 0), duration: 5 },
      { tileInfo: tile(6, 192, 0, 0), duration: 5 },
      { tileInfo: tile(7, 192, 0, 0), duration: 5 },
    ]);

    return new Warrior(b2ObjAdpt, spriteAnimation);
  }
}
