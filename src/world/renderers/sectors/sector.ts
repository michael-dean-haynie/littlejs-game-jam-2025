import {
  DirectionToVectorMap,
  PWDs,
  type PWD,
} from "../../../core/types/directions.types";
import { noCap } from "../../../core/util/no-cap";
import { Cell } from "../../cell";
import { CliffRenderer } from "../cliff-renderer";
import { f2dmk } from "../../world.types";
import {
  advanceToPhaseFns,
  degradeFromPhaseFns,
  phase2Idx,
  phaseDependencies,
  phases,
  type Phase,
} from "./sector-phases";
import { world } from "../../world.al";
import {
  clamp,
  Color,
  debugRect,
  EngineObject,
  max,
  min,
  vec2,
  type Vector2,
} from "littlejsengine";
import type { AstarObs } from "../../pathing";

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
  private _advanceInProgress = false;

  constructor(pos: Vector2) {
    this.pos = pos;
    this.worldPos = sectorToWorld(pos, world.wc.sectorExtent);
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
    return Sector.getOrCreateSector(adjPos);
  }

  destroy(): void {
    if (this._phase !== "noise") {
      this.degradeToPhase("bare");
    }
    world.sectors.delete(f2dmk(this.pos));
  }

  advanceAdjSectorsTo(phase: Phase) {
    for (const adjSector of this.getAdjacentSectors().values()) {
      adjSector.advanceToPhase(phase);
    }
  }

  advanceMinPhase(targetPhase: Phase): void {
    this._minPhase =
      phases[max(phase2Idx[this._minPhase], phase2Idx[targetPhase])];
  }

  degradeMinPhase(targetPhase: Phase): void {
    this._minPhase =
      phases[min(phase2Idx[this._minPhase], phase2Idx[targetPhase])];
  }

  advanceToPhase(targetPhase: Phase) {
    if (this._advanceInProgress) return;

    // update one phase at a time
    while (phase2Idx[this._minPhase] < phase2Idx[targetPhase]) {
      this._advance1Phase();
    }
  }

  degradeToPhase(targetPhase: Phase) {
    if (this._phase === "bare") this.destroy();

    // do not degrade past minPhase
    targetPhase =
      phases[max(phase2Idx[this._minPhase], phase2Idx[targetPhase])];

    // degrade one phase at a time
    while (
      phase2Idx[this._phase] > phase2Idx[targetPhase] ||
      phase2Idx[this._minPhase] > phase2Idx[targetPhase]
    ) {
      this._degrade1Phase();
    }
  }

  private _degrade1Phase(): void {
    const newPhaseIdx = clamp(phase2Idx[this._phase] - 1, 0, phases.length - 1);
    const newPhase = phases[newPhaseIdx];

    const degradeFn = degradeFromPhaseFns[this._phase];
    degradeFn(this);
    this._debugDegradeSector();

    this._phase = newPhase;
    this.degradeMinPhase(newPhase);
  }

  private _advance1Phase(): void {
    this._advanceInProgress = true;

    const newPhaseIdx = clamp(
      phase2Idx[this._minPhase] + 1,
      0,
      phases.length - 1,
    );
    const newPhase = phases[newPhaseIdx];

    // advance dependencies
    const dependency = phaseDependencies[newPhase];
    if (dependency) {
      this.advanceAdjSectorsTo(dependency);
    }

    // advance minPhase
    this.advanceMinPhase(newPhase);

    // only actually advance phase if it is below minPhase
    if (phase2Idx[this._phase] < phase2Idx[newPhase] && newPhase !== "bare") {
      const advanceFn = advanceToPhaseFns[newPhase];
      advanceFn(this);
      this._phase = newPhase;
      this._debugAdvanceSector();
    }

    this._advanceInProgress = false;
  }

  private _debugAdvanceSector(): void {
    if (import.meta.env.PROD) return;
    if (world.wc.debugSectors) {
      debugRect(
        this.worldPos,
        vec2(world.sectorSize),
        new Color(0, 1, 0, 0.2) as unknown as string,
        1,
        undefined,
        true,
      );
    }
  }

  private _debugDegradeSector(): void {
    if (import.meta.env.PROD) return;
    if (world.wc.debugSectors) {
      debugRect(
        this.worldPos,
        vec2(world.sectorSize),
        new Color(1, 0, 0, 0.2) as unknown as string,
        1,
        undefined,
        true,
      );
    }
  }

  public static getOrCreateSector(sectorVector: Vector2): Sector {
    let sector = world.sectors.get(f2dmk(sectorVector));
    if (sector !== undefined) return sector;
    sector = new Sector(sectorVector);
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
