import type { Observable } from "rxjs";
import { enumerationFactory } from "../../core/enumeration-factory";
import type { GameInput } from "../game-input.types";

export const KEYBOARD_CONTROLLER_TOKEN = "KEYBOARD_CONTROLLER_TOKEN" as const;

export interface IKeyboardController {
  inputs$: Observable<GameInput>;
}

export type KeyboardControllerProfile = Partial<{
  [index in GameInput]: KeyboardInputMatcher[];
}>;

export type KeyboardInputMatcher = {
  key: string;
} & Partial<{
  [index in KeyboardModifier]: KeyboardModifierMatcher;
}>;

export const KeyboardModifierMatchers = enumerationFactory(
  "required",
  "forbidden",
  "default",
);
export type KeyboardModifierMatcher = ReturnType<
  typeof KeyboardModifierMatchers.values
>[number];

export const KeyboardModifiers = enumerationFactory(
  "ctrl",
  "alt",
  "shift",
  "meta",
);
export type KeyboardModifier = ReturnType<
  typeof KeyboardModifiers.values
>[number];

export type ActiveModifiers = Partial<{
  [index in KeyboardModifier]: true | undefined;
}>;
