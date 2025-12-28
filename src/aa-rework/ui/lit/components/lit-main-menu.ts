import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import { html } from "lit";
import { map } from "lit/directives/map.js";
import { GameModes, type GameMode } from "../../../game/game-mode";

export type GameModeDetail = {
  gameMode: GameMode;
};

@customElement("lit-main-menu")
export class LitMainMenu extends BaseLitElement {
  render() {
    return html`
      <ul>
        ${map(
          GameModes,
          (gameMode) =>
            html`<li>
              <button @click=${() => this._dispatchPlayGameMode(gameMode)}>
                ${gameMode}
              </button>
            </li>`,
        )}
      </ul>
    `;
  }

  private _dispatchPlayGameMode(gameMode: GameMode): void {
    this.dispatchEvent(
      new CustomEvent<GameModeDetail>("playGameMode", {
        bubbles: true,
        detail: {
          gameMode,
        },
      }),
    );
  }
}
