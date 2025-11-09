import type { Vector2 } from "littlejsengine";
import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import type { ISpriteAnimationFactory } from "../../sprite-animation/sprite-animation-factory.types";
import { spriteSheetMap } from "../../textures/sprite-sheets/sprite-sheet-map";
import type { IWorld } from "../../world/world.types";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitObject } from "../unit-object";
import { unitTypeStatsMap } from "../unit-type-stats-map";

unitTypeStatsMap.lancer = {
  ...unitTypeStatsMap.lancer,
  size: 0.5,
  drawSizeScale: 6,
  moveSpeed: 3,
};

export class Lancer extends UnitObject {
  constructor(
    pos: Vector2,
    world: IWorld,
    spriteAnimationFactory: ISpriteAnimationFactory,
  ) {
    super(pos, world, "lancer");

    // register animations
    this._registerAnimation(
      "idling",
      spriteAnimationFactory.createSpriteAnimation("units.lancer.idling"),
    );
    this._registerAnimation(
      "moving",
      spriteAnimationFactory.createSpriteAnimation("units.lancer.moving"),
    );
    this._registerAnimation(
      "guard",
      spriteAnimationFactory.createSpriteAnimation({
        n: spriteSheetMap["units.lancer.guardUp"],
        ne: spriteSheetMap["units.lancer.guardUpRight"],
        e: spriteSheetMap["units.lancer.guardRight"],
        se: spriteSheetMap["units.lancer.guardDownRight"],
        s: spriteSheetMap["units.lancer.guardDown"],
      }),
    );
    this._registerAnimation(
      "attack",
      spriteAnimationFactory.createSpriteAnimation({
        n: spriteSheetMap["units.lancer.attackUp"],
        ne: spriteSheetMap["units.lancer.attackUpRight"],
        e: spriteSheetMap["units.lancer.attackRight"],
        se: spriteSheetMap["units.lancer.attackDownRight"],
        s: spriteSheetMap["units.lancer.attackDown"],
      }),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, 0, 0.3));
    this.abilityMap.set("guard", new Guard(this));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
