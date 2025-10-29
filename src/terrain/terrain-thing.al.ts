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
import {
  type CanvasLayer,
  type Color,
  type TileInfo,
  type Vector2,
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
  private readonly _sectorCanvasLayers = new Map<string, CanvasLayer>();

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;

    this._terrainConfig = {
      paintTerrain: true,
      useTiles: true,
      cameraZoom: 42,
      extent: 1,
      seed: 2334,
      scale: 174,
      octaves: 4,
      persistance: 0.5,
      lacunarity: 2.5,
      offsetX: -3,
      offsetY: -1,
      cliffHeightBounds: [0.2, 0.4, 0.6, 0.8],
      clamp: 0.64,
    };
  }

  init(): void {
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

    // canvas layers render on their own
  }

  private _rebuildCanvasLayers(): void {
    for (const layer of this._sectorCanvasLayers.values()) {
      layer.destroy();
    }

    const upper = this._terrainConfig.extent;
    const lower = -upper;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sector = vec2(x, y);
        this._buildSectorCanvasLayer(sector);
      }
    }
  }

  private _buildSectorCanvasLayer(sector: Vector2): void {
    const sectorCenter = sectorToWorld(sector);
    const canvasLayer = new this._ljs.CanvasLayer(
      sectorCenter,
      vec2(sectorSize),
      0,
      0,
      vec2(sectorSize).scale(64),
    );
    canvasLayer.tileInfo = new this._ljs.TileInfo(
      vec2(0),
      vec2(64),
      getTextureIdx("units.empty"),
      0,
    );

    // note: extending lower range for y to render tiles from lower sector that have cliff height into this sector
    const upper = sectorExtent;
    const lower = -upper;
    const bounds = this._terrainConfig.cliffHeightBounds.length;

    // note: need to draw from top to bottom (back to front) so projection offsets don't get jacked
    for (let y = upper; y >= lower - bounds; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sectorToWorld(sector).add(vec2(x, y));
        const canvasPos = worldPos.add(vec2(sectorSize / 2));
        const cliffHeight = this.getCliffIdx(worldPos);

        // get the simple color rect mode out of the way
        if (!this._terrainConfig.useTiles) {
          canvasLayer.drawRect(
            vec2(canvasPos.x, canvasPos.y + cliffHeight),
            vec2(1),
            this._terrainColors[cliffHeight],
          );
          continue;
        }

        // render with tiles
        const { x: wsx, y: wsy } = worldPos;
        const { x: csx, y: csy } = canvasPos;
        const txtIdx = this.terrainTextureIdxs[cliffHeight];

        canvasLayer.drawTile(
          vec2(csx, csy + cliffHeight),
          vec2(1),
          new this._ljs.TileInfo(vec2(352, 32), vec2(64), txtIdx, 0),
        );

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
          canvasLayer.drawTile(
            vec2(csx, csy + cliffHeight - 1),
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
        canvasLayer.drawTile(
          vec2(csx - 0.25, csy + 0.25 + cliffHeight),
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
        canvasLayer.drawTile(
          vec2(csx + 0.25, csy + 0.25 + cliffHeight),
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
          canvasLayer.drawTile(
            vec2(csx - 0.25, csy + cliffHeight - 1),
            vec2(0.5, 1),
            swcfTI,
          );
        } else if (!sc && wc) {
          swcTI = new this._ljs.TileInfo(vec2(320, 96), vec2(32), txtIdx, 0);
        } else {
          // (!sc && !wc)
          swcTI = new this._ljs.TileInfo(vec2(352, 64), vec2(32), txtIdx, 0);
        }
        canvasLayer.drawTile(
          vec2(csx - 0.25, csy - 0.25 + cliffHeight),
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
          canvasLayer.drawTile(
            vec2(csx + 0.25, csy + cliffHeight - 1),
            vec2(0.5, 1),
            secfTI,
          );
        } else if (!sc && ec) {
          secTI = new this._ljs.TileInfo(vec2(480, 128), vec2(32), txtIdx, 0);
        } else {
          // (!sc && !ec)
          secTI = new this._ljs.TileInfo(vec2(384, 64), vec2(32), txtIdx, 0);
        }
        canvasLayer.drawTile(
          vec2(csx + 0.25, csy - 0.25 + cliffHeight),
          vec2(0.5),
          secTI,
        );
      }
    }

    this._sectorCanvasLayers.set(sectorToKey(sector), canvasLayer);
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
          this._rebuildCanvasLayers();
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
