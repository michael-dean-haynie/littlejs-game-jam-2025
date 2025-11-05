/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Autoloadable } from "../core/autoload/autoloadable";
import { LitWorldConfigOverlay } from "../lit/components/lit-world-config-overlay.al";
import {
  defaultWorldConfig,
  f2dmk,
  WORLD_TOKEN,
  type IWorld,
  type Perspective,
} from "./world.types";
import type { Cell } from "./cell-types";
import { noCap } from "../core/util/no-cap";
import {
  debugRect,
  rgb,
  vec2,
  WHITE,
} from "../littlejsengine/littlejsengine.pure";
import type { Color, Vector2 } from "../littlejsengine/littlejsengine.types";
import {
  advancePhase,
  extToGridSize,
  phaseIdxMap,
  sectorToWorld,
  worldToSector,
  type Sector,
} from "./sector.types";
import { generateNoiseMap } from "../noise/generate-noise-map";
import { quantize } from "../noise/quantize";
import type { IUnit } from "../units/unit.types";
import { inject } from "inversify";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { textureIndexMap } from "../textures/texture-index-map";
import { tap } from "rxjs";

@Autoloadable({
  serviceIdentifier: WORLD_TOKEN,
})
export class World implements IWorld {
  unit?: IUnit;

  private readonly _ljs: ILJS;

  private _worldConfigOverlay!: LitWorldConfigOverlay;
  private _wc = { ...defaultWorldConfig };
  private _pwc = { ...defaultWorldConfig };

  private _prevSectorKey?: number;

  private _perspective: Perspective = this._wc.topDownPerspective
    ? "topdown"
    : "topdown-oblique";
  public get perspective(): Perspective {
    return this._perspective;
  }

