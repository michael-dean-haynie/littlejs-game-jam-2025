import { tap } from "rxjs";
import type { UnitObject } from "../units/unit-object";
import { world } from "../world/world";
import { vec2 } from "littlejsengine";
import { inputManager } from "../input/input-manager/input-manager";
import { Warrior } from "../units/warrior";
import type { IInputCommand } from "../input/commands/input-command";
import { Move } from "../input/commands/move";
import { FaceDirection } from "../input/commands/face-direction";
import { createUnitMoveMessage } from "../units/unit-messages.types";
import { FacePosition } from "../input/commands/face-position";
import { GuardToggle } from "../input/commands/guard-toggle";
import { Attack } from "../input/commands/attack";

export class Player {
  unit: UnitObject | null = null;

  constructor() {
    inputManager.commands$
      .pipe(
        // no takeUntil because expected singleton
        tap((command) => this._processInputCommand(command)),
      )
      .subscribe();
  }

  // michael: improve: organization, consider many commands and many units possible
  private _processInputCommand(command: IInputCommand): void {
    if (command instanceof Move) {
      this.unit?.enqueueMessage(createUnitMoveMessage(command.direction));
    }
    if (command instanceof FaceDirection) {
      this.unit?.enqueueMessage({
        id: "unit.faceDirection",
        direction: command.direction,
      });
    }
    if (command instanceof FacePosition) {
      this.unit?.enqueueMessage({
        id: "unit.facePosition",
        position: command.position,
      });
    }
    if (command instanceof GuardToggle) {
      this.unit?.enqueueMessage({
        id: "unit.toggleCast",
        ability: "guard",
      });
    }
    if (command instanceof Attack) {
      this.unit?.enqueueMessage({
        id: "unit.cast",
        ability: "attack",
      });
    }
  }

  spawnUnit(): void {
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
