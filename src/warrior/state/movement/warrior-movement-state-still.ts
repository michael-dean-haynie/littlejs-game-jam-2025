import { vec2 } from "../../../littlejsengine/littlejsengine.pure";
import { WarriorCommandMove } from "../../commands/warrior-command-move";
import type { IWarriorCommand } from "../../commands/warrior-commands.types";
import type { Warrior } from "../../warrior";
import { WarriorMovementStateMoving } from "./warrior-movement-state-moving";
import type { IWarriorMovementState } from "./warrior-movement-state.types";

export class WarriorMovementStateStill implements IWarriorMovementState {
  private readonly _warrior: Warrior;

  constructor(warrior: Warrior) {
    this._warrior = warrior;
    this._warrior.moveDirection = vec2(0);
    this._warrior.switchAnimation(this._warrior.idleAnimation);
  }

  processCommand(command: IWarriorCommand): void {
    if (command instanceof WarriorCommandMove) {
      if (command.direction.length() !== 0) {
        this._warrior.movementState = new WarriorMovementStateMoving(
          this._warrior,
          command.direction,
        );
      }
    }
  }
}
