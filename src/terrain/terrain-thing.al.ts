import { inject } from "inversify";
import { Autoloadable } from "../core/autoload/autoloadable";
import {
  TERRAIN_THING_TOKEN,
  type ITerrainThing,
  type TerrainConfig,
} from "./terrain-thing.types";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { rgb, vec2 } from "../littlejsengine/littlejsengine.pure";
import type {
  Color,
  TileInfo,
  Vector2,
} from "../littlejsengine/littlejsengine.types";
import { LitOverlay } from "../lit/components/lit-overlay.al";
import { tap } from "rxjs";
import { getTextureIdx } from "../textures/get-texture";
import { generateNoiseMap } from "../noise/generate-noise-map";

// michael: doc: alea and simplex noise packages
@Autoloadable({
  serviceIdentifier: TERRAIN_THING_TOKEN,
})
export class TerrainThing implements ITerrainThing {
  private readonly _ljs: ILJS;

  private _litOverlay!: LitOverlay;

  private _terrainConfig!: TerrainConfig;

  private _noiseMap!: number[][];

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;

    this._terrainConfig = {
      paintTerrain: true,
      useTiles: false,
      cameraZoom: 73,
      extent: 5,
      seed: 1678,
      scale: 100,
      octaves: 4,
      persistance: 0.5,
      lacunarity: 2.5,
      offsetX: 0,
      offsetY: 0,
      cliffHeightBounds: [0.5],
      clamp: 0.25,
    };

