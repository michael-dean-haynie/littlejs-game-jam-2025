import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type { IUnit } from "../units/unit.types";
import type { Ability } from "./abilities.types";
import { AbilityBase } from "./ability-base";

export class Attack extends AbilityBase {
  readonly type: Ability = "attack";

  protected readonly _preswingDuration: number;
  protected readonly _backswingDuration: number;

  // michael: pu@ make this flexible for different timings, damage, aoe, mele/missle etc.
  // then work on registering abilities in the unit class rather than in the casting state
  constructor(
    unit: IUnit,
    ljs: ILJS,
    preswingDuration: number,
    backswingDuration: number,
  ) {
    super(unit, ljs);
    this._preswingDuration = preswingDuration;
    this._backswingDuration = backswingDuration;
  }

  protected _applyEffect(): void {}
}
