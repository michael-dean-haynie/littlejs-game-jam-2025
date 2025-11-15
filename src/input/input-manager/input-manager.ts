import { keyboardController } from "../input-controller/keyboard/keyboard-controller";
import { Subject, tap } from "rxjs";
import type { IGameInputCommand } from "../game-inputs/game-input.types";

export class InputManager {
  private readonly _commands$ = new Subject<IGameInputCommand>();
  public readonly commands$ = this._commands$.asObservable();

  constructor() {
    keyboardController.inputs$
      // no takeUntil because singleton
      .pipe(tap((gameInput) => this._commands$.next(gameInput)))
      .subscribe();
  }

  triggerFrameDrivenInputs(): void {
    keyboardController.triggerFrameDrivenInputs();
  }
}

export const inputManager = new InputManager();