    this._initLitOverlay();
  }

  /** Convert continuous values (0 - 1) into discrete buckets */
  private _quantize(value: number): number {
    const bounds = this._terrainConfig.cliffHeightBounds;
    const upperBoundIdx = bounds.findIndex((bound) => value <= bound);
    return upperBoundIdx === -1 ? bounds.length : upperBoundIdx;
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

  private readonly _terrainTextureIdxs: number[] = [];
  get terrainTextureIdxs(): number[] {
    if (this._terrainTextureIdxs.length === 0) {
      this._terrainTextureIdxs.push(
        getTextureIdx("terrain.tilemap1"),
        getTextureIdx("terrain.tilemap2"),
        getTextureIdx("terrain.tilemap3"),
        getTextureIdx("terrain.tilemap4"),
        getTextureIdx("terrain.tilemap5"),
      );
    }
    return this._terrainTextureIdxs;
  }

  private readonly _terrainColors: Color[] = [
    rgb(0.255, 0.412, 0.882), // 0: Royal Blue (water/ocean)
    rgb(0.933, 0.839, 0.686), // 1: Peach Puff (sandy beach)
    rgb(0.133, 0.545, 0.133), // 2: Forest Green (trees/forest)
    rgb(0.545, 0.537, 0.537), // 3: Gray (rocky mountains)
    rgb(1.0, 0.98, 0.98), // 4: Snow White (snow caps)
  ];

  // michael: todo: organize units, relations between noise map, world space, screen space terrain grid, tile size, unit size etc.
  render(): void {
    this._ljs.setCameraScale(this._terrainConfig.cameraZoom);
    if (!this._terrainConfig.paintTerrain) return;
    if (this._terrainConfig.useTiles) {
      this.renderTiles();
    } else {
      this.renderColors();
    }
  }

  renderColors(): void {
    const size = this._extToSize(this._terrainConfig.extent);
    const [offset] = this._sizeToBounds(size);

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = size - 1; y >= 0; y--) {
      for (let x = 0; x < size; x++) {
        const cliffHeight = this._getCliffHeightForNoiseMap(x, y);
        // world space x/y
        const wsx = x + offset;
        const wsy = y + offset;

        this._ljs.drawRect(
          vec2(wsx, wsy + cliffHeight),
          vec2(1),
          this._terrainColors[cliffHeight],
        );
      }
    }
  }

  renderTiles(): void {
    const size = this._extToSize(this._terrainConfig.extent);

    const [offset] = this._sizeToBounds(size);

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = size - 1; y >= 0; y--) {
      for (let x = 0; x < size; x++) {
        const cliffHeight = this._getCliffHeightForNoiseMap(x, y);
        // const txtIdx = getTextureIdx("terrain.tilemap2");
        const txtIdx = this.terrainTextureIdxs[cliffHeight];
        // world space x/y
        const wsx = x + offset;
        const wsy = y + offset;

        // north cliff height ... etc
        const nch =
          y === size - 1
            ? cliffHeight
            : this._getCliffHeightForNoiseMap(x, y + 1);
        const sch =
          y === 0 ? cliffHeight : this._getCliffHeightForNoiseMap(x, y - 1);
        const wch =
          x === 0 ? cliffHeight : this._getCliffHeightForNoiseMap(x - 1, y);
        const ech =
          x === size - 1
            ? cliffHeight
            : this._getCliffHeightForNoiseMap(x + 1, y);

        // north edge is cliff ... etc
        const nc = cliffHeight > nch;
        const sc = cliffHeight > sch;
        const wc = cliffHeight > wch;
        const ec = cliffHeight > ech;

        // start with base?
        this._ljs.drawTile(
          vec2(wsx, wsy),
          vec2(1),
          new this._ljs.TileInfo(
            vec2(352, 32),
            vec2(64),
            this.terrainTextureIdxs[0],
            0,
          ),
        );

        // michael: pu@ start using tile layers and sectors44
        // north west corner (tile info)
        let nwcTI: TileInfo;
        if (nc && wc) {
          nwcTI = new this._ljs.TileInfo(vec2(320, 256), vec2(32), txtIdx, 0);
        } else if (nc && !wc) {
          nwcTI = new this._ljs.TileInfo(vec2(384, 256), vec2(32), txtIdx, 0);
        } else if (!nc && wc) {
          nwcTI = new this._ljs.TileInfo(vec2(320, 128), vec2(32), txtIdx, 0);
        } else {
          // (!nc && !wc) {
          nwcTI = new this._ljs.TileInfo(vec2(352, 32), vec2(32), txtIdx, 0);
        }
        this._ljs.drawTile(
          vec2(wsx - 0.25, wsy + 0.25 + cliffHeight),
          vec2(0.5),
          nwcTI,
        );

        // north east corner
        let necTI: TileInfo;
        if (nc && ec) {
          necTI = new this._ljs.TileInfo(vec2(480, 0), vec2(32), txtIdx, 0);
        } else if (nc && !ec) {
          necTI = new this._ljs.TileInfo(vec2(448, 0), vec2(32), txtIdx, 0);
        } else if (!nc && ec) {
          necTI = new this._ljs.TileInfo(vec2(480, 32), vec2(32), txtIdx, 0);
        } else {
          // (!nc && !ec)
          necTI = new this._ljs.TileInfo(vec2(384, 32), vec2(32), txtIdx, 0);
        }
        this._ljs.drawTile(
          vec2(wsx + 0.25, wsy + 0.25 + cliffHeight),
          vec2(0.5),
          necTI,
        );

        // south west corner / south west cliff face
        let swcTI: TileInfo;
        let swcfTI: TileInfo;
        if (sc) {
          if (wc) {
            swcTI = new this._ljs.TileInfo(vec2(320, 160), vec2(32), txtIdx, 0);
            swcfTI = new this._ljs.TileInfo(
              vec2(320, 192),
              vec2(32, 64),
              txtIdx,
              0,
            );
          } else {
            // !wc
            swcTI = new this._ljs.TileInfo(vec2(352, 160), vec2(32), txtIdx, 0);
            swcfTI = new this._ljs.TileInfo(
              vec2(352, 192),
              vec2(32, 64),
              txtIdx,
              0,
            );
          }
          this._ljs.drawTile(vec2(wsx - 0.25, wsy), vec2(0.5, 1), swcfTI);
        } else if (!sc && wc) {
          swcTI = new this._ljs.TileInfo(vec2(320, 96), vec2(32), txtIdx, 0);
        } else {
          // (!sc && !wc)
          swcTI = new this._ljs.TileInfo(vec2(352, 64), vec2(32), txtIdx, 0);
        }
        this._ljs.drawTile(
          vec2(wsx - 0.25, wsy - 0.25 + cliffHeight),
          vec2(0.5),
          swcTI,
        );

        // south east corner
        let secTI: TileInfo;
        let secfTI: TileInfo;
        if (sc) {
          if (ec) {
            secTI = new this._ljs.TileInfo(vec2(480, 160), vec2(32), txtIdx, 0);
            secfTI = new this._ljs.TileInfo(
              vec2(480, 192),
              vec2(32, 64),
              txtIdx,
              0,
            );
          } else {
            // !ec
            secTI = new this._ljs.TileInfo(vec2(448, 160), vec2(32), txtIdx, 0);
            secfTI = new this._ljs.TileInfo(
              vec2(448, 192),
              vec2(32, 64),
              txtIdx,
              0,
            );
          }
          this._ljs.drawTile(vec2(wsx + 0.25, wsy), vec2(0.5, 1), secfTI);
        } else if (!sc && ec) {
          secTI = new this._ljs.TileInfo(vec2(480, 128), vec2(32), txtIdx, 0);
        } else {
          // (!sc && !ec)
          secTI = new this._ljs.TileInfo(vec2(384, 64), vec2(32), txtIdx, 0);
        }
        this._ljs.drawTile(
          vec2(wsx + 0.25, wsy - 0.25 + cliffHeight),
          vec2(0.5),
          secTI,
        );
      }
    }
  }

  private _getCliffHeightForNoiseMap(x: number, y: number): number {
    const noise = this._noiseMap[x][y];
    return this._quantize(noise);
  }

  getCliffIdx(pos: Vector2): number {
    return this._quantize(this._getNoiseAtWorldPosition(pos));
  }

  /** This is the projection offset. In screen space units? */
  getCliffHeight(pos: Vector2): number {
    const cliffIdx = this.getCliffIdx(pos);
    return cliffIdx * 1;
  }

  private _getNoiseAtWorldPosition(pos: Vector2): number {
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    const size = this._extToSize(this._terrainConfig.extent);
    const [, offset] = this._sizeToBounds(size);
    return this._noiseMap[x + offset][y + offset];
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
    const size = this._extToSize(this._terrainConfig.extent);
    return generateNoiseMap(
      this._terrainConfig.seed,
      size,
      size,
      this._terrainConfig.scale,
      this._terrainConfig.octaves,
      this._terrainConfig.persistance,
      this._terrainConfig.lacunarity,
      vec2(this._terrainConfig.offsetX, this._terrainConfig.offsetY),
      this._terrainConfig.clamp,
    );
  }
}
