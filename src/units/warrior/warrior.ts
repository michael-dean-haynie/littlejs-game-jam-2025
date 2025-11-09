import type { Vector2 } from "littlejsengine";
import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import { spriteSheetMap } from "../../textures/sprite-sheets/sprite-sheet-map";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitObject } from "../unit-object";
import { unitTypeStatsMap } from "../unit-type-stats-map";
import type { IWorld } from "../../world/world.types";

unitTypeStatsMap.warrior = {
  ...unitTypeStatsMap.warrior,
  size: 0.5,
  drawSizeScale: 4,
  moveSpeed: 3,
};

export class Warrior extends UnitObject {
  constructor(
    pos: Vector2,
    world: IWorld,
    spriteAnimationFactory: ISpriteAnimationFactory,
  ) {
    super(pos, world, "warrior");

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
    this.abilityMap.set("attack", new Attack(this, 0, 0.2));
    this.abilityMap.set("guard", new Guard(this));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
