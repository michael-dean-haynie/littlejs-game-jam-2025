import { mock } from "vitest-mock-extended";
import { Autoloadable } from "../../../core/autoload/autoloadable";
import {
  KEYBOARD_CONTROLLER_TOKEN,
  type IKeyboardController,
} from "./keyboard-controller.types";

@Autoloadable({
  serviceIdentifier: KEYBOARD_CONTROLLER_TOKEN,
  executionContext: "test",
})
export class KeyboardControllerMock {
  // michael: figure out how to autload non-classes so I can make this officially implement the interface
  constructor() {
    return mock<IKeyboardController>();
  }
}
