import {
  DirectionToVectorMap,
  PWDs,
  type PWD,
} from "../../../core/types/directions.types";
import { noCap } from "../../../core/util/no-cap";
import { max, min, vec2 } from "../../../littlejsengine/littlejsengine.pure";
import type {
  EngineObject,
  Vector2,
} from "../../../littlejsengine/littlejsengine.types";
import { Cell } from "../../cell";
import { CliffRenderer } from "../cliff-renderer";
import { f2dmk, type IWorld } from "../../world.types";
import {
  advanceToPhaseFns,
  degradeFromPhaseFns,
  phase2Idx,
  phases,
  type Phase,
} from "./sector-phases";

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
export type AstarObs = [number, number][];

export class Sector {
  /** Position in sector-space */
  pos: Vector2;
  /** Position in world-space */
  worldPos: Vector2;
  /** Current level of detail calculted for this sector */
  _phase: Phase = "bare";
  /** Phase of rendering that this sector is needed for */
  _minPhase: Phase = "bare";
  /** Cells in this sector, pre-sorted for rendering */
  cells: Cell[] = [];
  /** a* path-finding obstacles */
  obstacles: AstarObs = [];
  /** Renderers by cliff height? Or render order? */
  renderers: CliffRenderer[] = [];
  /** Engine objects that act as "rails" or cliff edges for collision/pathing */
  rails: EngineObject[] = [];

  /** For preventing co-recursion between adjacent cells with dependencies */
  private _waitingOnDependencies = false;

  world: IWorld;

  constructor(pos: Vector2, world: IWorld) {
    this.pos = pos;
    this.world = world;
    this.worldPos = sectorToWorld(pos, this.world.wc.sectorExtent);
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
    return Sector.getOrCreateSector(adjPos, this.world);
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
    if (this._waitingOnDependencies) return;
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
    this.world.sectors.delete(f2dmk(this.pos));
  }

  advanceAdjSectorsTo(phase: Phase) {
    this._waitingOnDependencies = true;
    for (const adjSector of this.getAdjacentSectors().values()) {
      adjSector.advanceMinPhase(phase);
      adjSector.advanceToPhase();
    }
    this._waitingOnDependencies = false;
  }

  private _degrade1Phase(): void {
    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths = (window as any).paths ?? new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).paths = paths;
    if (paths.get(this.pos.toString()) === undefined) {
      paths.set(this.pos.toString(), []);
    }

    const degradeFn = degradeFromPhaseFns[this._phase];
    this._phase = phases[phase2Idx[this._phase] - 1] ?? phases.at(0);
    degradeFn(this);

    // michael: remove
    paths.get(this.pos.toString())!.push(this._phase);
  }

  private _advance1Phase(): void {
    // michael: remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paths = (window as any).paths ?? new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).paths = paths;
    if (paths.get(this.pos.toString()) === undefined) {
      paths.set(this.pos.toString(), []);
    }

    this._phase = phases[phase2Idx[this._phase] + 1] ?? phases.at(-1);
    if (this._phase === "bare") return;
    const advanceFn = advanceToPhaseFns[this._phase];
    advanceFn(this);

    // michael: remove
    paths.get(this.pos.toString())!.push(this._phase);
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
