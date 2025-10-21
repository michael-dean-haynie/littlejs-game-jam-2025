import { BehaviorSubject } from "rxjs";
import type { Ability, AbilityPhase, IAbility } from "./abilities.types";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { noCap } from "../core/util/no-cap";
import type { IUnit } from "../units/unit.types";

export abstract class AbilityBase implements IAbility {
  abstract readonly type: Ability;

  protected readonly _phase$ = new BehaviorSubject<AbilityPhase>("init");
  readonly phase$ = this._phase$.asObservable();
  protected readonly _unit: IUnit;

  protected abstract readonly _preswingDuration: number;
  protected abstract readonly _backswingDuration: number;

  private readonly _ljs: ILJS;
  private _phaseStart: number | null = null;

  constructor(unit: IUnit, ljs: ILJS) {
    this._unit = unit;
    this._ljs = ljs;
  }

  progress(): void {
    switch (this._phase$.value) {
      case "init":
        this._unit.swapAnimation(this.type);
        this._phaseStart = this._ljs.time;
        this._phase$.next("preswing");
        this.progress();
        break;
      case "preswing":
        if (this.getPhaseDelta() >= this._preswingDuration) {
          this._phaseStart = this._ljs.time;
          this._phase$.next("swing");
          this.progress();
        }
        break;
      case "swing":
        this._applyEffect();
        this._phase$.next("backswing");
        this.progress();
        break;
      case "backswing":
        if (this.getPhaseDelta() >= this._backswingDuration) {
          this._phaseStart = this._ljs.time;
          this._phase$.next("complete");
          this.progress();
        }
        break;
      case "complete":
        break;
    }
  }

  protected abstract _applyEffect(): void;

  private getPhaseDelta(): number {
    noCap(this._phaseStart !== null);
    return this._ljs.time - this._phaseStart;
  }
}
