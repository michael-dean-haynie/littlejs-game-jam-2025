import { IntIdGenerator } from "../../../core/generators/int-id-generator";
import { Player } from "../../players/player";

export class GameState {
  private readonly _intIdGenerator = new IntIdGenerator();
  /** Deterministic unique int id for anything needing one inside gamestate data tree */
  nextId(): number {
    return this._intIdGenerator.nextId();
  }

  players = new Map<number, Player>();
  createPlayer(): Player {
    const player = new Player(this);
    this.players.set(player.id, player);
    return player;
  }

  /** for now, kinda like the littlejs engine object update() */
  update(): void {
    for (const player of this.players.values()) {
      player.update();
    }
  }
}
