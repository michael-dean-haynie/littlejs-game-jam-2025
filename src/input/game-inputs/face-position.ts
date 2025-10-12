import type { Vector2 } from "../../littlejsengine/littlejsengine.types";
import { type GameInput, type IGameInputCommand } from "./game-input.types";

export class FacePosition implements IGameInputCommand {
  readonly id: GameInput = "facePosition";
  /** The world position to face */
  readonly position: Vector2;

  constructor(position: Vector2) {
    this.position = position;
  }
}
