import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import type { IWarriorCommand, WarriorCommand } from "./warrior-commands.types";

export class WarriorCommandFacePosition implements IWarriorCommand {
  readonly id: WarriorCommand = "facePosition";
  /** The world position to face */
  readonly position: Vector2;

  constructor(position: Vector2) {
    this.position = position;
  }
}
