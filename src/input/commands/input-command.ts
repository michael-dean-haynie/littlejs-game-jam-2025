import type { InputAction } from "../actions/input-action";

/** These are command objects for particular input actions. Can include parameters. */
export interface IInputCommand {
  inputAction: InputAction;
}
