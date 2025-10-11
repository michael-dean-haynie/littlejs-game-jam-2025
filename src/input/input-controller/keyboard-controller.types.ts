import type { Observable } from "rxjs";
import { enumerationFactory } from "../../core/enumeration-factory";
import type { IGameInputCommand } from "../game-inputs/game-input.types";

export const KEYBOARD_CONTROLLER_TOKEN = "KEYBOARD_CONTROLLER_TOKEN" as const;

export interface IKeyboardController {
  inputs$: Observable<IGameInputCommand>;
}

/** These are the inputs for the keyboard that users can map to particular keys via a profile */
export const KeyboardInputs = enumerationFactory(
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
  "stopMoving",
  "moveLeftUp",
  "moveLeftDown",
  "moveRightUp",
  "moveRightDown",
);
export type KeyboardInput = ReturnType<typeof KeyboardInputs.values>[number];

export type KeyboardProfile = Partial<{
  [index in KeyboardInput]: KeyboardInputMatcher[];
}>;

export type HoldOrToggle = "hold" | "toggle";
export type KeyupOrKeydown = "keyup" | "keydown";

export type KeyboardInputMatcher = {
  key: string;
  holdOrToggle?: HoldOrToggle | undefined;
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
