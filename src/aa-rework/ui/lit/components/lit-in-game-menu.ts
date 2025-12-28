import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import { html } from "lit";

@customElement("lit-in-game-menu")
export class LitInGameMenu extends BaseLitElement {
  render() {
    return html`
      <ul>
        <li>
          <button @click=${this._dispatchExitGameMode}>End Game</button>
        </li>
      </ul>
    `;
  }

  private _dispatchExitGameMode(): void {
    this.dispatchEvent(
      new CustomEvent("exitGameMode", {
        bubbles: true,
      }),
    );
  }
}
