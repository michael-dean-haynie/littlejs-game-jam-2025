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

unitTypeInfoMap.skull = {
  ...unitTypeInfoMap.skull,
};

export class Skull extends UnitObject {
  constructor(pos: Vector2) {
    super(pos, "skull");

    // register animations
    this._registerAnimation(
      "idling",
      new SpriteAnimation("units.skull.idling"),
    );
    this._registerAnimation(
      "moving",
      new SpriteAnimation("units.skull.moving"),
    );
    this._registerAnimation("guard", new SpriteAnimation("units.skull.guard"));
    this._registerAnimation(
      "attack",
      new SpriteAnimation({
        n: spriteSheetMap["units.skull.attack"],
        ne: spriteSheetMap["units.skull.attack"],
        e: spriteSheetMap["units.skull.attack"],
        se: spriteSheetMap["units.skull.attack"],
        s: spriteSheetMap["units.skull.attack"],
      }),
    );

    // register abilities
    this.abilityMap.set("attack", new Attack(this, 0.2, 0.4));
    this.abilityMap.set("guard", new Guard(this));

    // register states
    this._stateMap.set("idling", new UnitStateIdling(this));
    this._stateMap.set("moving", new UnitStateMoving(this));
    this._stateMap.set("casting", new UnitStateCasting(this));

    // initial state
    this._initState("idling");
  }
}
