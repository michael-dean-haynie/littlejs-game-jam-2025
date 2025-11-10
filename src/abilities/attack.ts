import { box2d, Box2dObject, debugCircle, vec2 } from "littlejsengine";
import type { UnitObject } from "../units/unit-object";
import type { Ability } from "./abilities.types";
import { AbilityBase } from "./ability-base";

export class Attack extends AbilityBase {
  readonly type: Ability = "attack";

  protected readonly _preswingDuration: number;
  protected readonly _backswingDuration: number;

  // michael: improve: make this flexible for different timings, damage, aoe, mele/missle etc.
  constructor(
    unitObject: UnitObject,
    preswingDuration: number,
    backswingDuration: number,
  ) {
    super(unitObject);
    this._preswingDuration = preswingDuration;
    this._backswingDuration = backswingDuration;
  }

  protected _applyEffect(): void {
    const diameter = 2;
    const dbhbSize = vec2(diameter).scale(0.5).length();
    debugCircle(this._unitObject.getPerspectivePos(), dbhbSize, undefined, 1);

    const castHits = box2d.circleCastAll(
      this._unitObject.getCenterOfMass(),
      diameter,
    ) as Box2dObject[];

    const strength = 30;
    for (const castHit of castHits) {
      if (castHit === this._unitObject) continue;
      const force = castHit
        .getCenterOfMass()
        .subtract(this._unitObject.getCenterOfMass())
        .normalize(strength);
      castHit.applyForce(force);
    }
  }
}
