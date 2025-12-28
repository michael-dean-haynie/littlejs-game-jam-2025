import { GameStateObject } from "../game/game-state/game-state-object";
import type { Player } from "../players/player";
import type { UnitType } from "./unit-type";

/**
 * An interactive game object. The main focus of game-play.
 * Recieves Commands from a Player.
 * Must belong to a player.
 */
export class Unit extends GameStateObject {
  constructor(
    public readonly player: Player,
    public readonly unitType: UnitType,
  ) {
    super(player.gameState);
  }

  update(): void {}
}
