import type { IGameInputCommand } from "../../../input/game-inputs/game-input.types";

export interface IWarriorMovementState {
  processGameInputCommand(command: IGameInputCommand): void;
}
