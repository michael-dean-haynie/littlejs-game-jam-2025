import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import { TERRAIN_THING_TOKEN, type ITerrainThing } from "./terrain-thing.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import alea from "alea";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { rgb, vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Color, Vector2 } from "../littlejsengine/littlejsengine.types";
import { LitOverlay } from "../lit/components/lit-overlay.al";

// michael: doc: alea and simplex noise packages
@Autoloadable({
  serviceIdentifier: TERRAIN_THING_TOKEN,
})
export class TerrainThing implements ITerrainThing {
  private readonly _ljs: ILJS;

  /** Pseudo-random number generator */
  private _prng: ReturnType<typeof alea>;

  /** Gives values between -1 and 1 */
  private _noise2D: NoiseFunction2D;

  /** A seed for reproducable prodecurally generated output */
  private _seed: unknown = "seed";
  public get seed(): unknown {
    return this._seed;
  }
  public set seed(value: unknown) {
    this._seed = value;
    this._prng = alea(this.seed);
    this._noise2D = createNoise2D(this._prng);
  }

  private _litOverlay!: LitOverlay;

  private _gridExtent: number = 10;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;

    this._prng = alea(this.seed);
    this._noise2D = createNoise2D(this._prng);

    this._initLitOverlay();
  }

  sample(value1: Vector2): number;
  sample(value1: number, value2: number): number;
  sample(value1: Vector2 | number, value2?: number): number {
    let x, y: number;
    if (typeof value1 === "object") {
      x = value1.x;
      y = value1.y;
    } else {
      x = value1;
      y = value2!;
    }

    let result = this._noise2D(x, y);
    result = this._reRangeSample(result);
    result = this._quantize(result, this._terrainColors.length);
    return result;
  }

  /** Convert from range (-1 to 1) to (0 to 1) */
  private _reRangeSample(sample: number): number {
    return (sample + 1) / 2;
  }

  /** Convert continuous values (0 - 1) into discrete buckets */
  private _quantize(value: number, buckets: number): number {
    return Math.min(Math.floor(value * buckets), buckets - 1);
  }

  /**
   * Converts grid extent (half-width) to odd size (full-width).
   * This is mainly for creating a grid with a discrete center (e.g. 1x1, 3x3, 5x5, ...etc)
   */
  private _extToSize(extent: number) {
    return Math.abs(extent) * 2 + 1;
  }

  /** Centers a grid size on zero (so 11 would be from -5 to 5) */
  private _sizeToBounds(size: number): [number, number] {
    const extent = (size - 1) / 2;
    return [-1 * extent, extent];
  }

  private readonly _terrainColors: Color[] = [
    rgb(0.255, 0.412, 0.882), // 0: Royal Blue (water/ocean)
    rgb(0.933, 0.839, 0.686), // 1: Peach Puff (sandy beach)
    rgb(0.133, 0.545, 0.133), // 2: Forest Green (trees/forest)
    rgb(0.545, 0.537, 0.537), // 3: Gray (rocky mountains)
    rgb(1.0, 0.98, 0.98), // 4: Snow White (snow caps)
  ];

  // michael: pu@, get values showing in game world
  // get html debugging/designing interface in place with toggles for values/reseeding/zooming in or out, etc
  // create debugging helper for assigning values to window object for live watches etc...
  render(): void {
    // michael: remove
    // const [, textureIdx] = getTileTexture("terrain.tilemap1");
    // this._ljs.drawTile(
    //   vec2(5),
    //   vec2(5),
    //   this._ljs.tile(vec2(0), vec2(576, 384), textureIdx, 0),
    // );

    // michael: move these

    const size = this._extToSize(this._gridExtent);

    const [lower, upper] = this._sizeToBounds(size);
    for (let x = lower; x <= upper; x++) {
      for (let y = lower; y <= upper; y++) {
        const sample = this.sample(x, y);
        this._ljs.drawRect(vec2(x, y), vec2(1), this._terrainColors[sample]);
      }
    }
  }

  // michael: make this not so hackey
  private _initLitOverlay(): void {
    this._litOverlay = document
      .querySelector("body")
      ?.insertAdjacentElement("beforeend", new LitOverlay()) as LitOverlay;

    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key !== "`") return;
      this._litOverlay.hidden = !this._litOverlay.hidden;
    });

    this._litOverlay.addEventListener("grid-extent-input", (ev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._gridExtent = (ev as any).detail;
      this._updateLitOverlay();
    });

    this._updateLitOverlay();
  }

  private _updateLitOverlay(): void {
    this._litOverlay.gridExtent = this._gridExtent;
  }
}
