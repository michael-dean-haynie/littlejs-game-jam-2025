import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { ISpriteAnimation } from "../../sprite-animation/sprite-animation.types";
import type { IUnit } from "../unit.types";
import type { UnitState } from "./states.types";
import { UnitStateBase } from "./unit-state-base";

export class UnitStateMoving extends UnitStateBase {
  state: UnitState = "moving";

  private readonly _animation: ISpriteAnimation;

  constructor(unit: IUnit, animation: ISpriteAnimation) {
    super(unit);
    this._animation = animation;

    // transition handlers
    this._transitionHandlers["idling"] = () => {
      this._unit.popState();
    };

    // message handlers
    this._messageHandlers["unit.move"] = (msg) => {
      if (msg.direction.length() === 0) {
        this._transitionTo("idling");
        return "none";
      }
      this._unit.moveDirection = msg.direction;
      this._unit.box2dObjectAdapter.setLinearVelocity(
        this._unit.moveDirection.scale(this._unit.moveSpeed),
      );
      return "none";
    };
  }

  override onEnter(): void {
    this._unit.swapAnimation(this._animation);
  }

  override onExit(): void {
    this._unit.moveDirection = vec2(0, 0);
    this._unit.box2dObjectAdapter.setLinearVelocity(
      this._unit.moveDirection.scale(this._unit.moveSpeed),
    );
  }
}
