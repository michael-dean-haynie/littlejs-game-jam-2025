import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import {
  TERRAIN_THING_TOKEN,
  type ITerrainThing,
  type TerrainConfig,
} from "./terrain-thing.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import alea from "alea";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { percent, vec2 } from "../littlejsengine/littlejsengine.pure";
import type { TileInfo, Vector2 } from "../littlejsengine/littlejsengine.types";
import { LitOverlay } from "../lit/components/lit-overlay.al";
import { tap } from "rxjs";
import { getTextureIdx } from "../textures/get-texture";

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

  private _terrainConfig!: TerrainConfig;

  private _noiseMap!: number[][];

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;

    this._prng = alea(this.seed);
    this._noise2D = createNoise2D(this._prng);

    this._terrainConfig = {
      paintTerrain: true,
      cameraZoom: 51,
      extent: 14,
      seed: 1678,
      scale: 100,
      octaves: 4,
      persistance: 0.5,
      lacunarity: 2.5,
      offset: vec2(0),
    };

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

    const result = this._noise2D(x, y);
    // result = this._reRangeSample(result);
    // result = this._quantize(result, this._terrainColors.length);
    return result;
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

  // private readonly _terrainColors: Color[] = [
  //   // rgb(0.255, 0.412, 0.882), // 0: Royal Blue (water/ocean)
  //   rgb(0.933, 0.839, 0.686), // 1: Peach Puff (sandy beach)
  //   // rgb(0.133, 0.545, 0.133), // 2: Forest Green (trees/forest)
  //   rgb(0.545, 0.537, 0.537), // 3: Gray (rocky mountains)
  //   // rgb(1.0, 0.98, 0.98), // 4: Snow White (snow caps)
  // ];

  private readonly _terrainTiles: TileInfo[] = [];
  get terrainTiles(): TileInfo[] {
    if (this._terrainTiles.length === 0) {
      this._terrainTiles.push(
        new this._ljs.TileInfo(
          vec2(32),
          vec2(64),
          // vec2(128),
          getTextureIdx("terrain.tilemap1"),
          0,
        ), // low
        new this._ljs.TileInfo(
          vec2(32),
          vec2(64),
          getTextureIdx("terrain.tilemap2"),
          0,
        ), // high
      );
    }
    return this._terrainTiles;
  }

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

    this._ljs.setCameraScale(this._terrainConfig.cameraZoom);

    if (!this._terrainConfig.paintTerrain) return;

    const size = this._extToSize(this._terrainConfig.extent);

    const scale = 2;
    const [offset] = this._sizeToBounds(size);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const noise = this._noiseMap[x][y];
        // this._ljs.drawRect(
        //   vec2(x + offset, y + offset),
        //   vec2(1),
        //   this._terrainColors[
        //     this._quantize(noise, this._terrainColors.length)
        //   ],
        // );
        this._ljs.drawTile(
          vec2((x + offset) * scale, (y + offset) * scale),
          vec2(scale),
          this.terrainTiles[this._quantize(noise, this.terrainTiles.length)],
        );
      }
    }
  }

  // michael: make this not so hackey
  private _initLitOverlay(): void {
    this._litOverlay = document
      .querySelector("body")
      ?.insertAdjacentElement(
        "beforeend",
        new LitOverlay(this._terrainConfig),
      ) as LitOverlay;

    // this._litOverlay.hidden = true; // start hidden

    this._litOverlay.terrainConfig$
      .pipe(
        tap((tc) => {
          this._terrainConfig = tc;
          this._noiseMap = this._generateNoiseMapFromConfig();
        }),
      )
      .subscribe();

    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key !== "`") return;
      this._litOverlay.hidden = !this._litOverlay.hidden;
    });
  }

  private _generateNoiseMapFromConfig(): number[][] {
    this.seed = this._terrainConfig.seed;
    const size = this._extToSize(this._terrainConfig.extent);
    return this._generateNoiseMap(
      size,
      size,
      this._terrainConfig.scale,
      this._terrainConfig.octaves,
      this._terrainConfig.persistance,
      this._terrainConfig.lacunarity,
      this._terrainConfig.offset,
    );
  }

  private _generateNoiseMap(
    mapWidth: number,
    mapHeight: number,
    scale: number,
    octaves: number,
    persistance: number,
    lacunarity: number,
    offset: Vector2,
  ): number[][] {
    const noiseMap: number[][] = Array.from({ length: mapWidth }, () =>
      Array(mapHeight).fill(0),
    );

    const octaveOffsets: Vector2[] = new Array(octaves);

    for (let i = 0; i < octaves; i++) {
      const offsetX = this._prng.next() + offset.x;
      const offsetY = this._prng.next() + offset.y;
      octaveOffsets[i] = vec2(offsetX, offsetY);
    }

    if (scale <= 0) {
      scale = 0.0001;
    }

    let maxNoiseHeight = Number.MIN_VALUE;
    let minNoiseHeight = Number.MAX_VALUE;

    const halfWidth = mapWidth / 2;
    const halfHeight = mapHeight / 2;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;

        for (let i = 0; i < octaves; i++) {
          const sampleX =
            ((x - halfWidth) / scale) * frequency + octaveOffsets[i].x;
          const sampleY =
            ((y - halfHeight) / scale) * frequency + octaveOffsets[i].y;

          const simplexValue = this.sample(sampleX, sampleY) * 2 - 1;
          noiseHeight += simplexValue * amplitude;

          amplitude *= persistance;
          frequency *= lacunarity;
        }

        if (noiseHeight > maxNoiseHeight) {
          maxNoiseHeight = noiseHeight;
        } else if (noiseHeight < minNoiseHeight) {
          minNoiseHeight = noiseHeight;
        }
        noiseMap[x][y] = noiseHeight;
      }
    }

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        noiseMap[x][y] = percent(
          noiseMap[x][y],
          minNoiseHeight,
          maxNoiseHeight,
        );
      }
    }

    return noiseMap;
  }
}
