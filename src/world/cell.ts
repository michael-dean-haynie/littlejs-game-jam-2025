import { tile, type TileInfo } from "littlejsengine";
import {
  DirectionToVectorMap,
  PWDs,
  type OrdinalDirection,
  type PWD,
} from "../core/types/directions.types";
import { max, min, vec2 } from "../littlejsengine/littlejsengine.pure";
import type { Vector2 } from "../littlejsengine/littlejsengine.types";
import { quantize } from "../noise/quantize";
import { sectorToWorld, worldToSector } from "./sector";
import { f2dmk, type IWorld } from "./world.types";
import { cliffHieghtTextureIndexMap } from "./renderers/cliff-height-textures";
import { cliffHeightObliqueOffsets } from "./renderers/cliff-height-oblique-offsets";

export type Axis = "x" | "y";
/** Whether the lower level is grass or water (NOTE: not supporting water directly to cliff face for now)*/
export type CliffType = "water" | "grass";

export const cliffTypeOriginMap: { [key in CliffType]: Vector2 } = {
  water: vec2(1),
  grass: vec2(6, 1),
};

/** Cell size in world units */
export const cellWorldSize = vec2(1);
/** Cell size in pixels */
export const cellTextureSize = vec2(64);

export const rampDirections = ["w", "e"] as const satisfies OrdinalDirection[];
export type RampDirection = (typeof rampDirections)[number];

export class Cell {
  /** Position in world-space */
  pos: Vector2;
  /** Position relative to center of sector */
  offsetSectorCenter: Vector2;
  /** Position relative to origin of the tile layer (bottom left) */
  tileLayerPos: Vector2;
  /** Raw noise value for generating terrain */
  noise: number;
  /** Cliff height - result of quantized noise value */
  cliffHeight: number;
  /** Which sides of this cell are cliffs (this cell being higher than the adjacent) */
  cliffs?: PWD[];
  /** If this cell is a ramp, the direction it faces (ascending) */
  rampDir?: RampDirection;

  /** The tile with the main cliff art (the spot where unit would stand) */
  mainTi?: TileInfo;
  /** The tile for background art "behind" the main tile (based on perspective) */
  backgroundTi?: TileInfo;
  /** The tile with the cliff face for this tile if it is elevated cliff */
  cliffFaceTi?: TileInfo;

  /** Position in world space to draw the background and main tiles */
  mainPos: Vector2;
  /** Position in world space to draw the cliff face tile */
  cliffFacePos?: Vector2;

  private readonly _world: IWorld;

  constructor(pos: Vector2, noise: number, world: IWorld) {
    this.pos = pos;
    this.noise = noise;
    this._world = world;

    const sectorCenter = sectorToWorld(
      worldToSector(this.pos, this._world.wc.sectorExtent),
      this._world.wc.sectorExtent,
    );
    this.offsetSectorCenter = this.pos.subtract(sectorCenter);
    this.tileLayerPos = this.offsetSectorCenter.add(
      vec2(this._world.wc.sectorExtent),
    );
    this.cliffHeight = quantize(noise, this._world.wc.cliffHeightBounds);
    this._world.cells.set(f2dmk(this.pos), this);

    switch (this._world.perspective) {
      case "topdown":
        this.mainPos = this.pos;
        break;
      case "topdown-oblique":
        this.mainPos = this.pos.add(
          vec2(0, cliffHeightObliqueOffsets[this.cliffHeight]),
        );
        this.cliffFacePos = this.mainPos.add(vec2(0, -1));
        break;
    }
  }

  getAdjacentCells(): Map<PWD, Cell> {
    const result = new Map<PWD, Cell>();
    for (const dir of PWDs.values()) {
      result.set(dir, this.getAdjacentCell(dir));
    }
    return result;
  }

  getAdjacentCell(dir: PWD): Cell {
    const adjPos = this.pos.add(DirectionToVectorMap[dir]);
    return this._world.getCell(adjPos);
  }

  public static getSlope(cell1: Cell, cell2: Cell): number {
    const highNoise = max(cell1.noise, cell2.noise);
    const lowNoise = min(cell1.noise, cell2.noise);
    const noiseDiff = highNoise - lowNoise;

    const highCliff = max(cell1.cliffHeight, cell2.cliffHeight);
    const noiseRange =
      cell1._world.wc.cliffHeightBounds[highCliff] -
      cell1._world.wc.cliffHeightBounds[highCliff - 2];

    const slope = noiseDiff / noiseRange;
    return slope;
  }

  setTileInfo(): void {
    this._setMainTileInfo();
    this._setBackgroundTileInfo();
    this._setCliffFaceTileInfo();
  }

  private _setMainTileInfo(): void {
    const cliffType = this._getCliffType();
    let tilePos = this._getTilePosOrigin();

    const c2n = this.cliffs?.includes("n");
    const c2s = this.cliffs?.includes("s");
    const c2w = this.cliffs?.includes("w");
    const c2e = this.cliffs?.includes("e");

    // y offset
    if (c2n && c2s) {
      tilePos = tilePos.add(this._getOffsetForBoth("y", cliffType));
    } else if (c2s) {
      tilePos = tilePos.add(vec2(0, 1));
    } else if (c2n) {
      tilePos = tilePos.add(vec2(0, -1));
    }

    // x offset
    if (c2e && c2w) {
      tilePos = tilePos.add(this._getOffsetForBoth("x", cliffType));
    } else if (c2e) {
      tilePos = tilePos.add(vec2(1, 0));
    } else if (c2w) {
      tilePos = tilePos.add(vec2(-1, 0));
    }

    this.mainTi = tile(
      tilePos,
      cellTextureSize,
      cliffHieghtTextureIndexMap[this.cliffHeight],
    );
  }

  private _setBackgroundTileInfo(): void {
    const tilePos = this._getTilePosOrigin();
    if (this.cliffHeight === 0) return;

    const subCliffHeight = this.cliffHeight - 1;
    this.backgroundTi = tile(
      tilePos,
      cellTextureSize,
      cliffHieghtTextureIndexMap[subCliffHeight],
    );
  }

  private _setCliffFaceTileInfo(): void {
    // const tilePos = this._getTilePosOrigin();
    // if (this.cliffHeight === 0) return;
    // const subCliffHeight = this.cliffHeight - 1;
    // this.subTileInfo = tile(
    //   tilePos,
    //   cellTextureSize,
    //   cliffHieghtTextureIndexMap[subCliffHeight],
    // );
  }

  private _getCliffType(): CliffType {
    return this.cliffHeight > 1 ? "grass" : "water";
  }

  private _getTilePosOrigin(): Vector2 {
    return cliffTypeOriginMap[this._getCliffType()];
  }

  /** Tile offset for situations when it is a north AND south cliff */
  private _getOffsetForBoth(axis: Axis, cliffType: CliffType): Vector2 {
    const scalar = cliffType === "grass" && axis === "y" ? 3 : 2;
    const vector = axis === "x" ? vec2(scalar, 0) : vec2(0, scalar);
    return vector;
  }
}
