import type { Vector2 } from "littlejsengine";
import { type GameInput, type IGameInputCommand } from "./game-input.types";

export class Move implements IGameInputCommand {
  readonly id: GameInput = "move";
  readonly direction: Vector2;

  constructor(direction: Vector2) {
    this.direction =
      direction.length() === 0 ? direction : direction.normalize();
  }
}
