import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import type { TerrainConfig } from "../../terrain/terrain-thing.types";
import { BehaviorSubject, type Observable } from "rxjs";
import { noCap } from "../../core/util/no-cap";

@customElement("lit-overlay")
export class LitOverlay extends BaseLitElement {
  private readonly _terrainConfig$: BehaviorSubject<TerrainConfig>;
  public readonly terrainConfig$: Observable<TerrainConfig>;

  private get _tc(): TerrainConfig {
    return this._terrainConfig$.value;
  }

  constructor(terrainConfig: TerrainConfig) {
    super();
    this._terrainConfig$ = new BehaviorSubject(terrainConfig);
    this.terrainConfig$ = this._terrainConfig$.asObservable();
  }

  render() {
    return html` <div class="text-white z-10 absolute">
      <p>Terrain Config</p>

      <div></div>
      <input
        type="checkbox"
        data-field="paintTerrain"
        .checked=${this._tc.paintTerrain}
        @input=${this._onBooleanInput}
      />
      <span>Show Terrain</span>

      <div></div>
      <input
        type="range"
        data-field="cameraZoom"
        min="1"
        max="200"
        value=${this._tc.cameraZoom}
        @input=${this._onNumericInput}
      />
      <span>Camera Zoom: ${this._tc.cameraZoom}</span>

      <div></div>
      <input
        type="range"
        data-field="extent"
        min="0"
        max="100"
        value=${this._tc.extent}
        @input=${this._onNumericInput}
      />
      <span>Grid Size: ${this._tc.extent}</span>

      <div></div>
      <input
        type="range"
        data-field="seed"
        min="0"
        max="10000"
        value=${this._tc.seed}
        @input=${this._onNumericInput}
      />
      <span>Seed: ${this._tc.seed}</span>

      <div></div>
      <input
        type="range"
        data-field="scale"
        min="1"
        max="200"
        value=${this._tc.scale}
        @input=${this._onNumericInput}
      />
      <span>Scale: ${this._tc.scale}</span>

      <div></div>
      <input
        type="range"
        data-field="octaves"
        min="1"
        max="8"
        value=${this._tc.octaves}
        @input=${this._onNumericInput}
      />
      <span>Octaves: ${this._tc.octaves}</span>

      <div></div>
      <input
        type="range"
        data-field="persistance"
        min="0"
        max="1"
        step="0.01"
        value=${this._tc.persistance}
        @input=${this._onNumericInput}
      />
      <span>Persistance: ${this._tc.persistance}</span>

      <div></div>
      <input
        type="range"
        data-field="lacunarity"
        min="1"
        max="10"
        step="0.1"
        value=${this._tc.lacunarity}
        @input=${this._onNumericInput}
      />
      <span>Lacunarity: ${this._tc.lacunarity}</span>

      <div></div>
      <input
        type="range"
        data-field="offsetX"
        min="-50"
        max="50"
        step="1"
        value=${this._tc.offsetX}
        @input=${this._onNumericInput}
      />
      <span>Offset X: ${this._tc.offsetX}</span>

      <div></div>
      <input
        type="range"
        data-field="offsetY"
        min="-50"
        max="50"
        step="1"
        value=${this._tc.offsetY}
        @input=${this._onNumericInput}
      />
      <span>Offset Y: ${this._tc.offsetY}</span>

      <div></div>
      <button @click=${this._onExportConfig} class="btn btn-neutral">
        Export Config
      </button>
    </div>`;
  }

  private _onNumericInput(ev: InputEvent): void {
    const input = ev.target as HTMLInputElement;
    const field = input.dataset.field as keyof TerrainConfig;
    noCap(field, "Expected data-field attribute on input element");

    this._terrainConfig$.next({
      ...this._tc,
      [field]: this._parseNumericInputEventValue(ev),
    });
    this.requestUpdate();
  }

  private _onBooleanInput(ev: InputEvent): void {
    const input = ev.target as HTMLInputElement;
    const field = input.dataset.field as keyof TerrainConfig;
    noCap(field, "Expected data-field attribute on input element");

    this._terrainConfig$.next({
      ...this._tc,
      [field]: this._parseBooleanInputEventValue(ev),
    });
    this.requestUpdate();
  }

  private async _onExportConfig(): Promise<void> {
    const configJson = JSON.stringify(this._tc, null, 2);
    console.log("Terrain Config", this._tc);

    try {
      await navigator.clipboard.writeText(configJson);
      console.log("✓ Config copied to clipboard");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback: show the JSON in console for manual copy
      console.log("Copy this manually:", configJson);
    }
  }

  // michael: todo - doc daisy ui
  // michael: document perspective is top-down oblique.

  private _parseNumericInputEventValue(ev: InputEvent): number {
    noCap(
      ev.target instanceof HTMLInputElement,
      "Expected html input to be target of event.",
    );
    const value = Number(ev.target.value);
    noCap(!Number.isNaN(value), "Expected value to be a number.");
    return value;
  }

  private _parseBooleanInputEventValue(ev: InputEvent): boolean {
    noCap(
      ev.target instanceof HTMLInputElement,
      "Expected html input to be target of event.",
    );
    return ev.target.checked;
  }
}
