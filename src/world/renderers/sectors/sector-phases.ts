import { vec2, Vector2 } from "littlejsengine";
import { f2dmk } from "../../world.types";
import { sectorToWorld, type AstarObs, type Sector } from "./sector";
import { generateNoiseMap } from "../../../noise/generate-noise-map";
import { Cell, rampDirections } from "../../cell";
import type { CliffRenderer } from "../cliff-renderer";
import { TdDrawTileCliffRenderer } from "../td-draw-tile-cliff-renderer";
import { TdDrawRectCliffRenderer } from "../td-draw-rect-cliff-renderer";
import { TdoDrawTileCliffRenderer } from "../tdo-draw-tile-cliff-renderer";
import { TdoDrawRectCliffRenderer } from "../tdo-draw-rect-cliff-renderer";
import { type OrdinalDirection } from "../../../core/types/directions.types";
import { Rail } from "../../rail";
import { world } from "../../world.al";

export const phases = [
  "bare",
  "noise",
  "cliffs",
  "ramps",
  "obstacles",
  "renderers",
  "rails",
] as const;
export type Phase = (typeof phases)[number];
/** Phase to index */
export const phase2Idx = Object.fromEntries(
  phases.map((phase, index) => [phase, index]),
) as { [K in Phase]: number };

export type PhaseFn = (sector: Sector) => void;

export const degradeFromPhaseFns: { [key in Phase]: PhaseFn } = {
  bare: degradeFromBare,
  noise: degradeFromNoise,
  cliffs: degradeFromCliffs,
  ramps: degradeFromRamps,
  obstacles: degradeFromObstacles,
  renderers: degradeFromRenderers,
  rails: degradeFromRails,
};

export const advanceToPhaseFns: { [key in Exclude<Phase, "bare">]: PhaseFn } = {
  noise: advanceToNoise,
  cliffs: advanceToCliffs,
  ramps: advanceToRamps,
  obstacles: advanceToObstacles,
  renderers: advanceToRenderers,
  rails: advanceToRails,
};

// ===================================
// Degrade From
// ===================================

export function degradeFromBare(sector: Sector): void {
  sector.destroy();
}

export function degradeFromNoise(sector: Sector): void {
  // delete cells
  for (const cell of sector.cells) {
    world.cells.delete(f2dmk(cell.pos));
  }
  sector.cells = [];

  // destroy sector
  sector.destroy();
}

export function degradeFromCliffs(sector: Sector): void {
  for (const cell of sector.cells) {
    cell.cliffs = undefined;
  }
}

export function degradeFromRamps(sector: Sector): void {
  for (const cell of sector.cells) {
    cell.rampDir = undefined;
  }
}

export function degradeFromObstacles(sector: Sector): void {
  sector.obstacles = [];
}

export function degradeFromRenderers(sector: Sector): void {
  for (const renderer of sector.renderers) {
    renderer.destroy();
  }
  sector.renderers = [];

  for (const cell of sector.cells) {
    cell.mainTi = undefined;
    cell.backgroundTi = undefined;
    cell.cliffFaceTi = undefined;
    cell.lowerRampTi = undefined;
    cell.upperRampTi = undefined;
  }
}

export function degradeFromRails(sector: Sector): void {
  for (const rail of sector.rails) {
    rail.destroy();
  }
  sector.rails = [];
}

// ===================================
// Advance To
// ===================================

export function advanceToNoise(sector: Sector): void {
  // generate noise
  const offset = sectorToWorld(sector.pos, world.wc.sectorExtent).add(
    vec2(world.wc.tnOffsetX, world.wc.tnOffsetY),
  );
  const noiseMap = generateNoiseMap(
    world.wc.seed,
    world.sectorSize,
    world.sectorSize,
    world.wc.tnScale,
    world.wc.tnOctaves,
    world.wc.tnPersistance,
    world.wc.tnLacunarity,
    offset,
    world.wc.tnClamp,
  );

  // create cells
  const upper = world.wc.sectorExtent;
  const lower = -upper;
  for (let y = upper; y >= lower; y--) {
    for (let x = lower; x <= upper; x++) {
      const pos = sector.worldPos.add(vec2(x, y));
      const { x: nx, y: ny } = vec2(x, y).add(vec2(world.wc.sectorExtent));
      const noise = noiseMap[nx][ny];
      sector.cells.push(new Cell(pos, noise));
    }
  }
}

