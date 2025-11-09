import { BehaviorSubject } from "rxjs";
import type { Ability, AbilityPhase, IAbility } from "./abilities.types";
import { noCap } from "../core/util/no-cap";
import { time } from "littlejsengine";
import type { UnitObject } from "../units/unit-object";

export abstract class AbilityBase implements IAbility {
  abstract readonly type: Ability;

  protected readonly _phase$ = new BehaviorSubject<AbilityPhase>("init");
  readonly phase$ = this._phase$.asObservable();
  protected readonly _unitObject: UnitObject;

  protected abstract readonly _preswingDuration: number;
  protected abstract readonly _backswingDuration: number;

  private _phaseStart: number | null = null;

  constructor(unitObject: UnitObject) {
    this._unitObject = unitObject;
  }

  progress(): void {
    switch (this._phase$.value) {
      case "init":
        this._unitObject.swapAnimation(this.type);
        this._phaseStart = time;
        this._phase$.next("preswing");
        this.progress();
        break;
      case "preswing":
        if (this.getPhaseDelta() >= this._preswingDuration) {
          this._phaseStart = time;
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
          this._phaseStart = time;
          this._phase$.next("complete");
        }
        break;
      case "complete":
        break;
    }
  }

  restart(): void {
    this._phase$.next("init");
  }

  protected abstract _applyEffect(): void;

  private getPhaseDelta(): number {
    noCap(this._phaseStart !== null);
    return time - this._phaseStart;
  }
}
