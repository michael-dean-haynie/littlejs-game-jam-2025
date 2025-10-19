import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { ISpriteAnimation } from "../../sprite-animation/sprite-animation.types";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateIdling extends UnitStateBase {
  readonly state: UnitState = "idling";

  private readonly _animation: ISpriteAnimation;

  constructor(unit: IUnit, animation: ISpriteAnimation) {
    super(unit);
    this._animation = animation;

    // transition handlers
    this._transitionHandlers["moving"] = () => {
      this._unit.pushState("moving");
    };

    // message handlers
    this._messageHandlers["unit.move"] = () => {
      this._transitionTo("moving");
      return "requeue";
    };
  }

  override onEnter(): void {
    this._unit.swapAnimation(this._animation);

    this._unit.moveDirection = vec2(0, 0);
    this._unit.box2dObjectAdapter.setLinearVelocity(
      this._unit.moveDirection.scale(this._unit.moveSpeed),
    );
  }
}
