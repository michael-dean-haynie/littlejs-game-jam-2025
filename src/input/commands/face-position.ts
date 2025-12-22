import type { Vector2 } from "littlejsengine";
import type { IInputCommand } from "./input-command";
import type { InputAction } from "../actions/input-action";

export class FacePosition implements IInputCommand {
  readonly inputAction: InputAction = "facePosition";
  /** The world position to face */
  readonly position: Vector2;

  constructor(position: Vector2) {
    this.position = position;
  }
}
