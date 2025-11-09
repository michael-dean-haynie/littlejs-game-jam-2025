import { vec2 } from "littlejsengine";
import type { UnitObject } from "../unit-object";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateIdling extends UnitStateBase {
  readonly state: UnitState = "idling";

  constructor(unitObject: UnitObject) {
    super(unitObject);

    // message handlers
    this._messageHandlers["unit.move"] = () => {
      this._unitObject.pushState("moving");
      return "requeue";
    };
    this._messageHandlers["unit.cast"] = () => {
      this._unitObject.pushState("casting");
      return "requeue";
    };
    this._messageHandlers["unit.toggleCast"] = () => {
      this._unitObject.pushState("casting");
      return "requeue";
    };
  }

  override onEnter(): void {
    this._unitObject.swapAnimation(this.state);

    this._unitObject.moveDirection = vec2(0, 0);
    this._unitObject.setLinearVelocity(
      this._unitObject.moveDirection.scale(this._unitObject.stats.moveSpeed),
    );
  }
}
