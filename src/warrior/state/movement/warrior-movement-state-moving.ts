import type { IGameInputCommand } from "../../../input/game-inputs/game-input.types";
import { Move } from "../../../input/game-inputs/move";
import type { Vector2 } from "../../../littlejsengine/littlejsengine.types";
import type { Warrior } from "../../warrior";
import { WarriorMovementStateIdle } from "./warrior-movement-state-idle";
import type { IWarriorMovementState } from "./warrior-movement-state.types";

export class WarriorMovementStateMoving implements IWarriorMovementState {
  private readonly _warrior: Warrior;

  constructor(warrior: Warrior, direction: Vector2) {
    this._warrior = warrior;
    this._warrior.moveDirection = direction;
    this._warrior.switchAnimation(this._warrior.runAnimation);
  }

  processGameInputCommand(command: IGameInputCommand): void {
    if (command instanceof Move) {
      // transition to moving
      if (command.direction.length() === 0) {
        this._warrior.movementState = new WarriorMovementStateIdle(
          this._warrior,
        );
        return;
      }

      this._warrior.moveDirection = command.direction;
    }
  }
}
