import { filter, Subscription, tap } from "rxjs";
import type { IAbility } from "../../abilities/abilities.types";
import type { IAbilityFactory } from "../../abilities/factory/ability-factory.types";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateCasting extends UnitStateBase {
  state: UnitState = "casting";

  private readonly _abilityFactory: IAbilityFactory;
  private _ability: IAbility | null = null;
  private _abilityCompleteSub?: Subscription;

  constructor(unit: IUnit, abilityFactory: IAbilityFactory) {
    super(unit);

    this._abilityFactory = abilityFactory;

    // message handlers
    this._messageHandlers["unit.cast"] = (msg) => {
      if (this._ability === null) {
        this._ability = this._abilityFactory.createAbility(msg.ability, unit);
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
        this._ability = this._abilityFactory.createAbility(msg.ability, unit);
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
    this._ability = null;
  }

  override onUpdate(): void {
    this._ability?.progress();
  }
}
