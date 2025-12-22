import { enumerationFactory } from "../../../core/enumeration-factory";
import { vec2, Vector2 } from "littlejsengine";
import type { KeyboardInput } from "./keyboard-input";

const _tempMovementKeyboardInputs = [
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
] as const satisfies KeyboardInput[];

/** A sub-set of the KeyboardInputs specifically for movement */
export const MovementKeyboardInputs = enumerationFactory(
  ..._tempMovementKeyboardInputs,
);
export type MovementKeyboardInput = ReturnType<
  typeof MovementKeyboardInputs.values
>[number];

export const MovementKeyboardInputVectors = {
  moveLeft: vec2(-1, 0),
  moveRight: vec2(1, 0),
  moveUp: vec2(0, 1),
  moveDown: vec2(0, -1),
} as const satisfies Record<MovementKeyboardInput, Vector2>;

export type HoldOrToggle = "hold" | "toggle";
export type KeyupOrKeydown = "keyup" | "keydown";

export type KeyboardInputMatcher = {
  key: string;
  holdOrToggle?: HoldOrToggle | undefined;
} & Partial<{
  [index in KeyboardModifier]: KeyboardModifierMatcher;
}>;

export const keyboardModifierMatchers = [
  "required",
  "forbidden",
  "default",
] as const;
export type KeyboardModifierMatcher = (typeof keyboardModifierMatchers)[number];

export const keyboardModifiers = ["ctrl", "alt", "shift", "meta"] as const;
export type KeyboardModifier = (typeof keyboardModifiers)[number];

export type ActiveModifiers = Partial<{
  [index in KeyboardModifier]: true | undefined;
}>;
