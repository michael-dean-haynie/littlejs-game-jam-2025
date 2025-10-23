import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";

@customElement("lit-overlay")
export class LitOverlay extends BaseLitElement {
  @property({ type: Number })
  gridExtent: number = 0;

  render() {
    return html` <div class="text-white">
      <p>lit overlay</p>
      <input
        type="range"
        min="0"
        max="100"
        value=${this.gridExtent}
        @input=${this._onGridExtentInput}
      />
    </div>`;
  }

  private _onGridExtentInput(ev: InputEvent): void {
    this.dispatchEvent(
      new CustomEvent("grid-extent-input", {
        detail: (ev.target as HTMLInputElement).value,
      }),
    );
  }
}
