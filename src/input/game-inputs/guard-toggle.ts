import { type GameInput, type IGameInputCommand } from "./game-input.types";

export class GuardToggle implements IGameInputCommand {
  readonly id: GameInput = "guardToggle";
}
