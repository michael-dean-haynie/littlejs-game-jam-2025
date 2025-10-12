import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import { type GameInput, type IGameInputCommand } from "./game-input.types";

export class FaceDirection implements IGameInputCommand {
  readonly id: GameInput = "faceDirection";
  readonly direction: Vector2;

  constructor(direction: Vector2) {
    this.direction =
      direction.length() === 0 ? direction : direction.normalize();
  }
}
