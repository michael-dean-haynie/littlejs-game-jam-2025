import { Subject } from "rxjs";
import { Autoloadable } from "../../core/autoload/autoloadable";
import {
  KEYBOARD_CONTROLLER_TOKEN,
  KeyboardModifiers,
  type ActiveModifiers,
  type KeyboardProfile,
  type KeyboardInputMatcher,
  type KeyboardModifier,
  type KeyboardModifierMatcher,
  type IKeyboardController,
  type KeyupOrKeydown,
  type KeyboardInput,
  MovementKeyboardInputs,
  MovementKeyboardInputVectors,
} from "./keyboard-controller.types";
import type { IGameInputCommand } from "../game-inputs/game-input.types";
import { Move } from "../game-inputs/move";
import { vec2 } from "../../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../../littlejsengine/littlejsengine.types";

@Autoloadable({
  serviceIdentifier: KEYBOARD_CONTROLLER_TOKEN,
})
export class KeyboardController implements IKeyboardController {
  private readonly _inputs$ = new Subject<IGameInputCommand>();
  public readonly inputs$ = this._inputs$.asObservable();

  private readonly _activeKeys = new Set<string>();
  private _activeModifiers: ActiveModifiers = {};

  private readonly _profile: KeyboardProfile = {
    moveUp: [{ key: "e" }],
    moveDown: [{ key: "d" }],
    moveLeft: [{ key: "s" }],
    moveRight: [{ key: "f" }],
  };

  constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
  }

  // michael - maybe remove
  get latestActiveKey(): string | undefined {
    return (
      [...this._activeKeys]
        // prevent modifiers from being latest
        .filter((key) => !KeyboardModifiers.includes(key))
        .at(-1)
    );
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

  // michael: document I'm gonna use "key" value because gives the user the best control over their input
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  private _onKeyDown(event: KeyboardEvent): void {
    const key = this._normalizeKey(event.key);
    // michael: remove this for rapid fire?
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

  // michael: remove once I use the param
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _process(key: string, _upOrDown: KeyupOrKeydown): void {
    const inputMatches = this._matchKeyToInputs(key);
    if (inputMatches.some((im) => MovementKeyboardInputs.includes(im))) {
      this._inputs$.next(this._getGameInputCommandForMovement());
    }

    // michael: process non-movement inputs
  }

  private _getGameInputCommandForMovement(): IGameInputCommand {
    const activeMovementInputs = [...this._activeKeys]
      .map((key) => {
        return this._matchKeyToInputs(key).find((input) =>
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

  private _matchKeyToInputs(key: string): KeyboardInput[] {
    return (
      Object.entries(this._profile) as [KeyboardInput, KeyboardInputMatcher[]][]
    )
      .filter(([, matchers]) => {
        return matchers.some((matcher) => {
          return (
            matcher.key === key &&
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

  // michael: remember if shift+a starts ability letting go of shift and then letting go of a should deactivate it (for HOLD setting)
}
