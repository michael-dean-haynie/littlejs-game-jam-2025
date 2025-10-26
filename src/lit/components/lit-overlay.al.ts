import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import type { TerrainConfig } from "../../terrain/terrain-thing.types";
import { BehaviorSubject, type Observable } from "rxjs";
import { noCap } from "../../core/util/no-cap";
import { range } from "../../core/util/range";

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
    return html` <div class="text-white z-10 absolute font-mono">
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
        data-field="clamp"
        min="0"
        max="1"
        step="0.01"
        value=${this._tc.clamp}
        @input=${this._onNumericInput}
      />
      <span>Clamp: ${this._tc.clamp}</span>

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
      <p>
        Cliff Height Boundaries (${this._tc.cliffHeightBounds.length + 1} cliff
        heights)
      </p>
      <ul>
        ${this._tc.cliffHeightBounds.map(
          (bound, index) => html`
            <li class="flex gap-2 items-center text-center ">
              <input
                type="range"
                data-field="cliffHeightBounds"
                data-index=${index}
                data-prev=${bound}
                min="0"
                max="1"
                step="0.01"
                .value=${bound.toString()}
                @input=${this._onCliffHeightBoundsInput}
              />
              <span>${index}-${index + 1} Boundary: ${bound.toFixed(2)}</span>
              ${this._renderRemoveCliffHeightButton(index)}
            </li>
          `,
        )}
      </ul>
      <button @click=${this._onAddCliffHeight} class="btn btn-neutral">
        Add Cliff Height
      </button>
      <button @click=${this._onSpaceEvenly} class="btn btn-neutral">
        Space Evenly
      </button>

      <div></div>
      <button @click=${this._onExportConfig} class="btn btn-neutral">
        Export Config
      </button>
    </div>`;
  }

  private _renderRemoveCliffHeightButton(index: number) {
    return html`
      <button
        @click=${() => {
          this._onRemoveCliffHeight(index);
        }}
        class="btn btn-circle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
    `;
  }

  private _onNumericInput(ev: InputEvent): void {
    const input = ev.target as HTMLInputElement;
    // michael: good way to assert this so runtime and compile time safe with context inference awareness magic?
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

  private _onCliffHeightBoundsInput(ev: InputEvent): void {
    const input = ev.target as HTMLInputElement;

    // index
    const index = Number(input.dataset.index);
    noCap(
      index !== undefined,
      "Expected data-index attribute on input element",
    );
    noCap(!Number.isNaN(index), "Expected index to be a number.");

    // new value
    const newValue = this._parseNumericInputEventValue(ev);

    // previous value
    const prev = Number(input.dataset.prev);
    noCap(prev !== undefined, "Expected data-prev attribute on input element");
    noCap(!Number.isNaN(prev), "Expected prev to be a number.");
    noCap(prev !== newValue, "Expected prev value to differ from new value.");
    const isGoingUp = prev < newValue;
    input.dataset.prev = newValue.toString();

    const cliffHeightBounds = [...this._tc.cliffHeightBounds];
    cliffHeightBounds.splice(index, 1, newValue);

    this._terrainConfig$.next({
      ...this._tc,
      cliffHeightBounds,
    });

    this._bullyCliffHeights(index, isGoingUp);
    this.requestUpdate();
  }

  private _onAddCliffHeight(): void {
    const lower = this._tc.cliffHeightBounds.at(-1) ?? 0;
    const upper = 1;
    const diff = upper - lower;
    const mid = lower + diff / 2;

    const cliffHeightBounds = [...this._tc.cliffHeightBounds, mid];
    this._terrainConfig$.next({
      ...this._tc,
      cliffHeightBounds,
    });

    this.requestUpdate();
  }

  /** "Bully" other range values ("marks") so they don't overlap. */
  private _bullyCliffHeights(blyIdx: number, isGoingUp: boolean): void {
    const ary = [...this._tc.cliffHeightBounds];
    const blyBound = ary[blyIdx];

    const marks = isGoingUp ? range(blyIdx + 1, ary.length) : range(0, blyIdx);
    for (const mark of marks) {
      const markBound = ary[mark];
      if (isGoingUp && blyBound > markBound) {
        ary[mark] = blyBound;
      }
      if (!isGoingUp && blyBound < markBound) {
        ary[mark] = blyBound;
      }
    }

    this._terrainConfig$.next({
      ...this._tc,
      cliffHeightBounds: [...ary],
    });
  }

  private _onSpaceEvenly(): void {
    const cliffHeightBounds = this._tc.cliffHeightBounds.map((_, idx, arr) => {
      const bound = (idx + 1) / (arr.length + 1);
      return Math.round(bound * 100) / 100;
    });

    this._terrainConfig$.next({
      ...this._tc,
      cliffHeightBounds,
    });
    this.requestUpdate();
  }

  private _onRemoveCliffHeight(index: number): void {
    noCap(
      this._tc.cliffHeightBounds.length > index,
      "Expected index to exist in array.",
    );
    const cliffHeightBounds = [...this._tc.cliffHeightBounds];
    cliffHeightBounds.splice(index, 1);

    this._terrainConfig$.next({
      ...this._tc,
      cliffHeightBounds,
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
