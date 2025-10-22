import { filter, Subscription, tap } from "rxjs";
import type { IAbility } from "../../abilities/abilities.types";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateCasting extends UnitStateBase {
  state: UnitState = "casting";

  private _ability: IAbility | null = null;
  private _abilityCompleteSub?: Subscription;

  constructor(unit: IUnit) {
    super(unit);

    // message handlers
    this._messageHandlers["unit.cast"] = (msg) => {
      if (this._ability === null) {
        this._ability = this._unit.abilityMap.get(msg.ability) ?? null;
        if (this._ability === null) {
          console.warn("Ability triggered, but missing on unit");
          return "none";
        }

        this._abilityCompleteSub = this._ability.phase$
          .pipe(
            filter((phase) => phase === "complete"),
            tap(() => {
              this._unit.popState();
            }),
          )
          .subscribe();
        this._ability.progress();
      }
      return "none";
    };

    this._messageHandlers["unit.toggleCast"] = (msg) => {
      if (this._ability === null) {
        this._ability = this._unit.abilityMap.get(msg.ability) ?? null;
        if (this._ability === null) {
          console.warn("Ability triggered, but missing on unit");
          return "none";
        }

        this._abilityCompleteSub = this._ability.phase$
          .pipe(
            filter((phase) => phase === "complete"),
            tap(() => {
              this._unit.popState();
            }),
          )
          .subscribe();
        this._ability.progress();
        return "none";
      }
      if (this._ability?.type === msg.ability) {
        this._unit.popState();
        return "none";
      }
      return "none";
    };
  }

  override onEnter(): void {}

  override onExit(): void {
    this._abilityCompleteSub?.unsubscribe();
    this._ability?.restart();
    this._ability = null;
  }

  override onUpdate(): void {
    this._ability?.progress();
  }
}
