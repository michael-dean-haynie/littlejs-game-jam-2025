import type { IAbilityFactory } from "../../abilities/factory/ability-factory.types";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import type { UnitType } from "../unit.types";

export class Warrior extends UnitBase {
  readonly type: UnitType = "warrior";

  protected _moveSpeed: number = 5;

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    spriteAnimationFactory: ISpriteAnimationFactory,
    abilityFactory: IAbilityFactory,
  ) {
    super(box2dObjectAapter);

    // register animations
    this._registerAnimation(
      "idling",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.idling"),
    );
    this._registerAnimation(
      "moving",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.moving"),
    );
    this._registerAnimation(
      "guard",
      spriteAnimationFactory.createSpriteAnimation("units.warrior.guard"),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation({
        n: "units.warrior.attack2",
        ne: "units.warrior.attack2",
        e: "units.warrior.attack1",
        se: "units.warrior.attack1",
        s: "units.warrior.attack1",
      }),
    );

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this, abilityFactory));

    // initi state
    this._initState("idling");
  }
}
