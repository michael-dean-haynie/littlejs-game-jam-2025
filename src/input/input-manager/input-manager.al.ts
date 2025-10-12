import { Autoloadable } from "../../core/autoload/autoloadable";
import { inject } from "inversify";
import {
  KEYBOARD_CONTROLLER_TOKEN,
  type IKeyboardController,
} from "../input-controller/keyboard/keyboard-controller.types";
import type { KeyboardController } from "../input-controller/keyboard/keyboard-controller.al";
import { Subject, tap } from "rxjs";
import { INPUT_MANAGER_TOKEN, type IInputManager } from "./input-manager.types";
import type { IGameInputCommand } from "../game-inputs/game-input.types";

@Autoloadable({
  serviceIdentifier: INPUT_MANAGER_TOKEN,
})
export class InputManager implements IInputManager {
  private readonly _keyboardController: IKeyboardController;

  private readonly _commands$ = new Subject<IGameInputCommand>();
  public readonly commands$ = this._commands$.asObservable();

  constructor(
    @inject(KEYBOARD_CONTROLLER_TOKEN) keyboardController: KeyboardController,
  ) {
    this._keyboardController = keyboardController;

    this._keyboardController.inputs$
      .pipe(
        // michael: consider takeUntil with destroy ref
        tap((gameInput) => this._commands$.next(gameInput)),
      )
      .subscribe();
  }

  triggerFrameDrivenInputs(): void {
    this._keyboardController.triggerFrameDrivenInputs();
  }
}
