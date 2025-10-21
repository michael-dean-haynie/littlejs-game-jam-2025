import { type GameInput, type IGameInputCommand } from "./game-input.types";

export class Attack implements IGameInputCommand {
  readonly id: GameInput = "attack";
}
