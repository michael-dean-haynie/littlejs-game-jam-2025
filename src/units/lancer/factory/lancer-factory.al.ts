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
  LANCER_FACTORY_TOKEN,
  type ILancerFactory,
} from "./lancer-factory.types";
import { LJS_TOKEN } from "../../../littlejsengine/littlejsengine.token";
import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import { vec2, WHITE } from "../../../littlejsengine/littlejsengine.pure";
import { Lancer } from "../lancer";

@Autoloadable({
  serviceIdentifier: LANCER_FACTORY_TOKEN,
})
export class LancerFactory implements ILancerFactory {
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

  createLancer(position: Vector2): Lancer {
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
    b2ObjAdpt.drawSize = size.scale(3.5);

    const idleAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: this._ljs.tile(0, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(1, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(2, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(3, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(4, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(5, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(6, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(7, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(8, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(9, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(10, 320, 4, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(11, 320, 4, 0), duration: 0.1 },
    ]);

    const runAnimation = this._spriteAnimationFactory.createSpriteAnimation([
      { tileInfo: this._ljs.tile(0, 320, 5, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(1, 320, 5, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(2, 320, 5, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(3, 320, 5, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(4, 320, 5, 0), duration: 0.1 },
      { tileInfo: this._ljs.tile(5, 320, 5, 0), duration: 0.1 },
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

    return new Lancer(b2ObjAdpt, idleAnimation, runAnimation);
  }
}
