import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import type { IUnit } from "../units/unit.types";
import type { Ability } from "./abilities.types";
import { AbilityBase } from "./ability-base";

export class Attack extends AbilityBase {
  readonly type: Ability = "attack";

  protected readonly _preswingDuration = 0;
  protected readonly _backswingDuration = 0.2;

  constructor(unit: IUnit, ljs: ILJS) {
    super(unit, ljs);
  }

  protected _applyEffect(): void {}
}