export function advanceToCliffs(sector: Sector): void {
  sector.advanceAdjSectorsTo("noise");

  // place cliffs
  for (const cell of sector.cells) {
    cell.cliffs = [];
    for (const [dir, adjCell] of cell.getAdjacentCells().entries()) {
      if (adjCell.cliffHeight < cell.cliffHeight) {
        cell.cliffs!.push(dir);
      }
    }
    cell.cliffs = cell.cliffs.length ? cell.cliffs : undefined;
  }
}

export function advanceToRamps(sector: Sector): void {
  sector.advanceAdjSectorsTo("cliffs");

  // place ramps
  for (const cell of sector.cells) {
    // cannot ramp into/out of water
    if (cell.cliffHeight < 1) continue;

    for (const dir of rampDirections) {
      const oppositeDir = dir === "e" ? "w" : "e";
      const adjCell = cell.getAdj(dir);

      // ramp must be next to a cliff
      const adjIsCliff = (adjCell.cliffs ?? []).includes(oppositeDir);
      if (!adjIsCliff) continue;

      // ramp must lead somewhere (have a "landing" on both sides, not ramps, and correct heights)
      const highLandingCell = adjCell.getAdj(dir);
      const lowLandingCell = cell.getAdj(oppositeDir);
      if (
        highLandingCell.cliffHeight !== adjCell.cliffHeight ||
        highLandingCell.rampDir !== undefined ||
        lowLandingCell.cliffHeight !== cell.cliffHeight ||
        lowLandingCell.rampDir !== undefined
      )
        continue;

      // ramps must pass slope threshold
      const slope = Cell.getSlope(cell, adjCell);
      if (slope > world.wc.rampSlopeThreshold) continue;

      // yay! it's a ramp
      cell.rampDir = dir;
      break; // ramp directions loop, not cells loop
    }
  }
}

export function advanceToObstacles(sector: Sector): void {
  sector.advanceAdjSectorsTo("ramps");

  for (const cell of sector.cells) {
    // cliff to the north/south/east/west
    const c2n =
      cell.cliffs?.includes("n") || cell.getAdj("n").cliffs?.includes("s");
    const c2s =
      cell.cliffs?.includes("s") || cell.getAdj("s").cliffs?.includes("n");
    const c2w =
      cell.cliffs?.includes("w") || cell.getAdj("w").cliffs?.includes("e");
    const c2e =
      cell.cliffs?.includes("e") || cell.getAdj("e").cliffs?.includes("w");

    // ramp to the north/south
    const rp2n =
      (cell.isRamp() || cell.getAdj("n").isRamp()) &&
      cell.rampDir !== cell.getAdj("n").rampDir;
    const rp2s =
      (cell.isRamp() || cell.getAdj("s").isRamp()) &&
      cell.rampDir !== cell.getAdj("s").rampDir;

    // ramp to the west/east
    const rp2w = cell.getAdj("w")?.rampDir === "e";
    const rp2e = cell.getAdj("e")?.rampDir === "w";

    // obstacles to the north/south/east/west
    const o2n = c2n || rp2n;
    const o2s = c2s || rp2s;
    const o2w = c2w && !rp2w && !cell.isRamp();
    const o2e = c2e && !rp2e && !cell.isRamp();

    const slots = new Set<number>();
    if (o2n) {
      slots.add(0);
      slots.add(1);
      slots.add(2);
    }
    if (o2s) {
      slots.add(6);
      slots.add(7);
      slots.add(8);
    }
    if (o2w) {
      slots.add(0);
      slots.add(3);
      slots.add(6);
    }
    if (o2e) {
      slots.add(2);
      slots.add(5);
      slots.add(8);
    }

    const obs: [number, number][] = [];
    for (const slot of slots) {
      obs.push([slot % 3, Math.floor(slot / 3)]);
    }

    cellObsToSectorObs(obs, cell.offsetSectorCenter, world.wc.sectorExtent);

    // performance optimized insert
    for (let i = 0; i < obs.length; i++) {
      sector.obstacles.push(obs[i]);
    }
  }
}

