import type { Observable } from "rxjs";
import { enumerationFactory } from "../../../core/enumeration-factory";
import type { IGameInputCommand } from "../../game-inputs/game-input.types";
import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";

export const KEYBOARD_CONTROLLER_TOKEN = "KEYBOARD_CONTROLLER_TOKEN" as const;

export interface IKeyboardController {
  inputs$: Observable<IGameInputCommand>;

  /** Most inputs are processed during browser events. This is for input that should happen frame by frame. */
  triggerFrameDrivenInputs(): void;
}

/** These are the inputs for the keyboard that users can map to particular keys via a profile */
export const KeyboardInputs = enumerationFactory(
  "moveLeft",
  "moveRight",
  "moveUp",
  "moveDown",
  "guard",
  "attack",
);
export type KeyboardInput = ReturnType<typeof KeyboardInputs.values>[number];

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
