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
import type { Cell } from "./cell";
import { noCap } from "../core/util/no-cap";
import { vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import { extToGridSize, Sector, worldToSector } from "./sector";
import type { IUnit } from "../units/unit.types";
import { inject } from "inversify";
import { LJS_TOKEN } from "../littlejsengine/littlejsengine.token";
import type { ILJS } from "../littlejsengine/littlejsengine.impure";
import { tap } from "rxjs";

export type TileLayerQueueItem = { sectorVector: Vector2; cliff: number };

@Autoloadable({
  serviceIdentifier: WORLD_TOKEN,
})
export class World implements IWorld {
  unit?: IUnit;

  private readonly _ljs: ILJS;

  private _worldConfigOverlay!: LitWorldConfigOverlay;

  public wc = { ...defaultWorldConfig };
  private _pwc = { ...defaultWorldConfig };

  private _prevSectorKey?: number;

  private _perspective: Perspective = this.wc.topDownPerspective
    ? "topdown"
    : "topdown-oblique";
  public get perspective(): Perspective {
    return this._perspective;
  }

  sectors = new Map<number, Sector>();
  cells = new Map<number, Cell>();
  getCell(pos: Vector2): Cell {
    const cell = this.cells.get(f2dmk(pos));
    noCap.notUndefined(cell);
    return cell;
  }

  tileLayerQueue: TileLayerQueueItem[] = [];
  private _lastBuildTileLayer: number = Number.NEGATIVE_INFINITY;

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
    // build tile layers
    if (
      this.tileLayerQueue.length &&
      this._ljs.time - this._lastBuildTileLayer > 0.05
    ) {
      this._lastBuildTileLayer = this._ljs.time;
      // const { sectorVector, cliff } = this.tileLayerQueue.shift()!;
      // this._buildSectorLayer(sectorVector, cliff);
      return;
    }

    const unitPos = this.unit?.box2dObjectAdapter.getCenterOfMass() ?? vec2();
    const sectorVector = worldToSector(unitPos, this.wc.sectorExtent);
    const sectorKey = f2dmk(sectorVector);
    if (sectorKey === this._prevSectorKey) return;

    this._prevSectorKey = sectorKey;
    this._updateSectors();
  }

  /** Addative ramp height (if any)*/
  getRampHeight(pos: Vector2): number {
    const cell = this.getCell(pos);
    if (cell.rampDir === undefined) return 0;
    let xProg = pos.x - 0.5;
    xProg = xProg - Math.floor(xProg);
    xProg = cell.rampDir === "e" ? xProg : 1 - xProg;
    return xProg;
  }
  /**
   * ==================================================================
   * WORLD CONFIG UTILS
   * ==================================================================
   */

  /** sector size */
  get sectorSize(): number {
    return extToGridSize(this.wc.sectorExtent);
  }

  /**
   * ==================================================================
   * SECTOR UPDATING
   * ==================================================================
   */

  /** Update all sectors */
  private _updateSectors(): void {
    // return;
    const unitPos = this.unit?.box2dObjectAdapter.getCenterOfMass() ?? vec2();
    const unitSectorVector = worldToSector(unitPos, this.wc.sectorExtent);

    // reset each sectors minPhase
    for (const sector of this.sectors.values()) {
      sector.degradeMinPhase("bare");
    }

    // advance needed sectors and any dependencies they have
    const upper = this.wc.sectorRenderExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sectorVector = unitSectorVector.add(vec2(x, y));
        const sector = Sector.getOrCreateSector(sectorVector, this);
        sector.advanceMinPhase("renderers");
        sector.advanceToPhase();
      }
    }

    // reduce sectors to min phase
    for (const sector of this.sectors.values()) {
      sector.degradeToPhase();
    }
  }

  // private _buildSectorLayer(sectorVector: Vector2, cliff: number): void {
  //   // const sector = this.sectors.get(f2dmk(sectorVector));
  //   // if (sector === undefined) return;

  //   // const layer = new this._ljs.TileLayer(
  //   //   sector.worldPos.subtract(vec2(this.sectorSize / 2)),
  //   //   vec2(this.sectorSize),
  //   //   new this._ljs.TileInfo(
  //   //     vec2(0),
  //   //     vec2(this._tileScale),
  //   //     textureIndexMap["white.png"],
  //   //     0,
  //   //   ),
  //   //   vec2(1),
  //   //   cliff,
  //   //   true,
  //   // );
  //   // sector.renderers[cliff] = layer;
  //   // debugRect(sector.worldPos, vec2(this.sectorSize), WHITE.toString(), 3);

  //   // const upper = this.wc.sectorExtent;
  //   // const lower = -upper;
  //   // for (let y = upper; y >= lower; y--) {
  //   //   for (let x = lower; x <= upper; x++) {
  //   //     const worldPos = sector.worldPos.add(vec2(x, y));
  //   //     const cell = this.getCell(worldPos);
  //   //     // if (cell.cliffHeight !== cliff) continue;

  //   //     console.log(
  //   //       cell.offsetSectorCenter.toString(),
  //   //       cell.tileLayerPos.toString(),
  //   //     );
  //   //     // sector.layers[cell.cliffHeight].setData(
  //   //     sector.renderers[0].setData(
  //   //       cell.tileLayerPos,
  //   //       new this._ljs.TileLayerData(
  //   //         0,
  //   //         0,
  //   //         false,
  //   //         this._terrainColors[cell.cliffHeight],
  //   //       ),
  //   //     );
  //   //   }
  //   // }
  //   // layer.redraw();
  // }

  /**
   * ==================================================================
   * SECTOR CANVAS LAYER RENDERING
   * ==================================================================
   */

  /** tile scale */
  // private _tileScale = 64;

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
        new LitWorldConfigOverlay(this.wc),
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
          for (const sector of this.sectors.values()) {
            sector.degradeMinPhase("bare");
            sector.degradeToPhase();
          }

          this._pwc = this.wc;
          this.wc = config;

          if (this._pwc.topDownPerspective !== this.wc.topDownPerspective) {
            this._perspective = this.wc.topDownPerspective
              ? "topdown"
              : "topdown-oblique";
          }

          this._ljs.setCameraScale(this.wc.cameraZoom);

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
