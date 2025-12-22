import type { Vector2 } from "littlejsengine";
import type { InputAction } from "../actions/input-action";
import type { IInputCommand } from "./input-command";

export class FaceDirection implements IInputCommand {
  readonly inputAction: InputAction = "faceDirection";
  readonly direction: Vector2;

  constructor(direction: Vector2) {
    this.direction =
      direction.length() === 0 ? direction : direction.normalize();
  }
}
