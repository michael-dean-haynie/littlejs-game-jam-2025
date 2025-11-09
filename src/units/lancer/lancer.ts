import type { Vector2 } from "littlejsengine";
import { Attack } from "../../abilities/attack";
import { Guard } from "../../abilities/guard";
import { spriteSheetMap } from "../../textures/sprite-sheets/sprite-sheet-map";
import { UnitStateCasting } from "../states/unit-state-casting";
import { UnitStateIdling } from "../states/unit-state-idling";
import { UnitStateMoving } from "../states/unit-state-moving";
import { UnitObject } from "../unit-object";
import { unitTypeStatsMap } from "../unit-type-stats-map";
import { SpriteAnimation } from "../../sprite-animation/sprite-animation";

unitTypeStatsMap.lancer = {
  ...unitTypeStatsMap.lancer,
  size: 0.5,
  drawSizeScale: 6,
  moveSpeed: 3,
};

export class Lancer extends UnitObject {
  constructor(pos: Vector2) {
    super(pos, "lancer");

    // register animations
    this._registerAnimation(
      "idling",
      new SpriteAnimation("units.lancer.idling"),
    );
    this._registerAnimation(
      "moving",
      new SpriteAnimation("units.lancer.moving"),
    );
    this._registerAnimation(
      "guard",
      new SpriteAnimation({
        n: spriteSheetMap["units.lancer.guardUp"],
        ne: spriteSheetMap["units.lancer.guardUpRight"],
        e: spriteSheetMap["units.lancer.guardRight"],
        se: spriteSheetMap["units.lancer.guardDownRight"],
        s: spriteSheetMap["units.lancer.guardDown"],
      }),
    );
    this._registerAnimation(
      "attack",
      new SpriteAnimation({
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
