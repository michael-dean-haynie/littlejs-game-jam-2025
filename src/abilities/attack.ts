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

  protected _applyEffect(): void {}
}
