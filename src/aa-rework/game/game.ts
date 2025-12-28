import type { GameMode } from "./game-mode";
import { GameState } from "./game-state/game-state";

export abstract class Game {
  public abstract readonly gameMode: GameMode;
  public readonly gameState = new GameState();

  end(): void {}
}
