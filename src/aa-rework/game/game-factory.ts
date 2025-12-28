import { noCap } from "../../core/util/no-cap";
import type { Game } from "./game";
import type { GameMode } from "./game-mode";
import { UnitTesterGame } from "./unit-tester-game";

export function gameFactory(gameMode: GameMode): Game {
  switch (gameMode) {
    case "unitTester":
      return new UnitTesterGame();
    default:
      noCap(false, `Factory missing implemention for game mode: ${gameMode}`);
  }
}
