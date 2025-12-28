import { GameStateObject } from "../game/game-state/game-state-object";
import { MessageHandler } from "../messages/message-handler";
import { Unit } from "../units/unit";
import type { CreateUnitMessage } from "./inputs/create-unit-message";
import type { PlayerInputMessage } from "./inputs/player-input-message";

/**
 * A high level agent (human or otherwise) interacting with the game.
 */
export class Player extends GameStateObject {
  readonly units = new Map<number, Unit>();

  private readonly _messageHandler = new MessageHandler<
    PlayerInputMessage,
    object
  >()
    .contextualize({})
    .on("createUnit", this._onCreateUnit.bind(this));

  update(): void {
    this._processMessages();
    for (const unit of this.units.values()) {
      unit.update();
    }
  }

  private readonly _messageBuffer: PlayerInputMessage[] = [];
  enqueueMessage(message: PlayerInputMessage): void {
    this._messageBuffer.push(message);
  }

  private _processMessages(): void {
    while (this._messageBuffer.length > 0) {
      const message = this._messageBuffer.shift()!;
      this._messageHandler.handle(message);
    }
  }

  private _onCreateUnit(msg: CreateUnitMessage): void {
    const unit = new Unit(this, msg.unitType);
    this.units.set(unit.id, unit);
  }
}
