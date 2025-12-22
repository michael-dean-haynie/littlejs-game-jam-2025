import type { InputAction } from "../actions/input-action";
import type { IInputCommand } from "./input-command";

export class GuardToggle implements IInputCommand {
  readonly inputAction: InputAction = "guardToggle";
}
