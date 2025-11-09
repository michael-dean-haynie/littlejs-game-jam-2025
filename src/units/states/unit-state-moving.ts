import { vec2 } from "littlejsengine";
import type { UnitObject } from "../unit-object";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateMoving extends UnitStateBase {
  state: UnitState = "moving";

  constructor(unitObject: UnitObject) {
    super(unitObject);

    // message handlers
    this._messageHandlers["unit.move"] = (msg) => {
      if (msg.direction.length() === 0) {
        this._unitObject.popState();
        return "none";
      }
      this._unitObject.moveDirection = msg.direction;
      this._unitObject.setLinearVelocity(
        this._unitObject.moveDirection.scale(this._unitObject.stats.moveSpeed),
      );
      return "none";
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
  }

  override onExit(): void {
    this._unitObject.setLinearVelocity(vec2(0));
  }

  override onUpdate(): void {
    this._unitObject.setLinearVelocity(
      this._unitObject.moveDirection.scale(this._unitObject.stats.moveSpeed),
    );
  }
}
