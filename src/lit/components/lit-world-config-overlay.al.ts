import { customElement } from "lit/decorators.js";
import { BaseLitElement } from "./base-lit-element";
import { BehaviorSubject, type Observable } from "rxjs";
import type { WorldConfig } from "../../world/world.types";
import { html } from "lit";
import { noCap } from "../../core/util/no-cap";
import { range } from "../../core/util/range";

@customElement("lit-world-config-overlay")
export class LitWorldConfigOverlay extends BaseLitElement {
  private readonly _worldConfig$: BehaviorSubject<WorldConfig>;
  public readonly worldConfig$: Observable<WorldConfig>;

  private get _wc(): WorldConfig {
    return this._worldConfig$.value;
  }

  constructor(worldConfig: WorldConfig) {
    super();
    this._worldConfig$ = new BehaviorSubject(worldConfig);
    this.worldConfig$ = this._worldConfig$.asObservable();
  }

  render() {
    return html` <div class="text-white z-10 absolute font-mono">
      <p>World Config</p>

      <div></div>
      <input
        type="range"
        data-field="cameraZoom"
        min="1"
        max="200"
        value=${this._wc.cameraZoom}
        @input=${this._onNumericInput}
      />
      <span>Camera Zoom: ${this._wc.cameraZoom}</span>

      <div></div>
      <input
        type="checkbox"
        data-field="renderTerrain"
        .checked=${this._wc.renderTerrain}
        @input=${this._onBooleanInput}
      />
      <span>Render Terrain</span>

      <div></div>
      <input
        type="checkbox"
        data-field="topDownPerspective"
        .checked=${this._wc.topDownPerspective}
        @input=${this._onBooleanInput}
      />
      <span>Topdown Perspective</span>

      <div></div>
      <input
        type="checkbox"
        data-field="useTiles"
        .checked=${this._wc.useTiles}
        @input=${this._onBooleanInput}
      />
      <span>Use Tiles</span>

      <div></div>
      <input
        type="range"
        data-field="sectorExtent"
        min="1"
        max="10"
        value=${this._wc.sectorExtent}
        @input=${this._onNumericInput}
      />
      <span>Sector Extent: ${this._wc.sectorExtent}</span>

      <div></div>
      <input
        type="range"
        data-field="sectorRenderExtent"
        min="1"
        max="10"
        value=${this._wc.sectorRenderExtent}
        @input=${this._onNumericInput}
      />
      <span>Sector Render Extent: ${this._wc.sectorRenderExtent}</span>

      <div></div>
      <input
        type="range"
        data-field="seed"
        min="0"
        max="10000"
        value=${this._wc.seed}
        @input=${this._onNumericInput}
      />
      <span>Seed: ${this._wc.seed}</span>

      <div></div>
      <input
        type="range"
        data-field="tnScale"
        min="1"
        max="200"
        value=${this._wc.tnScale}
        @input=${this._onNumericInput}
      />
      <span>Scale: ${this._wc.tnScale}</span>

      <div></div>
      <input
        type="range"
        data-field="tnOctaves"
        min="1"
        max="8"
        value=${this._wc.tnOctaves}
        @input=${this._onNumericInput}
      />
      <span>Octaves: ${this._wc.tnOctaves}</span>

      <div></div>
      <input
        type="range"
        data-field="tnPersistance"
        min="0"
        max="1"
        step="0.01"
        value=${this._wc.tnPersistance}
        @input=${this._onNumericInput}
      />
      <span>Persistance: ${this._wc.tnPersistance}</span>

      <div></div>
      <input
        type="range"
        data-field="tnLacunarity"
        min="1"
        max="10"
        step="0.1"
        value=${this._wc.tnLacunarity}
        @input=${this._onNumericInput}
      />
      <span>Lacunarity: ${this._wc.tnLacunarity}</span>

      <div></div>
      <input
        type="range"
        data-field="tnClamp"
        min="0"
        max="1"
        step="0.01"
        value=${this._wc.tnClamp}
        @input=${this._onNumericInput}
      />
      <span>Clamp: ${this._wc.tnClamp}</span>

      <div></div>
      <input
        type="range"
        data-field="rampSlopeThreshold"
        min="0"
        step="0.01"
        value=${this._wc.rampSlopeThreshold}
        @input=${this._onNumericInput}
      />
      <span>Ramp Slope Threshold: ${this._wc.rampSlopeThreshold}</span>

      <div></div>
      <input
        type="range"
        data-field="tnOffsetX"
        min="-50"
        max="50"
        step="1"
        value=${this._wc.tnOffsetX}
        @input=${this._onNumericInput}
      />
      <span>Offset X: ${this._wc.tnOffsetX}</span>

      <div></div>
      <input
        type="range"
        data-field="tnOffsetY"
        min="-50"
        max="50"
        step="1"
        value=${this._wc.tnOffsetY}
        @input=${this._onNumericInput}
      />
      <span>Offset Y: ${this._wc.tnOffsetY}</span>

      <div></div>
      <p>
        Cliff Height Boundaries (${this._wc.cliffHeightBounds.length + 1} cliff
        heights)
      </p>
      <ul>
        ${this._wc.cliffHeightBounds.map(
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
    const field = input.dataset.field as keyof WorldConfig;
    noCap(field, "Expected data-field attribute on input element");

    this._worldConfig$.next({
      ...this._wc,
      [field]: this._parseNumericInputEventValue(ev),
    });
    this.requestUpdate();
  }

  private _onBooleanInput(ev: InputEvent): void {
    const input = ev.target as HTMLInputElement;
    const field = input.dataset.field as keyof WorldConfig;
    noCap(field, "Expected data-field attribute on input element");

    this._worldConfig$.next({
      ...this._wc,
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

    const cliffHeightBounds = [...this._wc.cliffHeightBounds];
    cliffHeightBounds.splice(index, 1, newValue);

    this._worldConfig$.next({
      ...this._wc,
      cliffHeightBounds,
    });

    this._bullyCliffHeights(index, isGoingUp);
    this.requestUpdate();
  }

  private _onAddCliffHeight(): void {
    const lower = this._wc.cliffHeightBounds.at(-1) ?? 0;
    const upper = 1;
    const diff = upper - lower;
    const mid = lower + diff / 2;

    const cliffHeightBounds = [...this._wc.cliffHeightBounds, mid];
    this._worldConfig$.next({
      ...this._wc,
      cliffHeightBounds,
    });

    this.requestUpdate();
  }

  /** "Bully" other range values ("marks") so they don't overlap. */
  private _bullyCliffHeights(blyIdx: number, isGoingUp: boolean): void {
    const ary = [...this._wc.cliffHeightBounds];
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

    this._worldConfig$.next({
      ...this._wc,
      cliffHeightBounds: [...ary],
    });
  }

  private _onSpaceEvenly(): void {
    const cliffHeightBounds = this._wc.cliffHeightBounds.map((_, idx, arr) => {
      const bound = (idx + 1) / (arr.length + 1);
      return Math.round(bound * 100) / 100;
    });

    this._worldConfig$.next({
      ...this._wc,
      cliffHeightBounds,
    });
    this.requestUpdate();
  }

  private _onRemoveCliffHeight(index: number): void {
    noCap(
      this._wc.cliffHeightBounds.length > index,
      "Expected index to exist in array.",
    );
    const cliffHeightBounds = [...this._wc.cliffHeightBounds];
    cliffHeightBounds.splice(index, 1);

    this._worldConfig$.next({
      ...this._wc,
      cliffHeightBounds,
    });
    this.requestUpdate();
  }

  private async _onExportConfig(): Promise<void> {
    const configJson = JSON.stringify(this._wc, null, 2);
    console.log("Terrain Config", this._wc);

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
