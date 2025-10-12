import type { IWarriorCommand } from "../../commands/warrior-commands.types";

export interface IWarriorMovementState {
  processCommand(command: IWarriorCommand): void;
}
