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
import {
  sectorExtent,
  sectorSize,
  sectorToKey,
  sectorToWorld,
  worldToSector,
} from "../world/sector.types";
import { noCap } from "../core/util/no-cap";

// michael: doc: alea and simplex noise packages
@Autoloadable({
  serviceIdentifier: TERRAIN_THING_TOKEN,
})
export class TerrainThing implements ITerrainThing {
  private readonly _ljs: ILJS;

  private _litOverlay!: LitOverlay;

  private _terrainConfig!: TerrainConfig;

  private readonly _sectorNoiseMaps = new Map<string, number[][]>();

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;

    this._terrainConfig = {
      paintTerrain: true,
      useTiles: true,
      cameraZoom: 45,
      extent: 2,
      seed: 1678,
      scale: 181,
      octaves: 4,
      persistance: 0.5,
      lacunarity: 2.5,
      offsetX: 0,
      offsetY: -1,
      cliffHeightBounds: [0.2, 0.4, 0.6, 0.8],
      clamp: 0.64,
    };

    this._initLitOverlay();
  }

  /** Convert continuous values (0 - 1) into discrete buckets */
  private _quantize(value: number): number {
    const bounds = this._terrainConfig.cliffHeightBounds;
    const upperBoundIdx = bounds.findIndex((bound) => value <= bound);
    return upperBoundIdx === -1 ? bounds.length : upperBoundIdx;
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

    const upper = this._terrainConfig.extent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        if (this._terrainConfig.useTiles) {
          this.renderSectorTiles(sector);
        } else {
          this.renderSectorColors(sector);
        }
      }
    }
  }

  renderSectorColors(sector: Vector2): void {
    const upper = sectorExtent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorToWorld(sector).add(vec2(x, y));
        const cliffHeight = this.getCliffIdx(worldPos);

        this._ljs.drawRect(
          vec2(worldPos.x, worldPos.y + cliffHeight),
          vec2(1),
          this._terrainColors[cliffHeight],
        );
      }
    }
  }

  renderSectorTiles(sector: Vector2): void {
    const upper = sectorExtent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorToWorld(sector).add(vec2(x, y));
        const cliffHeight = this.getCliffIdx(worldPos);
        const txtIdx = this.terrainTextureIdxs[cliffHeight];

        const wsx = worldPos.x;
        const wsy = worldPos.y;

        // north cliff height ... etc
        const nch = this.getCliffIdx(vec2(wsx, wsy + 1));
        const sch = this.getCliffIdx(vec2(wsx, wsy - 1));
        const wch = this.getCliffIdx(vec2(wsx - 1, wsy));
        const ech = this.getCliffIdx(vec2(wsx + 1, wsy));

        // north edge is cliff ... etc
        const nc = cliffHeight > nch;
        const sc = cliffHeight > sch;
        const wc = cliffHeight > wch;
        const ec = cliffHeight > ech;

        if (sc) {
          // start with tile of height below to show around cliff face
          this._ljs.drawTile(
            vec2(wsx, wsy + cliffHeight - 1),
            vec2(1),
            new this._ljs.TileInfo(
              vec2(352, 32),
              vec2(64),
              this.terrainTextureIdxs[cliffHeight - 1],
              0,
            ),
          );
        }

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
          this._ljs.drawTile(
            vec2(wsx - 0.25, wsy + cliffHeight - 1),
            vec2(0.5, 1),
            swcfTI,
          );
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
          this._ljs.drawTile(
            vec2(wsx + 0.25, wsy + cliffHeight - 1),
            vec2(0.5, 1),
            secfTI,
          );
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

  getCliffIdx(pos: Vector2): number {
    return this._quantize(this._getNoiseAtWorldPosition(pos));
  }

  /** This is the projection offset. In screen space units? */
  getCliffHeight(pos: Vector2): number {
    const cliffIdx = this.getCliffIdx(pos);
    return cliffIdx * 1; // cliff height scale would go here
  }

  private _getNoiseAtWorldPosition(pos: Vector2): number {
    // round world position to center of tile
    const worldPos = vec2(Math.round(pos.x), Math.round(pos.y));

    const sector = worldToSector(worldPos);
    const sectorCenter = sectorToWorld(sector);

    const offsetFromSectorCenter = worldPos.subtract(sectorCenter);
    const offsetFromNoiseMapOrigin = offsetFromSectorCenter.add(
      vec2(sectorExtent),
    );
    const { x, y } = offsetFromNoiseMapOrigin;

    const noiseMap = this._sectorNoiseMaps.get(sectorToKey(sector));
    noCap.notUndefined(noiseMap);
    return noiseMap[x][y];
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
          this._generateNoiseMaps();
        }),
      )
      .subscribe();

    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key !== "`") return;
      this._litOverlay.hidden = !this._litOverlay.hidden;
    });
  }

  private _generateNoiseMaps(): void {
    this._sectorNoiseMaps.clear();
    // + 1 for outer edge. won't be rendered but needed for edges of rendered sectors
    const upper = this._terrainConfig.extent + 1;
    const lower = -upper;

    // note: going top to bottom, left to right in case render order matters or something
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        const noiseMap = this._generateNoiseMapForSector(sector);
        this._sectorNoiseMaps.set(sectorToKey(sector), noiseMap);
      }
    }
  }

  private _generateNoiseMapForSector(sector: Vector2): number[][] {
    return generateNoiseMap(
      this._terrainConfig.seed,
      sectorSize,
      sectorSize,
      this._terrainConfig.scale,
      this._terrainConfig.octaves,
      this._terrainConfig.persistance,
      this._terrainConfig.lacunarity,
      sectorToWorld(
        sector.add(
          vec2(this._terrainConfig.offsetX, this._terrainConfig.offsetY),
        ),
      ),
      this._terrainConfig.clamp,
    );
  }
}
