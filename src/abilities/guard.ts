import type { IUnit } from "../units/unit.types";
import type { Ability } from "./abilities.types";
import { AbilityBase } from "./ability-base";

export class Guard extends AbilityBase {
  readonly type: Ability = "guard";
  protected readonly _preswingDuration = 0;
  protected readonly _backswingDuration = Number.POSITIVE_INFINITY;

  constructor(unit: IUnit) {
    super(unit);
  }

  protected _applyEffect(): void {}
}