  private readonly _sectors = new Map<number, Sector>();
  private readonly _cells = new Map<number, Cell>();
  getCell(pos: Vector2): Cell {
    const cell = this._cells.get(f2dmk(pos));
    noCap.notUndefined(cell);
    return cell;
  }

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  init(): void {
    this._initOverlay();

    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).world = this;
  }

  update(): void {
    const unitPos = this.unit?.box2dObjectAdapter.getCenterOfMass() ?? vec2();
    const sector = worldToSector(unitPos, this._wc.sectorExtent);
    const sectorKey = f2dmk(sector);
    if (sectorKey === this._prevSectorKey) return;

    this._prevSectorKey = sectorKey;
    this._updateSectors();
  }

  getTerrainHeight(pos: Vector2): number {
    const cell = this.getCell(pos);
    if (cell.rampDir === undefined) {
      return cell.cliffHeight;
    }

    let xProg = pos.x - 0.5;
    xProg = xProg - Math.floor(xProg);
    xProg = cell.rampDir === "e" ? xProg : 1 - xProg;
    return cell.cliffHeight + xProg;
  }
  /**
   * ==================================================================
   * WORLD CONFIG UTILS
   * ==================================================================
   */

  /** sector size */
  private get _sectorSize(): number {
    return extToGridSize(this._wc.sectorExtent);
  }

  /**
   * ==================================================================
   * SECTOR UPDATING
   * ==================================================================
   */

  /** Update all sectors */
  private _updateSectors(): void {
    const unitPos = this.unit?.box2dObjectAdapter.getCenterOfMass() ?? vec2();
    const unitSector = worldToSector(unitPos, this._wc.sectorExtent);

    // reset each sectors need
    for (const sector of this._sectors.values()) {
      sector.neededFor = "none";
    }

    // update some sectors all the way
    const upper = this._wc.sectorRenderExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        this._advanceSectorToLayersPhase(unitSector.add(vec2(x, y)));
      }
    }

    // reduce sector load based on need
    for (const sector of this._sectors.values()) {
      this._reduceSectorToMinNeeded(sector);
    }
  }

  private _reduceSectorToMinNeeded(sector: Sector): void {
    if (phaseIdxMap[sector.neededFor] >= phaseIdxMap["layers"]) return;
    for (const layer of sector.layers ?? []) {
      layer.destroy();
    }
    sector.layers = undefined;

    if (phaseIdxMap[sector.neededFor] >= phaseIdxMap["noise"]) return;
    // delete cells
    const upper = this._wc.sectorExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const pos = sector.worldPos.add(vec2(x, y));
        this._cells.delete(f2dmk(pos));
      }
    }

    // delete sector
    this._sectors.delete(f2dmk(sector.pos));
  }

  /** Advance a single sector (will advance any of its neighbors as needed) */
  private _advanceSectorToLayersPhase(sectorVector: Vector2): void {
    // noise phase for self and neighbors
    let upper = 1;
    let lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        this._advanceSectorToNoisePhase(sectorVector.add(vec2(x, y)));
      }
    }

    // layer phase for self
    const sector = this._sectors.get(f2dmk(sectorVector))!;
    advancePhase(sector, "layers");
    if (sector.layers !== undefined) {
      return;
    }
    this._initSectorLayers(sectorVector);

    upper = this._wc.sectorExtent;
    lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const worldPos = sector.worldPos.add(vec2(x, y));
        const cell = this.getCell(worldPos);
        this._drawCell(cell, sector);
      }
    }
    for (const layer of sector.layers!) {
      layer.redraw();
    }
  }

  /** Advance a single sector (noise phase does not need any neighbors to advance) */
  private _advanceSectorToNoisePhase(sectorVector: Vector2): void {
    const sectorKey = f2dmk(sectorVector);
    let sector = this._sectors.get(sectorKey);
    if (sector !== undefined) {
      advancePhase(sector, "noise");
      return;
    }

    // create sector
    sector = {
      pos: sectorVector,
      worldPos: sectorToWorld(sectorVector, this._wc.sectorExtent),
      neededFor: "noise",
    };
    this._sectors.set(sectorKey, sector);

    // generate noise
    const offset = sectorToWorld(
      sectorVector.add(vec2(this._wc.tnOffsetX, this._wc.tnOffsetY)),
      this._wc.sectorExtent,
    );
    const noiseMap = generateNoiseMap(
      this._wc.seed,
      this._sectorSize,
      this._sectorSize,
      this._wc.tnScale,
      this._wc.tnOctaves,
      this._wc.tnPersistance,
      this._wc.tnLacunarity,
      offset,
      this._wc.tnClamp,
    );

    // create cells
    const upper = this._wc.sectorExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const pos = sector.worldPos.add(vec2(x, y));
        const { x: nx, y: ny } = vec2(x, y).add(vec2(this._wc.sectorExtent));
        const noise = noiseMap[nx][ny];
        const cell: Cell = {
          pos,
          sectorPos: vec2(x, y),
          tileLayerPos: vec2(x, y).add(vec2(this._wc.sectorExtent)),
          noise,
          cliffHeight: quantize(noise, this._wc.cliffHeightBounds),
        };
        this._cells.set(f2dmk(pos), cell);
      }
    }
  }
  /**
   * ==================================================================
   * SECTOR CANVAS LAYER RENDERING
   * ==================================================================
   */

  /** tile scale */
  private _tileScale = 64;

  private readonly _terrainColors: Color[] = [
    rgb(0.255, 0.412, 0.882), // 0: Royal Blue (water/ocean)
    rgb(0.933, 0.839, 0.686), // 1: Peach Puff (sandy beach)
    rgb(0.133, 0.545, 0.133), // 2: Forest Green (trees/forest)
    rgb(0.545, 0.537, 0.537), // 3: Gray (rocky mountains)
    rgb(1.0, 0.98, 0.98), // 4: Snow White (snow caps)
  ];

  private _initSectorLayers(sectorVector: Vector2): void {
    const sector = this._sectors.get(f2dmk(sectorVector))!;
    sector.layers = [];

    for (let cliff = 0; cliff <= this._wc.cliffHeightBounds.length; cliff++) {
      const layer = new this._ljs.TileLayer(
        sector.worldPos.subtract(vec2(this._sectorSize / 2)),
        vec2(this._sectorSize),
        new this._ljs.TileInfo(
          vec2(0),
          vec2(this._tileScale),
          textureIndexMap["white.png"],
          0,
        ),
        vec2(1),
        cliff,
        true,
      );
      sector.layers[cliff] = layer;
      debugRect(sector.worldPos, vec2(this._sectorSize), WHITE.toString(), 1);
    }
  }

  private _drawCell(cell: Cell, sector: Sector): void {
    noCap.notUndefined(sector.layers);
    sector.layers[cell.cliffHeight].setData(
      cell.tileLayerPos,
      new this._ljs.TileLayerData(
        0,
        0,
        false,
        this._terrainColors[cell.cliffHeight],
      ),
    );
  }

  /**
   * ==================================================================
   * LIT WORLD OVERLAY
   * ==================================================================
   */

  /** init overlay */
  private _initOverlay() {
    this._worldConfigOverlay = document
      .querySelector("body")
      ?.insertAdjacentElement(
        "beforeend",
        new LitWorldConfigOverlay(this._wc),
      ) as LitWorldConfigOverlay;

    // this._worldConfigOverlay.hidden = true; // start hidden
    window.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key !== "`") return;
      this._worldConfigOverlay.hidden = !this._worldConfigOverlay.hidden;
    });

    this._worldConfigOverlay.worldConfig$
      .pipe(
        tap((config) => {
          // nuke stuff before extent and configs change
          for (const sector of this._sectors.values()) {
            sector.neededFor = "none";
            this._reduceSectorToMinNeeded(sector);
          }

          this._pwc = this._wc;
          this._wc = config;

          if (this._pwc.topDownPerspective !== this._wc.topDownPerspective) {
            this._perspective = this._wc.topDownPerspective
              ? "topdown"
              : "topdown-oblique";
          }

          this._ljs.setCameraScale(this._wc.cameraZoom);

          this._updateSectors();

          // for (const layer of this._sectorCanvasLayers.values()) {
          //   layer.destroy();
          // }
          // for (const collision of [
          //   ...this._sectorCollisionsMap.values(),
          // ].flat()) {
          //   collision.destroy();
          // }
          // this._terrainConfig = config;
          // this._generateNoiseMaps();
          // if (!this._terrainConfig.paintTerrain) return;
          // this._generateAllCliffs();
          // this._remarkRamps();
          // this._rebuildCollisionsMap();
          // this._rebuildCanvasLayers();
        }),
      )
      .subscribe();
  }
}
