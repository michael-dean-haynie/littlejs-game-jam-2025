import type { UnitObject } from "../units/unit-object";
import type { Ability } from "./abilities.types";
import { AbilityBase } from "./ability-base";

export class Guard extends AbilityBase {
  readonly type: Ability = "guard";
  protected readonly _preswingDuration = 0;
  protected readonly _backswingDuration = Number.POSITIVE_INFINITY;

  constructor(unitObject: UnitObject) {
    super(unitObject);
  }

  protected _applyEffect(): void {}
}
