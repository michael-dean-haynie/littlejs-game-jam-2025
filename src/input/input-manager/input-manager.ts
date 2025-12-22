import { Subject, tap } from "rxjs";
import { keyboardController } from "../controllers/keyboard-mouse/keyboard-controller";
import type { IInputCommand } from "../commands/input-command";

export class InputManager {
  private readonly _commands$ = new Subject<IInputCommand>();
  public readonly commands$ = this._commands$.asObservable();

  constructor() {
    keyboardController.commands$
      // no takeUntil because singleton
      .pipe(tap((cmd) => this._commands$.next(cmd)))
      .subscribe();
  }

  update(): void {
    keyboardController.update();
  }
}

export const inputManager = new InputManager();
