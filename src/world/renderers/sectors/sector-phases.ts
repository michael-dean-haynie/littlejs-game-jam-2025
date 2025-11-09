import { vec2, Vector2 } from "littlejsengine";
import { f2dmk } from "../../world.types";
import { sectorToWorld, type Sector } from "./sector";
import { generateNoiseMap } from "../../../noise/generate-noise-map";
import { Cell, rampDirections } from "../../cell";
import type { CliffRenderer } from "../cliff-renderer";
import { TdDrawTileCliffRenderer } from "../td-draw-tile-cliff-renderer";
import { TdDrawRectCliffRenderer } from "../td-draw-rect-cliff-renderer";
import { TdoDrawTileCliffRenderer } from "../tdo-draw-tile-cliff-renderer";
import { TdoDrawRectCliffRenderer } from "../tdo-draw-rect-cliff-renderer";
import { type OrdinalDirection } from "../../../core/types/directions.types";
import { Rail } from "../../../littlejsengine/box2d/rail";

export const phases = [
  "bare",
  "noise",
  "cliffs",
  "ramps",
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
  renderers: degradeFromRenderers,
  rails: degradeFromRails,
};

export const advanceToPhaseFns: { [key in Exclude<Phase, "bare">]: PhaseFn } = {
  noise: advanceToNoise,
  cliffs: advanceToCliffs,
  ramps: advanceToRamps,
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
    sector.world.cells.delete(f2dmk(cell.pos));
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
  const offset = sectorToWorld(sector.pos, sector.world.wc.sectorExtent).add(
    vec2(sector.world.wc.tnOffsetX, sector.world.wc.tnOffsetY),
  );
  const noiseMap = generateNoiseMap(
    sector.world.wc.seed,
    sector.world.sectorSize,
    sector.world.sectorSize,
    sector.world.wc.tnScale,
    sector.world.wc.tnOctaves,
    sector.world.wc.tnPersistance,
    sector.world.wc.tnLacunarity,
    offset,
    sector.world.wc.tnClamp,
  );

  // create cells
  const upper = sector.world.wc.sectorExtent;
  const lower = -upper;
  for (let y = upper; y >= lower; y--) {
    for (let x = lower; x <= upper; x++) {
      const pos = sector.worldPos.add(vec2(x, y));
      const { x: nx, y: ny } = vec2(x, y).add(
        vec2(sector.world.wc.sectorExtent),
      );
      const noise = noiseMap[nx][ny];
      sector.cells.push(new Cell(pos, noise, sector.world));
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
    if (cell.cliffHeight < 2) continue;

    for (const dir of rampDirections) {
      const oppositeDir = dir === "e" ? "w" : "e";
      const adjCell = cell.getAdjacentCell(dir);

      // ramp must be next to a cliff
      const adjIsCliff = (adjCell.cliffs ?? []).includes(oppositeDir);
      if (!adjIsCliff) continue;

      // ramp must lead somewhere (have a "landing" on both sides, not ramps, and correct heights)
      const highLandingCell = adjCell.getAdjacentCell(dir);
      const lowLandingCell = cell.getAdjacentCell(oppositeDir);
      if (
        highLandingCell.cliffHeight !== adjCell.cliffHeight ||
        highLandingCell.rampDir !== undefined ||
        lowLandingCell.cliffHeight !== cell.cliffHeight ||
        lowLandingCell.rampDir !== undefined
      )
        continue;

      // ramps must pass slope threshold
      const slope = Cell.getSlope(cell, adjCell);
      if (slope > sector.world.wc.rampSlopeThreshold) continue;

      // yay! it's a ramp
      cell.rampDir = dir;
      break; // ramp directions loop, not cells loop
    }
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

  // michael: switch to layer-by-cliff after frank's updates to tile layer redraw performance
  // this._world.tileLayerQueue.push({ sectorVector: this.pos, cliff: 0 });

  for (const cell of sector.cells) {
    cell.setTileInfo();
  }

  const tpdn = sector.world.perspective === "topdown";
  const tiles = sector.world.wc.useTiles;
  for (
    let cliffHeight = 0;
    cliffHeight <= sector.world.wc.cliffHeightBounds.length;
    cliffHeight++
  ) {
    let renderer: CliffRenderer;
    switch (true) {
      case tpdn && tiles:
        renderer = new TdDrawTileCliffRenderer(
          sector,
          sector.world,
          cliffHeight,
        );
        break;
      case tpdn && !tiles:
        renderer = new TdDrawRectCliffRenderer(
          sector,
          sector.world,
          cliffHeight,
        );
        break;
      case !tpdn && tiles:
        renderer = new TdoDrawTileCliffRenderer(
          sector,
          sector.world,
          cliffHeight,
        );
        break;
      case !tpdn && !tiles:
        renderer = new TdoDrawRectCliffRenderer(
          sector,
          sector.world,
          cliffHeight,
        );
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
    // ramp to the north/south/west/east
    const rp2n = !!adjCells.get("n")?.rampDir;
    const rp2s = !!adjCells.get("s")?.rampDir;
    const rp2w = adjCells.get("w")?.rampDir === "e";
    const rp2e = adjCells.get("e")?.rampDir === "w";

    // cliff to the north/south/east/west
    const c2n = cell.cliffs?.includes("n");
    const c2s = cell.cliffs?.includes("s");
    const c2w = cell.cliffs?.includes("w") && !rp2w;
    const c2e = cell.cliffs?.includes("e") && !rp2e;

    // rail to the north/south/east/west
    const rl2n = c2n || (!!cell.rampDir && !rp2n);
    const rl2s = c2s || (!!cell.rampDir && !rp2s);
    const rl2w = c2w;
    const rl2e = c2e;

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

      const rail = new Rail(sector.world, cell.rampDir, pos, size);
      sector.rails.push(rail);
    }
  }
}
