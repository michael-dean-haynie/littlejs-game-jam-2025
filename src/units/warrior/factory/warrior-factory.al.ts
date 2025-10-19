import { inject } from "inversify";
import { Autoloadable } from "../../../core/autoload/autoloadable";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "../../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter-factory.types";
import type { ILJS } from "../../../littlejsengine/littlejsengine.impure";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "../../../sprite-animation/sprite-animation-factory.types";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "./warrior-factory.types";
import { LJS_TOKEN } from "../../../littlejsengine/littlejsengine.token";
import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import { vec2, WHITE } from "../../../littlejsengine/littlejsengine.pure";
import { Warrior } from "../warrior";

@Autoloadable({
  serviceIdentifier: WARRIOR_FACTORY_TOKEN,
})
export class WarriorFactory implements IWarriorFactory {
  private readonly _spriteAnimationFactory: ISpriteAnimationFactory;
  private readonly _box2dObjectAdapterFactory: IBox2dObjectAdapterFactory;
  private readonly _ljs: ILJS;

  constructor(
    @inject(SPRITE_ANIMATION_FACTORY_TOKEN)
    spriteAnimationFactory: ISpriteAnimationFactory,
    @inject(BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN)
    box2dObjectAdapterFactory: IBox2dObjectAdapterFactory,
    @inject(LJS_TOKEN)
    engine: ILJS,
  ) {
    this._spriteAnimationFactory = spriteAnimationFactory;
    this._box2dObjectAdapterFactory = box2dObjectAdapterFactory;
    this._ljs = engine;
  }

  createWarrior(position: Vector2): Warrior {
    const size = vec2(3);

    const b2ObjAdpt = this._box2dObjectAdapterFactory.createBox2dObjectAdapter(
      position,
      size,
      this._ljs.tile(0, 192, 0, 0),
      0,
      WHITE,
      this._ljs.box2d.bodyTypeDynamic,
    );

    // fit circle diameter to similar size of box around body
    b2ObjAdpt.addCircle(size.scale(0.75).length());
    // make the sprite tile fit to the physics body shape
    b2ObjAdpt.drawSize = size.scale(2);

    const idleAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: this._ljs.tile(0, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(1, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(2, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(3, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(4, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(5, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(6, 192, 0, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(7, 192, 0, 0), duration: 0.1 },
    ]);

    const runAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: this._ljs.tile(0, 192, 1, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(1, 192, 1, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(2, 192, 1, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(3, 192, 1, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(4, 192, 1, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(5, 192, 1, 0), duration: 0.1 },
    ]);

    // const attack1Animation = this._spriteAnimationFactory.createSpriteAnimation(
    //   [
    //     { tileInfo: this._ljs.tile(0, 192, 2, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(1, 192, 2, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(2, 192, 2, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(3, 192, 2, 0), duration: 0.1 },
    //   ],
    // );

    // const attack2Animation = this._spriteAnimationFactory.createSpriteAnimation(
    //   [
    //     { tileInfo: this._ljs.tile(0, 192, 3, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(1, 192, 3, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(2, 192, 3, 0), duration: 0.1 },
    //     { tileInfo: this._ljs.tile(3, 192, 3, 0), duration: 0.1 },
    //   ],
    // );

    return new Warrior(b2ObjAdpt, idleAnimation, runAnimation);
  }
}
