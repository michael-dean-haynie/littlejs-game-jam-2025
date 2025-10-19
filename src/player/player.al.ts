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
} from "../units/warrior/factory/warrior-factory.types";
import type { IGameInputCommand } from "../input/game-inputs/game-input.types";
import { Move } from "../input/game-inputs/move";
import { createUnitMoveMessage } from "../units/unit-messages.types";
import { FaceDirection } from "../input/game-inputs/face-direction";
import { FacePosition } from "../input/game-inputs/face-position";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { IUnit } from "../units/unit.types";
import {
  LANCER_FACTORY_TOKEN,
  type ILancerFactory,
} from "../units/lancer/factory/lancer-factory.types";

@Autoloadable({
  serviceIdentifier: PLAYER_TOKEN,
})
export class Player implements IPlayer {
  private readonly _inputManager: IInputManager;
  private readonly _warriorFactory: IWarriorFactory;
  private readonly _lancerFactory: ILancerFactory;

  private _unit: IUnit | null = null;

  constructor(
    @inject(INPUT_MANAGER_TOKEN) inputManager: IInputManager,
    @inject(WARRIOR_FACTORY_TOKEN) warriorFactory: IWarriorFactory,
    @inject(LANCER_FACTORY_TOKEN) lancerFactory: ILancerFactory,
  ) {
    this._inputManager = inputManager;
    this._warriorFactory = warriorFactory;
    this._lancerFactory = lancerFactory;

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
  }

  spawnUnit(): void {
    this._unit = this._lancerFactory.createLancer(vec2(0));
    this._unit.destroy();

    this._unit = this._warriorFactory.createWarrior(vec2(0));
  }
}
