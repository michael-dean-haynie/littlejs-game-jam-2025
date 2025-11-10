import type { Vector2 } from "littlejsengine";
import { UnitObject } from "./unit-object";
import { SpriteAnimation } from "../sprite-animation/sprite-animation";
import { spriteSheetMap } from "../textures/sprite-sheets/sprite-sheet-map";
import { Attack } from "../abilities/attack";
import { Guard } from "../abilities/guard";
import { UnitStateIdling } from "./states/unit-state-idling";
import { UnitStateMoving } from "./states/unit-state-moving";
import { UnitStateCasting } from "./states/unit-state-casting";
import { unitTypeInfoMap } from "./unit-type-info";

unitTypeInfoMap.warrior = {
  ...unitTypeInfoMap.warrior,
  size: 0.5,
  drawSizeScale: 4,
};

export class Warrior extends UnitObject {
  constructor(pos: Vector2) {
    super(pos, "warrior");

    // register animations
    this._registerAnimation(
      "idling",
      new SpriteAnimation("units.warrior.idling"),
    );
    this._registerAnimation(
      "moving",
      new SpriteAnimation("units.warrior.moving"),
    );
    this._registerAnimation(
      "guard",
      new SpriteAnimation("units.warrior.guard"),
    );
    this._registerAnimation(
      "attack",
      new SpriteAnimation({
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
