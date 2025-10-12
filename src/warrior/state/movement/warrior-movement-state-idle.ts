import type { IGameInputCommand } from "../../../input/game-inputs/game-input.types";
import { Move } from "../../../input/game-inputs/move";
import { vec2 } from "../../../littlejsengine/littlejsengine.pure";
import type { Warrior } from "../../warrior";
import { WarriorMovementStateMoving } from "./warrior-movement-state-moving";
import type { IWarriorMovementState } from "./warrior-movement-state.types";

export class WarriorMovementStateIdle implements IWarriorMovementState {
  private readonly _warrior: Warrior;

  constructor(warrior: Warrior) {
    this._warrior = warrior;
    this._warrior.moveDirection = vec2(0);
    this._warrior.switchAnimation(this._warrior.idleAnimation);
  }

  processGameInputCommand(command: IGameInputCommand): void {
    if (command instanceof Move) {
      if (command.direction.length() !== 0) {
        this._warrior.movementState = new WarriorMovementStateMoving(
          this._warrior,
          command.direction,
        );
      }
    }
  }
}
