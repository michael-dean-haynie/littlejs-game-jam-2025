import type { InputAction } from "../actions/input-action";
import type { IInputCommand } from "./input-command";

export class Attack implements IInputCommand {
  readonly inputAction: InputAction = "attack";
}
