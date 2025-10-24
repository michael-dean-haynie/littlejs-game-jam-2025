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
    return html` <div class="text-white">
      <p>Terrain Config</p>

      <hr />
      <input
        type="checkbox"
        value=${this._tc.paintTerrain}
        @input=${this._onPaintTerrainInput}
      />
      <span>Show Terrain</span>

      <hr />
      <input
        type="range"
        min="1"
        max="100"
        value=${this._tc.cameraZoom}
        @input=${this._onCameraZoomInput}
      />
      <span>Camera Zoom</span>

      <hr />
      <input
        type="range"
        min="0"
        max="100"
        value=${this._tc.extent}
        @input=${this._onExtentInput}
      />
      <span>Grid Size</span>
    </div>`;
  }

  private _onPaintTerrainInput(ev: InputEvent): void {
    this._terrainConfig$.next({
      ...this._tc,
      paintTerrain: this._parseBooleanInputEventValue(ev),
    });
  }

  private _onExtentInput(ev: InputEvent): void {
    this._terrainConfig$.next({
      ...this._tc,
      extent: this._parseNumericInputEventValue(ev),
    });
  }

  private _onCameraZoomInput(ev: InputEvent): void {
    this._terrainConfig$.next({
      ...this._tc,
      cameraZoom: this._parseNumericInputEventValue(ev),
    });
  }

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
