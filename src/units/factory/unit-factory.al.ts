import { inject } from "inversify";
import { Autoloadable } from "../../core/autoload/autoloadable";
import {
  SPRITE_ANIMATION_FACTORY_TOKEN,
  type ISpriteAnimationFactory,
} from "../../sprite-animation/sprite-animation-factory.types";
import { UNIT_FACTORY_TOKEN, type IUnitFactory } from "./unit-factory.types";
import { type UnitType } from "../unit.types";
import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import { Warrior } from "../warrior/warrior";
import { Lancer } from "../lancer/lancer";
import { Spider } from "../spider/spider";
import { WORLD_TOKEN, type IWorld } from "../../world/world.types";
import type { UnitObject } from "../unit-object";

@Autoloadable({
  serviceIdentifier: UNIT_FACTORY_TOKEN,
})
export class UnitFactory implements IUnitFactory {
  private readonly _spriteAnimationFactory: ISpriteAnimationFactory;
  private readonly _world: IWorld;

  constructor(
    @inject(SPRITE_ANIMATION_FACTORY_TOKEN)
    spriteAnimationFactory: ISpriteAnimationFactory,
    @inject(WORLD_TOKEN)
    world: IWorld,
  ) {
    this._spriteAnimationFactory = spriteAnimationFactory;
    this._world = world;
  }

  createUnit(unitType: UnitType, position: Vector2): UnitObject {
    const args: [Vector2, IWorld, ISpriteAnimationFactory] = [
      position,
      this._world,
      this._spriteAnimationFactory,
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
