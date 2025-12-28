import type { KeyboardInputMatcher } from "../keyboard-controller.types";
import type { KeyboardInput } from "../keyboard-input";

export type KeyboardProfile = Partial<{
  [index in KeyboardInput]: KeyboardInputMatcher[];
}>;
