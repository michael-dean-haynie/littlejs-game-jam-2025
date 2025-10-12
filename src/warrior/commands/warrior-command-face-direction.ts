import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import type { IWarriorCommand, WarriorCommand } from "./warrior-commands.types";

export class WarriorCommandFaceDirection implements IWarriorCommand {
  readonly id: WarriorCommand = "faceDirection";
  readonly direction: Vector2;

  constructor(direction: Vector2) {
    this.direction =
      direction.length() === 0 ? direction : direction.normalize();
  }
}
