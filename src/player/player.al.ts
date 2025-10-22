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
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { IUnit } from "../units/unit.types";
import {
  UNIT_FACTORY_TOKEN,
  type IUnitFactory,
} from "../units/factory/unit-factory.types";
import { GuardToggle } from "../input/game-inputs/guard-toggle";
import { Attack } from "../input/game-inputs/attack";

@Autoloadable({
  serviceIdentifier: PLAYER_TOKEN,
})
export class Player implements IPlayer {
  private readonly _inputManager: IInputManager;
  private readonly _unitFactory: IUnitFactory;

  private _unit: IUnit | null = null;

  constructor(
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(UNIT_FACTORY_TOKEN) unitFactory: IUnitFactory,
  ) {
    this._inputManager = inputManager;
    this._unitFactory = unitFactory;

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
      this._unit?.enqueueMessage(createUnitMoveMessage(giCommand.direction));
    }
    if (giCommand instanceof FaceDirection) {
      this._unit?.enqueueMessage({
        id: "unit.faceDirection",
        direction: giCommand.direction,
      });
    }
    if (giCommand instanceof FacePosition) {
      this._unit?.enqueueMessage({
        id: "unit.facePosition",
        position: giCommand.position,
      });
    }
    if (giCommand instanceof GuardToggle) {
      this._unit?.enqueueMessage({
        id: "unit.toggleCast",
        ability: "guard",
      });
    }
    if (giCommand instanceof Attack) {
      this._unit?.enqueueMessage({
        id: "unit.cast",
        ability: "attack",
      });
    }
  }

  spawnUnit(): void {
    this._unit = this._unitFactory.createUnit("spider", vec2(0));

    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).unit = this._unit;
  }
}
