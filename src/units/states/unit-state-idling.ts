import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateIdling extends UnitStateBase {
  readonly state: UnitState = "idling";

  constructor(unit: IUnit) {
    super(unit);

    // message handlers
    this._messageHandlers["unit.move"] = () => {
      this._unit.pushState("moving");
      return "requeue";
    };
    this._messageHandlers["unit.cast"] = () => {
      this._unit.pushState("casting");
      return "requeue";
    };
    this._messageHandlers["unit.toggleCast"] = () => {
      this._unit.pushState("casting");
      return "requeue";
    };
  }

  override onEnter(): void {
    this._unit.swapAnimation(this.state);

    this._unit.moveDirection = vec2(0, 0);
    this._unit.box2dObjectAdapter.setLinearVelocity(
      this._unit.moveDirection.scale(this._unit.stats.moveSpeed),
    );
  }
}