/** transform in-place */
function cellObsToSectorObs(
  cellObs: AstarObs,
  cellSectorOffset: Vector2,
  sectorExtent: number,
): void {
  const xOffset = (cellSectorOffset.x + sectorExtent) * 3;
  const yOffset = (-cellSectorOffset.y + sectorExtent) * 3;

  for (const obs of cellObs) {
    obs[0] = obs[0] + xOffset;
    obs[1] = obs[1] + yOffset;
  }
}

export function advanceToRenderers(sector: Sector): void {
  sector.advanceAdjSectorsTo("ramps");

  // queue layers
  // for (
  //   let cliff = 0;
  //   cliff <= this._world.wc.cliffHeightBounds.length;
  //   cliff++
  // ) {
  //   this._world.tileLayerQueue.push({ sectorVector: this.pos, cliff });
  // }

  // michael: improve: switch to layer-by-cliff after frank's updates to tile layer redraw performance
  // this._world.tileLayerQueue.push({ sectorVector: this.pos, cliff: 0 });

  for (const cell of sector.cells) {
    cell.setTileInfo();
  }

  const tpdn = world.perspective === "topdown";
  const tiles = world.wc.useTiles;
  for (
    let cliffHeight = 0;
    cliffHeight <= world.wc.cliffHeightBounds.length;
    cliffHeight++
  ) {
    let renderer: CliffRenderer;
    switch (true) {
      case tpdn && tiles:
        renderer = new TdDrawTileCliffRenderer(sector, cliffHeight);
        break;
      case tpdn && !tiles:
        renderer = new TdDrawRectCliffRenderer(sector, cliffHeight);
        break;
      case !tpdn && tiles:
        renderer = new TdoDrawTileCliffRenderer(sector, cliffHeight);
        break;
      case !tpdn && !tiles:
        renderer = new TdoDrawRectCliffRenderer(sector, cliffHeight);
        break;
    }
    sector.renderers.push(renderer!);
  }
}

export function advanceToRails(sector: Sector): void {
  const offsetScalar: number = 0.49; // do not go outside cell or getCell will get mad (adapter code)
  const thickScalar: number = 0.1;
  for (const cell of sector.cells) {
    const adjCells = cell.getAdjacentCells();
    // ramp to the west/east
    const rp2w = adjCells.get("w")?.rampDir === "e";
    const rp2e = adjCells.get("e")?.rampDir === "w";

    // cliff to the north/south/east/west
    const c2n = cell.cliffs?.includes("n") ?? false;
    const c2s = cell.cliffs?.includes("s") ?? false;
    const c2w = cell.cliffs?.includes("w") ?? false;
    const c2e = cell.cliffs?.includes("e") ?? false;

    const rampHere = !!cell.rampDir;
    const rampJoinsNorth = cell.rampDir === adjCells.get("n")?.rampDir;
    const rampJoinsSouth = cell.rampDir === adjCells.get("s")?.rampDir;

    // rail to the north/south/east/west
    const rl2n = c2n || (rampHere && !rampJoinsNorth);
    const rl2s = c2s || (rampHere && !rampJoinsSouth);
    const rl2w = c2w && !rp2w;
    const rl2e = c2e && !rp2e;

    const dirs: OrdinalDirection[] = [];
    if (rl2n) dirs.push("n");
    if (rl2s) dirs.push("s");
    if (rl2w) dirs.push("w");
    if (rl2e) dirs.push("e");

    for (const dir of dirs) {
      let pos = cell.pos;
      switch (dir) {
        case "n":
          pos = pos.add(vec2(0, offsetScalar));
          break;
        case "s":
          pos = pos.add(vec2(0, -offsetScalar));
          break;
        case "w":
          pos = pos.add(vec2(-offsetScalar, 0));
          break;
        case "e":
          pos = pos.add(vec2(offsetScalar, 0));
          break;
      }

      let size: Vector2;
      switch (dir) {
        case "n":
        case "s":
          size = vec2(1, thickScalar);
          break;
        case "e":
        case "w":
          size = vec2(thickScalar, 1);
          break;
      }

      const rail = new Rail(pos, cell.rampDir, size);
      sector.rails.push(rail);
    }
  }
}
