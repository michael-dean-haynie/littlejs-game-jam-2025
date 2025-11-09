import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { PLAYER_TOKEN, type IPlayer } from "./player.types";
import {
  INPUT_MANAGER_TOKEN,
  type IInputManager,
} from "../input/input-manager/input-manager.types";
import { tap } from "rxjs";
import type { IGameInputCommand } from "../input/game-inputs/game-input.types";
import { Move } from "../input/game-inputs/move";
import { createUnitMoveMessage } from "../units/unit-messages.types";
import { FaceDirection } from "../input/game-inputs/face-direction";
import { FacePosition } from "../input/game-inputs/face-position";
import { GuardToggle } from "../input/game-inputs/guard-toggle";
import { Attack } from "../input/game-inputs/attack";
import type { UnitObject } from "../units/unit-object";
import { Lancer } from "../units/lancer/lancer";
import { world } from "../world/world.al";
import { vec2 } from "littlejsengine";

@Autoloadable({
  serviceIdentifier: PLAYER_TOKEN,
})
export class Player implements IPlayer {
  private readonly _inputManager: IInputManager;

  unit: UnitObject | null = null;

  constructor(@inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager) {
    this._inputManager = inputManager;

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
      this.unit?.enqueueMessage(createUnitMoveMessage(giCommand.direction));
    }
    if (giCommand instanceof FaceDirection) {
      this.unit?.enqueueMessage({
        id: "unit.faceDirection",
        direction: giCommand.direction,
      });
    }
    if (giCommand instanceof FacePosition) {
      this.unit?.enqueueMessage({
        id: "unit.facePosition",
        position: giCommand.position,
      });
    }
    if (giCommand instanceof GuardToggle) {
      this.unit?.enqueueMessage({
        id: "unit.toggleCast",
        ability: "guard",
      });
    }
    if (giCommand instanceof Attack) {
      this.unit?.enqueueMessage({
        id: "unit.cast",
        ability: "attack",
      });
    }
  }

  spawnUnit(): void {
    // for (let i = 0; i < 100; i++) {
    this.unit = new Lancer(vec2(0));
    // }

    world.unit = this.unit;
    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).unit = this.unit;
  }
}
