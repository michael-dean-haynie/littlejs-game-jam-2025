import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import type { IBox2dObjectAdapter } from "../../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import { spriteSheetMap } from "../../textures/sprite-sheets/sprite-sheet-map";
import type { IWorld } from "../../world/world.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitBase } from "../unit-base";
import { unitTypeStatsMap } from "../unit-type-stats-map";
import type { UnitType } from "../unit.types";

unitTypeStatsMap.warrior = {
  ...unitTypeStatsMap.warrior,
  size: 0.5,
  drawSizeScale: 4,
  moveSpeed: 3,
};

export class Warrior extends UnitBase {
  readonly type: UnitType = "warrior";

  constructor(
    box2dObjectAapter: IBox2dObjectAdapter,
    spriteAnimationFactory: ISpriteAnimationFactory,
    world: IWorld,
    ljs: ILJS,
  ) {
    super(box2dObjectAapter, world);

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
        n: spriteSheetMap["units.warrior.attack2"],
        ne: spriteSheetMap["units.warrior.attack2"],
        e: spriteSheetMap["units.warrior.attack1"],
        se: spriteSheetMap["units.warrior.attack1"],
        s: spriteSheetMap["units.warrior.attack1"],
      }),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, ljs, 0, 0.2));
    this.abilityMap.set("guard", new Guard(this, ljs));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
