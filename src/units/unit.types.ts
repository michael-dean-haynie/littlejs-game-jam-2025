import type { IBox2dObjectAdapter } from "../littlejsengine/box2d/box2d-object-adapter/box2d-object-adapter.types";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import type { ISpriteAnimation } from "../sprite-animation/sprite-animation.types";
import type { UnitState } from "./states/states.types";

export interface IUnit {
  destroy(): void;
  enqueueMessage(command: object): void;
  swapAnimation(animation: ISpriteAnimation): void;
  pushState(state: UnitState): void;
  popState(): void;
  set moveDirection(direction: Vector2);
  set faceDirection(direction: Vector2);
  readonly box2dObjectAdapter: IBox2dObjectAdapter;
  readonly moveSpeed: number;
}
