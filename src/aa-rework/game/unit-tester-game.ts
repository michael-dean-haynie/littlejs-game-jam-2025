import { LitUnitTesterSelector } from "../ui/lit/components";
import { Game } from "./game";

export class UnitTesterGame extends Game {
  public readonly gameMode = "unitTester" as const;

  private readonly _humanPlayer = this.gameState.createPlayer();
  private readonly _unitSelector = new LitUnitTesterSelector(this._humanPlayer);

  override end(): void {
    this._unitSelector.remove();
  }
}
