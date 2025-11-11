import { LitWorldConfigOverlay } from "../lit/components/lit-world-config-overlay.al";
import { defaultWorldConfig, f2dmk, type Perspective } from "./world.types";
import type { Cell } from "./cell";
import { noCap } from "../core/util/no-cap";
import {
  extToGridSize,
  Sector,
  worldToSector,
} from "./renderers/sectors/sector";
import { tap } from "rxjs";
import { phases } from "./renderers/sectors/sector-phases";
import {
  debugRect,
  debugText,
  setCameraScale,
  time,
  vec2,
  Vector2,
} from "littlejsengine";
import type { UnitObject } from "../units/unit-object";

export type TileLayerQueueItem = { sectorVector: Vector2; cliff: number };

export class World {
  unit?: UnitObject;

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

  readonly sectors = new Map<number, Sector>();
  readonly cells = new Map<number, Cell>();
  getCell(pos: Vector2): Cell {
    const cell = this.cells.get(f2dmk(pos));
    noCap.isDefined(cell);
    return cell;
  }

  tileLayerQueue: TileLayerQueueItem[] = [];
  private _lastBuildTileLayer: number = Number.NEGATIVE_INFINITY;

  constructor() {}

  init(): void {
    // michael: debug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).world = this;

    this._initOverlay();
  }

  update(): void {
    // build tile layers
    if (this.tileLayerQueue.length && time - this._lastBuildTileLayer > 0.05) {
      this._lastBuildTileLayer = time;
      // const { sectorVector, cliff } = this.tileLayerQueue.shift()!;
      // this._buildSectorLayer(sectorVector, cliff);
      return;
    }

    const unitPos = this.unit?.getCenterOfMass() ?? vec2();
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
    const unitPos = this.unit?.getCenterOfMass() ?? vec2();
    const unitSectorVector = worldToSector(unitPos, this.wc.sectorExtent);

    // reset each sectors minPhase
    for (const sector of this.sectors.values()) {
      sector.degradeMinPhase(phases.at(0)!);
    }

    // advance needed sectors and any dependencies they have
    const upper = this.wc.sectorRenderExtent;
    const lower = -upper;
    for (let y = upper; y >= lower; y--) {
      for (let x = lower; x <= upper; x++) {
        const sectorVector = unitSectorVector.add(vec2(x, y));
        const sector = Sector.getOrCreateSector(sectorVector);
        sector.advanceMinPhase("rails");
        sector.advanceToPhase();
      }
    }

    // michael: debug
    // const sExt = this.wc.sectorExtent;
    // const aExt = sExt * 3 + 1;
    // for (const sector of this.sectors.values()) {
    //   if (phase2Idx[sector._phase] < phase2Idx["obstacles"]) continue;
    //   for (const [ox, oy] of sector.obstacles) {
    //     const sx = (ox - aExt) / 3;
    //     const sy = (-oy + aExt) / 3;

    //     const sPos = vec2(sx, sy);
    //     const wPos = sPos.add(sector.worldPos);
    //     debugRect(wPos, vec2(1 / 3), undefined, 1);
    //   }
    // }

    // reduce sectors to min phase
    for (const sector of this.sectors.values()) {
      sector.degradeToPhase();
    }
  }

  render(): void {
    // draw debug info for sectors
    if (this.wc.debugSectors) {
      for (const sector of this.sectors.values()) {
        const sectorSize = vec2(this.sectorSize);
        debugRect(sector.worldPos, sectorSize, "#ffffff");
        debugText(sector._phase, sector.worldPos, 0.5, "#ffffff");
      }
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
            sector.degradeMinPhase(phases.at(0)!);
            sector.degradeToPhase();
          }

          this._pwc = this.wc;
          this.wc = config;

          if (this._pwc.topDownPerspective !== this.wc.topDownPerspective) {
            this._perspective = this.wc.topDownPerspective
              ? "topdown"
              : "topdown-oblique";
          }

          setCameraScale(this.wc.cameraZoom);

          if (time > 0.1) {
            this._updateSectors();
          }
        }),
      )
      .subscribe();
  }
}

export const world = new World();
