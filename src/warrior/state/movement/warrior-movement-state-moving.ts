import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import { WarriorCommandMove } from "../../commands/warrior-command-move";
import type { IWarriorCommand } from "../../commands/warrior-commands.types";
import type { Warrior } from "../../warrior";
import { WarriorMovementStateStill } from "./warrior-movement-state-still";
import type { IWarriorMovementState } from "./warrior-movement-state.types";

export class WarriorMovementStateMoving implements IWarriorMovementState {
  private readonly _warrior: Warrior;

  constructor(warrior: Warrior, direction: Vector2) {
    this._warrior = warrior;
    this._warrior.moveDirection = direction;
    this._warrior.switchAnimation(this._warrior.runAnimation);
  }

  processCommand(command: IWarriorCommand): void {
    if (command instanceof WarriorCommandMove) {
      // transition to moving
      if (command.direction.length() === 0) {
        this._warrior.movementState = new WarriorMovementStateStill(
          this._warrior,
        );
        return;
      }

      this._warrior.moveDirection = command.direction;
    }
  }
}
