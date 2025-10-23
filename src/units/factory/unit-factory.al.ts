import { inject } from "inversify";
import { Autoloadable } from "../../core/autoload/autoloadable";
import {
  BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN,
  type IBox2dObjectAdapterFactory,
} from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter-factory.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "../../sprite-animation/sprite-animation-factory.types";
import { UNIT_FACTORY_TOKEN, type IUnitFactory } from "./unit-factory.types";
import { LJS_TOKEN } from "../../littlejsengine/littlejsengine.token";
import { UnitTypeInitDataMap, type IUnit, type UnitType } from "../unit.types";
import { vec2, WHITE } from "../../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import { Warrior } from "../warrior/warrior";
import { Lancer } from "../lancer/lancer";
import { Spider } from "../spider/spider";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";

@Autoloadable({
  serviceIdentifier: UNIT_FACTORY_TOKEN,
})
export class UnitFactory implements IUnitFactory {
  private readonly _spriteAnimationFactory: ISpriteAnimationFactory;
  private readonly _box2dObjectAdapterFactory: IBox2dObjectAdapterFactory;
  private readonly _ljs: ILJS;

  constructor(
    @inject(SPRITE_ANIMATION_FACTORY_TOKEN)
    spriteAnimationFactory: ISpriteAnimationFactory,
    @inject(BOX2D_OBJECT_ADAPTER_FACTORY_TOKEN)
    box2dObjectAdapterFactory: IBox2dObjectAdapterFactory,
    @inject(LJS_TOKEN)
    ljs: ILJS,
  ) {
    this._spriteAnimationFactory = spriteAnimationFactory;
    this._box2dObjectAdapterFactory = box2dObjectAdapterFactory;
    this._ljs = ljs;
  }

  createUnit(unitType: UnitType, position: Vector2): IUnit {
    const { size: sz, drawSizeScale } = UnitTypeInitDataMap[unitType];
    const size = vec2(sz);

    const b2ObjAdpt = this._box2dObjectAdapterFactory.createBox2dObjectAdapter(
      position,
      size,
      this._spriteAnimationFactory.createTileInfo("units.empty"),
      0,
      WHITE,
      this._ljs.box2d.bodyTypeDynamic,
    );

    // fit circle diameter to similar size of box around body
    b2ObjAdpt.addCircle(size.scale(0.75).length());
    // make the sprite tile fit to the physics body shape
    b2ObjAdpt.drawSize = size.scale(drawSizeScale);

    const args: [IBox2dObjectAdapter, ISpriteAnimationFactory, ILJS] = [
      b2ObjAdpt,
      this._spriteAnimationFactory,
      this._ljs,
    ];

    switch (unitType) {
      case "warrior":
        return new Warrior(...args);
      case "lancer":
        return new Lancer(...args);
      case "spider":
        return new Spider(...args);
      default:
        throw new Error("unit type not matched");
    }
  }
}
