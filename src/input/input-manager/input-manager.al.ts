import { Autoloadable } from "../../core/autoload/autoloadable";
import { inject } from "inversify";
import { KEYBOARD_CONTROLLER_TOKEN } from "../input-controller/keyboard-controller.types";
import type { KeyboardController } from "../input-controller/keyboard-controller.al";
import { tap } from "rxjs";
import { INPUT_MANAGER_TOKEN, type IInputManager } from "./input-manager.types";
import type { IGameInputCommand } from "../game-inputs/game-input.types";

@Autoloadable({
  serviceIdentifier: INPUT_MANAGER_TOKEN,
})
export class InputManager implements IInputManager {
  private readonly _keyboardController: KeyboardController;

  private _buffer: IGameInputCommand[] = [];
  get buffer(): ReadonlyArray<IGameInputCommand> {
    return this._buffer;
  }

  constructor(
    @inject(KEYBOARD_CONTROLLER_TOKEN) keyboardController: KeyboardController,
  ) {
    this._keyboardController = keyboardController;

    this._keyboardController.inputs$
      .pipe(
        // michael: consider takeUntil with destroy ref
        // michael: remove
        tap((gameInput) => this._buffer.push(gameInput)),
      )
      .subscribe();
  }

  clearBuffer(): void {
    this._buffer = [];
  }
}
