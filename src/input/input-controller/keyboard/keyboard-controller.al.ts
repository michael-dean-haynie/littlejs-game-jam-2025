import { Subject } from "rxjs";
import {
  KeyboardModifiers,
  type ActiveModifiers,
  type KeyboardProfile,
  type KeyboardInputMatcher,
  type KeyboardModifier,
  type KeyboardModifierMatcher,
  type KeyupOrKeydown,
  type KeyboardInput,
  MovementKeyboardInputs,
  MovementKeyboardInputVectors,
} from "./keyboard-controller.types";
import type { IGameInputCommand } from "../../game-inputs/game-input.types";
import { Move } from "../../game-inputs/move";
import { FaceDirection } from "../../game-inputs/face-direction";
import { FacePosition } from "../../game-inputs/face-position";
import { GuardToggle } from "../../game-inputs/guard-toggle";
import { Attack } from "../../game-inputs/attack";
import { keyboardProfileKenisis } from "./profiles/keyboard-profile-kenisis";
import { mousePos, vec2, Vector2 } from "littlejsengine";

export class KeyboardController {
  private readonly _inputs$ = new Subject<IGameInputCommand>();
  public readonly inputs$ = this._inputs$.asObservable();

  private readonly _activeKeys = new Set<string>();
  private _activeModifiers: ActiveModifiers = {};

  // michael: document: decision about character facing mouse limitation for laptop touchpad
  // also find some way to incorporate it into the profile
  // maybe if gameplay ends up requiring cursor, maybe no need.
  // private readonly _profile: KeyboardProfile = keyboardProfileLaptop;
  // private readonly _useCursor = false;

  private readonly _profile: KeyboardProfile = keyboardProfileKenisis;
  private readonly _useCursor = true;

  constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
    document.addEventListener("mousedown", this._onMouseDown.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));
  }

  triggerFrameDrivenInputs(): void {
    if (!this._useCursor) {
      return;
    }
    this._inputs$.next(new FacePosition(mousePos));
  }

  private _normalizeKey(key: string): string {
    let result = key.toLowerCase();
    if (result === "control") {
      result = "ctrl";
    }
    return result;
  }

  private _updateActiveModifiers(): void {
    this._activeModifiers = {
      ctrl: this._activeKeys.has("ctrl") || undefined,
      shift: this._activeKeys.has("shift") || undefined,
      alt: this._activeKeys.has("alt") || undefined,
      meta: this._activeKeys.has("meta") || undefined,
    };
  }

  // michael: document: I'm gonna use "key" value because gives the user the best control over their input
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  private _onKeyDown(event: KeyboardEvent): void {
    const key = this._normalizeKey(event.key);
    // michael: rapid fire might require removing this
    if (event.repeat) return;
    this._activeKeys.add(key);
    this._updateActiveModifiers();
    this._process(key, "keydown");
  }

  private _onKeyUp(event: KeyboardEvent): void {
    const key = this._normalizeKey(event.key);
    this._activeKeys.delete(key);
    this._updateActiveModifiers();
    this._process(key, "keyup");
  }

  // michael: document: how mouse buttons are treated same as keyboard keys after this point
  private _onMouseDown(event: MouseEvent): void {
    const key = `mouse${event.button}`;
    this._activeKeys.add(key);
    this._process(key, "keydown");
  }

  private _onMouseUp(event: MouseEvent): void {
    const key = `mouse${event.button}`;
    this._activeKeys.add(key);
    this._process(key, "keyup");
  }

  private _process(key: string, upOrDown: KeyupOrKeydown): void {
    const inputMatches = this._matchKeyToInputs(key, upOrDown);

    // process movement inputs
    if (inputMatches.some((im) => MovementKeyboardInputs.includes(im))) {
      const moveCommand = this._getMoveCommand();
      if (!this._useCursor && moveCommand.direction.length() > 0) {
        const faceCommand = new FaceDirection(moveCommand.direction);
        this._inputs$.next(faceCommand);
      }
      this._inputs$.next(moveCommand);
    }

    // process non-movement inputs
    if (inputMatches.includes("guard")) {
      this._inputs$.next(new GuardToggle());
    }
    if (inputMatches.includes("attack")) {
      this._inputs$.next(new Attack());
    }
  }

  private _getMoveCommand(): Move {
    const activeMovementInputs = [...this._activeKeys]
      .map((key) => {
        return this._matchKeyToInputs(key, "keydown").find((input) =>
          MovementKeyboardInputs.includes(input),
        );
      })
      .filter((input) => input !== undefined);

    const reducedMovementVec: Vector2 = activeMovementInputs.reduce(
      (acc, cur) => {
        const curVec = MovementKeyboardInputVectors[cur];

        // replace x/y with more recent inputs.
        // simply summing would make left + right = 0 instead of favoring the most recent
        return vec2(
          curVec.x !== 0 ? curVec.x : acc.x,
          curVec.y !== 0 ? curVec.y : acc.y,
        );
      },
      vec2(0, 0),
    );

    return new Move(reducedMovementVec);
  }

  private _matchKeyToInputs(
    key: string,
    upOrDown: KeyupOrKeydown,
  ): KeyboardInput[] {
    return (
      Object.entries(this._profile) as [KeyboardInput, KeyboardInputMatcher[]][]
    )
      .filter(([, matchers]) => {
        return matchers.some((matcher) => {
          return (
            // key matches
            matcher.key === key &&
            // hold/toggle matches
            (matcher.holdOrToggle === "hold" ? true : upOrDown === "keydown") &&
            // modifiers match
            KeyboardModifiers.values().every((mod) =>
              this._modifierMatches(mod, matcher[mod]),
            )
          );
        });
      })
      .map(([key]) => key);
  }

  private _modifierMatches(
    modifier: KeyboardModifier,
    matcher?: KeyboardModifierMatcher,
  ): boolean {
    switch (matcher) {
      case undefined:
      case "default":
        return true;
      case "required":
        return this._activeModifiers[modifier] === true;
      case "forbidden":
        return this._activeModifiers[modifier] === undefined;
    }
  }

  // michael: improve: remember if shift+a starts ability letting go of shift and then letting go of a should deactivate it (for HOLD setting)
}

export const keyboardController = new KeyboardController();
