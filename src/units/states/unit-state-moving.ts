import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateMoving extends UnitStateBase {
  state: UnitState = "moving";

  constructor(unit: IUnit) {
    super(unit);

    // message handlers
    this._messageHandlers["unit.move"] = (msg) => {
      if (msg.direction.length() === 0) {
        this._unit.popState();
        return "none";
      }
      this._unit.moveDirection = msg.direction;
      this._unit.box2dObjectAdapter.setLinearVelocity(
        this._unit.moveDirection.scale(this._unit.stats.moveSpeed),
      );
      return "none";
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
  }

  override onExit(): void {
    this._unit.box2dObjectAdapter.setLinearVelocity(vec2(0));
  }

  override onUpdate(): void {
    this._unit.box2dObjectAdapter.setLinearVelocity(
      this._unit.moveDirection.scale(this._unit.stats.moveSpeed),
    );
  }
}
