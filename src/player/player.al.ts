import { tap } from "rxjs";
import type { IGameInputCommand } from "../input/game-inputs/game-input.types";
import { Move } from "../input/game-inputs/move";
import { createUnitMoveMessage } from "../units/unit-messages.types";
import { FaceDirection } from "../input/game-inputs/face-direction";
import { FacePosition } from "../input/game-inputs/face-position";
import { GuardToggle } from "../input/game-inputs/guard-toggle";
import { Attack } from "../input/game-inputs/attack";
import type { UnitObject } from "../units/unit-object";
import { world } from "../world/world.al";
import { vec2 } from "littlejsengine";
import { inputManager } from "../input/input-manager/input-manager.al";
import { Lancer } from "../units/lancer";
import { Warrior } from "../units/warrior";
import { Spider } from "../units/spider";
import { Skull } from "../units/skull";

export class Player {
  unit: UnitObject | null = null;

  constructor() {
    inputManager.commands$
      .pipe(
        // no takeUntil because expected singleton
        tap((command) => this._processGameInputCommand(command)),
      )
      .subscribe();
  }

  // michael: improve: organization, consider many commands and many units possible
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
    // this.unit = new Skull(vec2(2, 0));
    // this.unit = new Lancer(vec2(0, 0));
    // this.unit = new Spider(vec2(1, 0));
    this.unit = new Warrior(vec2(-1, 0));

    world.unit = this.unit;
    // michael: debug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).unit = this.unit;
  }
}

export const player = new Player();
