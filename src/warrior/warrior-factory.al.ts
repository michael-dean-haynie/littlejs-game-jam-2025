import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.types";
import { Autoloadable } from "../core/autoload/autoloadable";
import { Warrior } from "./warrior";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "../sprite-animation/sprite-animation-factory.types";
import { inject } from "inversify";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import { Box2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter";
import { vec2, WHITE } from "../littlejsengine/littlejsengine.pure";

@Autoloadable({
  serviceIdentifier: WARRIOR_FACTORY_TOKEN,
})
export class WarriorFactory implements IWarriorFactory {
  private readonly _spriteAnimationFactory: ISpriteAnimationFactory;
  private readonly _ljs: ILJS;

  constructor(
    @inject(SPRITE_ANIMATION_FACTORY_TOKEN)
    spriteAnimationFactory: ISpriteAnimationFactory,
    @inject(LJS_TOKEN)
    engine: ILJS,
  ) {
    this._spriteAnimationFactory = spriteAnimationFactory;
    this._ljs = engine;
  }

  createWarrior(position: Vector2): Warrior {
    const size = vec2(10);

    const b2ObjAdpt = new Box2dObjectAdapter(
      position,
      size,
      this._ljs.tile(0, 192, 0, 0),
      0,
      WHITE,
      this._ljs.box2d.bodyTypeDynamic,
    );

    // michael: test if this is needed and remove? maybe matters for collision?
    // this.drawSize = this.size.scale(1.02); // slightly enlarge to cover gaps

    b2ObjAdpt.addBox(b2ObjAdpt.size);

    const spriteAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: this._ljs.tile(0, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(1, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(2, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(3, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(4, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(5, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(6, 192, 0, 0), duration: 0.2 },
      { tileInfo: this._ljs.tile(7, 192, 0, 0), duration: 0.2 },
    ]);

    return new Warrior(b2ObjAdpt, spriteAnimation);
  }
}
