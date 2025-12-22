import type { Vector2 } from "littlejsengine";
import type { IInputCommand } from "./input-command";
import type { InputAction } from "../actions/input-action";

export class Move implements IInputCommand {
  readonly inputAction: InputAction = "move";
  readonly direction: Vector2;

  constructor(direction: Vector2) {
    this.direction =
      direction.length() === 0 ? direction : direction.normalize();
  }
}
