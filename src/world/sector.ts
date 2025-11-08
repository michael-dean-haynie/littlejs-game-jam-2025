import {
  DirectionToVectorMap,
  PWDs,
  type PWD,
} from "../core/types/directions.types";
import { noCap } from "../core/util/no-cap";
import { max, min, vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import { generateNoiseMap } from "../noise/generate-noise-map";
import { Cell, rampDirections } from "./cell";
import { CliffRenderer } from "./renderers/cliff-renderer";
import { TdDrawRectCliffRenderer } from "./renderers/td-draw-rect-cliff-renderer";
import { TdDrawTileCliffRenderer } from "./renderers/td-draw-tile-cliff-renderer";
import { f2dmk, type IWorld } from "./world.types";

/** The distance from the center of a sector to the edge (flat side) in world units */
// export const sectorExtent = 5;

// export const sectorSize = extToGridSize(sectorExtent);

/** Converts a sector coordinate to a world coordinate. */
// export function sctr2Wrld(sector: Vector2): Vector2 {
// return sector.scale(sectorSize);
// }

/** Converts a world coordinate to a sector coordinate. */
// export function wrld2Sctr(world: Vector2): Vector2 {
//   return world
//     .add(vec2(sectorSize / 2))
//     .scale(1 / sectorSize)
//     .floor();
// }

/**
 * Centers a grid (with discrete center, odd side length) on zero and returns the bounds (so 11 would be from -5 to 5).
 * This is inclusive.
 */
export function gridSizeToExtent(size: number): number {
  return (size - 1) / 2;
}

/** Get's the key for a coordinate for use in a map. X and Y are expected to be whole numbers. */
export function coordToKey({ x, y }: Vector2): string {
  // noCap(x % 1 === 0, "Expected x to be a whole number.");
  // noCap(y % 1 === 0, "Expected y to be a whole number.");
  x = Math.round(x);
  y = Math.round(y);
  // add zero to avoie -0 situations
  return `${x + 0},${y + 0}`;
}

export function keyToCoord(key: string): Vector2 {
  const [x, y] = key.split(",").map(Number);
  noCap(!isNaN(x), "Expected x to be a number.");
  noCap(!isNaN(y), "Expected y to be a number.");
  noCap(x % 1 === 0, "Expected x to be a whole number.");
  noCap(y % 1 === 0, "Expected y to be a whole number.");
  return vec2(x, y);
}

/**
 * ===========================================================
 * NEW STUFF WITH REWORK
 * ===========================================================
 */

export const phases = [
  "bare",
  "noise",
  "cliffs",
  "ramps",
  "renderers",
] as const;
export type Phase = (typeof phases)[number];
/** Phase to index */
export const phase2Idx = Object.fromEntries(
  phases.map((phase, index) => [phase, index]),
) as { [K in Phase]: number };

export class Sector {
  /** Position in sector-space */
  pos: Vector2;
  /** Position in world-space */
  worldPos: Vector2;
  /** Current level of detail calculted for this sector */
  private _phase: Phase = "bare";
  /** Phase of rendering that this sector is needed for */
  private _minPhase: Phase = "bare";
  /** Cells in this sector, pre-sorted for rendering */
  cells: Cell[] = [];
  /** Renderers by cliff height? Or render order? */
  renderers: CliffRenderer[] = [];

  private _world: IWorld;

  constructor(pos: Vector2, world: IWorld) {
    this.pos = pos;
    this._world = world;
    this.worldPos = sectorToWorld(pos, this._world.wc.sectorExtent);
  }

  getAdjacentSectors(): Map<PWD, Sector> {
    const result = new Map<PWD, Sector>();
    for (const dir of PWDs.values()) {
      result.set(dir, this.getAdjacentSector(dir));
    }
    return result;
  }

  getAdjacentSector(dir: PWD): Sector {
    const adjPos = this.pos.add(DirectionToVectorMap[dir]);
    return Sector.getOrCreateSector(adjPos, this._world);
  }

  advanceMinPhase(targetPhase: Phase): void {
    this._minPhase =
      phases[max(phase2Idx[this._minPhase], phase2Idx[targetPhase])];
  }

  degradeMinPhase(targetPhase: Phase): void {
    this._minPhase =
      phases[min(phase2Idx[this._minPhase], phase2Idx[targetPhase])];
  }

  // will advance to own minPhase by default
  advanceToPhase(targetPhase?: Phase) {
    targetPhase ??= this._minPhase;
    while (phase2Idx[this._phase] < phase2Idx[targetPhase]) {
      this._advance1Phase();
    }
  }

  // will degrade to own minPhase by default
  degradeToPhase(targetPhase?: Phase) {
    targetPhase ??= this._minPhase;
    if (this._phase === "bare") this.destroy();
    while (phase2Idx[this._phase] > phase2Idx[targetPhase]) {
      this._degrade1Phase();
    }
  }

  destroy(): void {
    if (this._phase !== "bare") {
      this.degradeToPhase("bare");
    }
    this._world.sectors.delete(f2dmk(this.pos));
  }

  private _degrade1Phase(): void {
    if (this._phase === "bare") {
      this.destroy();
      return;
    }

    if (this._phase === "noise") {
      // update own phase
      this._phase = "bare";

      // delete cells
      for (const cell of this.cells) {
        this._world.cells.delete(f2dmk(cell.pos));
      }
      this.cells = [];

      // destroy self
      this.destroy();
      return;
    }

    if (this._phase === "cliffs") {
      // update own phase
      this._phase = "noise";

      for (const cell of this.cells) {
        cell.cliffs = undefined;
      }

      return;
    }

    if (this._phase === "ramps") {
      // update own phase
      this._phase = "cliffs";

      for (const cell of this.cells) {
        cell.rampDir = undefined;
      }

      return;
    }

    if (this._phase === "renderers") {
      // update own phase
      this._phase = "ramps";

      for (const renderer of this.renderers) {
        renderer.destroy();
      }

      for (const cell of this.cells) {
        cell.mainTi = undefined;
        cell.backgroundTi = undefined;
        cell.cliffFaceTi = undefined;
      }

      return;
    }
  }

  private _advance1Phase(): void {
    if (this._phase === "bare") {
      // update own phase
      this._phase = "noise";

      // generate noise
      const offset = sectorToWorld(this.pos, this._world.wc.sectorExtent).add(
        vec2(this._world.wc.tnOffsetX, this._world.wc.tnOffsetY),
      );
      const noiseMap = generateNoiseMap(
        this._world.wc.seed,
        this._world.sectorSize,
        this._world.sectorSize,
        this._world.wc.tnScale,
        this._world.wc.tnOctaves,
        this._world.wc.tnPersistance,
        this._world.wc.tnLacunarity,
        offset,
        this._world.wc.tnClamp,
      );

      // create cells
      const upper = this._world.wc.sectorExtent;
      const lower = -upper;
      for (let y = upper; y >= lower; y--) {
        for (let x = lower; x <= upper; x++) {
          const pos = this.worldPos.add(vec2(x, y));
          const { x: nx, y: ny } = vec2(x, y).add(
            vec2(this._world.wc.sectorExtent),
          );
          const noise = noiseMap[nx][ny];
          this.cells.push(new Cell(pos, noise, this._world));
        }
      }
      return;
    }

    if (this._phase === "noise") {
      // update own phase
      this._phase = "cliffs";

      // advance neighbors to noise phase
      for (const sector of this.getAdjacentSectors().values()) {
        sector.advanceMinPhase("noise");
        sector.advanceToPhase();
      }

      // place cliffs
      for (const cell of this.cells) {
        cell.cliffs = [];
        for (const [dir, adjCell] of cell.getAdjacentCells().entries()) {
          if (adjCell.cliffHeight < cell.cliffHeight) {
            cell.cliffs!.push(dir);
          }
        }
        cell.cliffs = cell.cliffs.length ? cell.cliffs : undefined;
      }

      return;
    }

    if (this._phase === "cliffs") {
      // update own phase
      this._phase = "ramps";

      // advance neighbors to cliffs phase
      for (const sector of this.getAdjacentSectors().values()) {
        sector.advanceMinPhase("cliffs");
        sector.advanceToPhase();
      }

      // place ramps
      for (const cell of this.cells) {
        // cannot ramp into/out of water
        if (cell.cliffHeight < 2) continue;

        for (const dir of rampDirections) {
          const oppositeDir = dir === "e" ? "w" : "e";
          const adjCell = cell.getAdjacentCell(dir);

          // ramp must be next to a cliff
          const adjIsCliff = (adjCell.cliffs ?? []).includes(oppositeDir);
          if (!adjIsCliff) continue;

          // ramp must lead somewhere (have a "landing" on both sides)
          const highLandingCell = adjCell.getAdjacentCell(dir);
          const lowLandingCell = cell.getAdjacentCell(oppositeDir);
          if (
            highLandingCell.cliffHeight !== adjCell.cliffHeight ||
            lowLandingCell.cliffHeight !== cell.cliffHeight
          )
            continue;

          // ramps must pass slope threshold
          const slope = Cell.getSlope(cell, adjCell);
          if (slope > this._world.wc.rampSlopeThreshold) continue;

          // yay! it's a ramp
          cell.rampDir = dir;
          break; // ramp directions loop, not cells loop
        }
      }

      return;
    }

    if (this._phase === "ramps") {
      // update own phase
      this._phase = "renderers";

      // advance neighbors to ramps phase
      for (const sector of this.getAdjacentSectors().values()) {
        sector.advanceMinPhase("ramps");
        sector.advanceToPhase();
      }

      // queue layers
      // for (
      //   let cliff = 0;
      //   cliff <= this._world.wc.cliffHeightBounds.length;
      //   cliff++
      // ) {
      //   this._world.tileLayerQueue.push({ sectorVector: this.pos, cliff });
      // }

      // michael: switch to layer-by-cliff after frank's updates to tile layer redraw performance
      // this._world.tileLayerQueue.push({ sectorVector: this.pos, cliff: 0 });

      for (const cell of this.cells) {
        cell.setTileInfo();
      }

      const tpdn = this._world.perspective === "topdown";
      const tiles = this._world.wc.useTiles;
      for (
        let cliffHeight = 0;
        cliffHeight <= this._world.wc.cliffHeightBounds.length;
        cliffHeight++
      ) {
        // default
        let renderer: CliffRenderer = new TdDrawTileCliffRenderer(
          this,
          this._world,
          cliffHeight,
        );
        switch (true) {
          case tpdn && tiles:
            renderer = new TdDrawTileCliffRenderer(
              this,
              this._world,
              cliffHeight,
            );
            break;
          case tpdn && !tiles:
            renderer = new TdDrawRectCliffRenderer(
              this,
              this._world,
              cliffHeight,
            );
            break;
          case !tpdn && tiles:
            renderer = new TdDrawTileCliffRenderer(
              this,
              this._world,
              cliffHeight,
            );
            break;
          case !tpdn && !tiles:
            renderer = new TdDrawRectCliffRenderer(
              this,
              this._world,
              cliffHeight,
            );
            break;
        }
        this.renderers.push(renderer);
      }
      return;
    }
  }

  public static getOrCreateSector(
    sectorVector: Vector2,
    world: IWorld,
  ): Sector {
    let sector = world.sectors.get(f2dmk(sectorVector));
    if (sector !== undefined) return sector;
    sector = new Sector(sectorVector, world);
    world.sectors.set(f2dmk(sectorVector), sector);
    return sector;
  }
}

/**
 * Converts a scalar "extent" into a scalar "size".
 * The "extent" is a whole number which works kind of like a radius.
 * A "size" is the length/width of a square grid.
 * This is mainly for creating a grid with a discrete center (e.g. 1x1, 3x3, 5x5, ...etc).
 */
export function extToGridSize(extent: number) {
  noCap(extent > 0, "Extent should be greater than 0");
  return Math.floor(Math.abs(extent)) * 2 + 1;
}

/** Converts a sector coordinate to a world coordinate. */
export function sectorToWorld(sector: Vector2, sectorExtent: number): Vector2 {
  const sectorSize = extToGridSize(sectorExtent);
  return sector.scale(sectorSize);
}

/** Converts a world coordinate to a sector coordinate. */
export function worldToSector(world: Vector2, sectorExtent: number): Vector2 {
  const sectorSize = extToGridSize(sectorExtent);
  return world
    .add(vec2(sectorSize / 2))
    .scale(1 / sectorSize)
    .floor();
}
