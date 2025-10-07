import { mock } from "vitest-mock-extended";
import { Autoloadable } from "../core/autoload/autoloadable";
import { INPUT_MANAGER_TOKEN, type IInputManager } from "./input-manager.types";

@Autoloadable({
  serviceIdentifier: INPUT_MANAGER_TOKEN,
  executionContext: "test",
})
export class InputManagerMock {
  // michael: figure out how to autload non-classes so I can make this officially implement the interface
  constructor() {
    return mock<IInputManager>();
  }
}
