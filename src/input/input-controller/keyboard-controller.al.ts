import { Subject } from "rxjs";
import { Autoloadable } from "../../core/autoload/autoloadable";
import {
  KEYBOARD_CONTROLLER_TOKEN,
  KeyboardModifiers,
  type ActiveModifiers,
  type KeyboardControllerProfile,
  type KeyboardInputMatcher,
  type KeyboardModifier,
  type KeyboardModifierMatcher,
} from "./keyboard-controller.types";
import type { GameInput } from "../game-input.types";

@Autoloadable({
  serviceIdentifier: KEYBOARD_CONTROLLER_TOKEN,
})
export class KeyboardController {
  private readonly _inputs$ = new Subject<GameInput>();
  public readonly inputs$ = this._inputs$.asObservable();

  private readonly _activeKeys = new Set<string>();
  private _activeModifiers: ActiveModifiers = {};

  private readonly _profile: KeyboardControllerProfile = {
    moveUp: [{ key: "e" }],
    moveDown: [{ key: "d" }],
    moveLeft: [{ key: "s" }],
    moveRight: [{ key: "f" }],
  };

  constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
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

  private _onKeyDown(event: KeyboardEvent): void {
    // michael: document I'm gonna use "key" value because gives use best control over their input
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key

    const key = this._normalizeKey(event.key);
    // michael: remove this for rapid fire?
    if (event.repeat) return;
    this._activeKeys.add(key);
    this._updateActiveModifiers();
    this._process();
  }

  private _onKeyUp(event: KeyboardEvent): void {
    const key = this._normalizeKey(event.key);
    this._activeKeys.delete(key);
    this._updateActiveModifiers();
    this._process();
  }

  private _process(): void {
    let inputs = this._mapKeyboardEventToGameInputs();
    inputs = this._reduceInputs(inputs);
    for (const input of inputs) {
      this._inputs$.next(input);
    }
  }

  private _mapKeyboardEventToGameInputs(): GameInput[] {
    const latestKey = [...this._activeKeys]
      // prevent modifiers from being latest
      .filter((key) => !KeyboardModifiers.includes(key))
      .at(-1);
    if (latestKey === undefined) return [];

    return (
      Object.entries(this._profile) as [GameInput, KeyboardInputMatcher[]][]
    )
      .filter(([, matchers]) => {
        return matchers.some((matcher) => {
          return (
            matcher.key === latestKey &&
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

  private _reduceInputs(inputs: GameInput[]): GameInput[] {
    // michael: pu@ diagonal directions
    return inputs;
  }
}
