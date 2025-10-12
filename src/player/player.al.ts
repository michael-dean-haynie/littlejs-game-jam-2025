import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { PLAYER_TOKEN, type IPlayer } from "./player.types";
import {
  INPUT_MANAGER_TOKEN,
  type IInputManager,
} from "../input/input-manager/input-manager.types";
import { tap } from "rxjs";
import {
  WARRIOR_FACTORY_TOKEN,
  type IWarriorFactory,
} from "../warrior/warrior-factory.types";
import type { Warrior } from "../warrior/warrior";
import { Move } from "../input/game-inputs/move";
import { WarriorCommandMove } from "../warrior/commands/warrior-command-move";
import type { IGameInputCommand } from "../input/game-inputs/game-input.types";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import { FaceDirection } from "../input/game-inputs/face-direction";
import { WarriorCommandFaceDirection } from "../warrior/commands/warrior-command-face-direction";
import { FacePosition } from "../input/game-inputs/face-position";
import { WarriorCommandFacePosition } from "../warrior/commands/warrior-command-face-position";

@Autoloadable({
  serviceIdentifier: PLAYER_TOKEN,
})
export class Player implements IPlayer {
  private readonly _inputManager: IInputManager;
  private readonly _warriorFactory: IWarriorFactory;

  private _warrior: Warrior | null = null;

  constructor(
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(WARRIOR_FACTORY_TOKEN) warriorFactory: IWarriorFactory,
  ) {
    this._inputManager = inputManager;
    this._warriorFactory = warriorFactory;

    this._inputManager.commands$
      .pipe(
        // michael: consider takeUntil with destroyref
        tap((command) => this._processGameInputCommand(command)),
      )
      .subscribe();
  }

  // michael: improve organization, consider many commands and many units possible
  private _processGameInputCommand(giCommand: IGameInputCommand): void {
    if (giCommand instanceof Move) {
      this._warrior?.enqueueCommand(
        new WarriorCommandMove(giCommand.direction),
      );
    }
    if (giCommand instanceof FaceDirection) {
      this._warrior?.enqueueCommand(
        new WarriorCommandFaceDirection(giCommand.direction),
      );
    }
    if (giCommand instanceof FacePosition) {
      this._warrior?.enqueueCommand(
        new WarriorCommandFacePosition(giCommand.position),
      );
    }
  }

  spawnUnit(): void {
    this._warrior = this._warriorFactory.createWarrior(vec2(0));
  }
}
