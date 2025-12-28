import { Subject } from "rxjs";
import type { IInputCommand } from "../commands/input-command";
import { keyboardController } from "../hardware/keyboard-mouse/keyboard-controller";

export class InputManager {
  private readonly _commands$ = new Subject<IInputCommand>();
  public readonly commands$ = this._commands$.asObservable();

  constructor() {
    // keyboardController.commands$
    //   // no takeUntil because singleton
    //   .pipe(tap((cmd) => this._commands$.next(cmd)))
    //   .subscribe();
  }

  update(): void {
    keyboardController.update();
  }
}

export const inputManager = new InputManager();
