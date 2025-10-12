import { enumerationFactory } from "../../core/enumeration-factory";

export const WarriorCommands = enumerationFactory(
  "move",
  "faceDirection",
  "facePosition",
);
export type WarriorCommand = ReturnType<typeof WarriorCommands.values>[number];

export interface IWarriorCommand {
  readonly id: WarriorCommand;
}
