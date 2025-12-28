import type { GameState } from "./game-state";

export abstract class GameStateObject {
  public readonly id: number;

  constructor(public readonly gameState: GameState) {
    this.id = this.gameState.nextId();
  }
}
