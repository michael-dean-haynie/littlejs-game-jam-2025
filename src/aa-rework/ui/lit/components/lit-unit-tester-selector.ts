import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import { noCap } from "../../../../core/util/no-cap";
import { html } from "lit";
import type { Player } from "../../../players/player";
import { CreateUnitMessage } from "../../../players/inputs/create-unit-message";

@customElement("lit-unit-tester-selector")
export class LitUnitTesterSelector extends BaseLitElement {
  constructor(private readonly _player: Player) {
    super();
    const litUi = document.querySelector("lit-ui");
    noCap.notNull(litUi);
    litUi.insertAdjacentElement("beforeend", this);
  }

  render() {
    return html`
      <ul>
        <li>
          <button @click=${this._createUnit}>Create Unit</button>
        </li>
      </ul>
    `;
  }

  private _createUnit(): void {
    this._player.enqueueMessage(new CreateUnitMessage("warrior"));
  }
}
