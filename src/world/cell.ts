import { max, min, tile, vec2, Vector2, type TileInfo } from "littlejsengine";
import {
  DirectionToVectorMap,
  PWDs,
  type OrdinalDirection,
  type PWD,
} from "../core/types/directions.types";
import { quantize } from "../noise/quantize";
import { sectorToWorld, worldToSector } from "./renderers/sectors/sector";
import { f2dmk } from "./world.types";
import { cliffHeightObliqueOffsets } from "./renderers/cliff-height-oblique-offsets";
import { cliffHeightTileOffsets } from "./renderers/cliff-height-tile-offsets";
import { textureIndexMap } from "../textures/texture-index-map";
import { world } from "./world";

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

const rampDirOriginMap: { [key in RampDirection]: Vector2 } = {
  e: vec2(0, 5),
  w: vec2(3, 5),
};

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
  /** The tile for background art "behind" the main tile */
  backgroundTi?: TileInfo;
  /** The tile for background art "behind" the main tile when north cell is ramp */
  backgroundRampTi?: TileInfo;
  /** The tile with the cliff face for this cell if it is elevated cliff */
  cliffFaceTi?: TileInfo;
  /** The tile with the lower ramp for this cell if it is a ramp */
  lowerRampTi?: TileInfo;
  /** The tile with the upper ramp for this cell if it is a ramp */
  upperRampTi?: TileInfo;

  /** Position in world space to draw the background and main tiles */
  mainPos: Vector2;
  /** Position in world space to draw the cliff face tile */
  cliffFacePos?: Vector2;
  /** Position in world space to draw the top upperRamp tile */
  upperRampPos?: Vector2;

  /** flag to render this cell as semi transparent to show units behind it */
  transparent = false;

  constructor(pos: Vector2, noise: number) {
    this.pos = pos;
    this.noise = noise;

    const sectorCenter = sectorToWorld(
      worldToSector(this.pos, world.wc.sectorExtent),
      world.wc.sectorExtent,
    );
    this.offsetSectorCenter = this.pos.subtract(sectorCenter);
    this.tileLayerPos = this.offsetSectorCenter.add(
      vec2(world.wc.sectorExtent),
    );
    this.cliffHeight = quantize(noise, world.wc.cliffHeightBounds);
    world.cells.set(f2dmk(this.pos), this);

    switch (world.perspective) {
      case "topdown":
        this.mainPos = this.pos;
        break;
      case "topdown-oblique":
        this.mainPos = this.pos.add(
          vec2(0, cliffHeightObliqueOffsets[this.cliffHeight]),
        );
        this.cliffFacePos = this.mainPos.add(vec2(0, -1));
        this.upperRampPos = this.mainPos.add(vec2(0, 1));
        break;
    }
  }

  isRamp(): this is { rampDir: RampDirection } {
    return !!this.rampDir;
  }

  getAdjacentCells(): Map<PWD, Cell> {
    const result = new Map<PWD, Cell>();
    for (const dir of PWDs.values()) {
      result.set(dir, this.getAdj(dir));
    }
    return result;
  }

  getAdj(dir: PWD): Cell {
    const adjPos = this.pos.add(DirectionToVectorMap[dir]);
    return world.getCell(adjPos);
  }

  public static getSlope(cell1: Cell, cell2: Cell): number {
    const highNoise = max(cell1.noise, cell2.noise);
    const lowNoise = min(cell1.noise, cell2.noise);
    const noiseDiff = highNoise - lowNoise;

    const highCliff = max(cell1.cliffHeight, cell2.cliffHeight);
    const noiseRange =
      world.wc.cliffHeightBounds[highCliff] -
      world.wc.cliffHeightBounds[highCliff - 2];

    const slope = noiseDiff / noiseRange;
    return slope;
  }

  setTileInfo(): void {
    const adjCells = this.getAdjacentCells();
    const r2w = adjCells.get("w")?.rampDir === "e";
    const r2e = adjCells.get("e")?.rampDir === "w";

    const c2n = this.cliffs?.includes("n");
    const c2s = this.cliffs?.includes("s");
    const c2w = this.cliffs?.includes("w") && !r2w;
    const c2e = this.cliffs?.includes("e") && !r2e;

    const cliffType = this._getCliffType();
    let tilePos = this._getTilePosOrigin();

    // ========================
    // Background Tile
    // ========================
    if (this.cliffHeight !== 0) {
      this.backgroundTi = tile(
        tilePos.add(cliffHeightTileOffsets[this.cliffHeight - 1]),
        cellTextureSize,
        textureIndexMap["terrain/All_Tilemaps.png"],
      );
    }

    // ========================
    // Main Tile
    // ========================

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
      tilePos.add(cliffHeightTileOffsets[this.cliffHeight]),
      cellTextureSize,
      textureIndexMap["terrain/All_Tilemaps.png"],
    );

    // ========================
    // Cliff Face Tile
    // ========================
    if (this.cliffHeight > 1 && c2s) {
      tilePos = tilePos.add(this._getCliffFaceOffset(c2n, c2s));
      this.cliffFaceTi = tile(
        tilePos.add(cliffHeightTileOffsets[this.cliffHeight]),
        cellTextureSize,
        textureIndexMap["terrain/All_Tilemaps.png"],
      );
    }

    // ========================
    // Ramp Tiles
    // ========================
    if (this.isRamp()) {
      tilePos = rampDirOriginMap[this.rampDir];
      this.lowerRampTi = tile(
        tilePos.add(cliffHeightTileOffsets[this.cliffHeight + 1]),
        cellTextureSize,
        textureIndexMap["terrain/All_Tilemaps.png"],
      );
      tilePos = tilePos.add(vec2(0, -1));
      this.upperRampTi = tile(
        tilePos.add(cliffHeightTileOffsets[this.cliffHeight + 1]),
        cellTextureSize,
        textureIndexMap["terrain/All_Tilemaps.png"],
      );
    }
    const nCell = this.getAdj("n");
    if (nCell.isRamp()) {
      tilePos = rampDirOriginMap[nCell.rampDir];
      this.backgroundRampTi = tile(
        tilePos.add(cliffHeightTileOffsets[this.cliffHeight]),
        cellTextureSize,
        textureIndexMap["terrain/All_Tilemaps.png"],
      );
    }
  }

  private _getCliffType(): CliffType {
    return this.cliffHeight > 1 ? "grass" : "water";
  }

  private _getTilePosOrigin(): Vector2 {
    return cliffTypeOriginMap[this._getCliffType()];
  }

  private _getCliffFaceOffset(
    cliffToNorth: boolean | undefined,
    cliffToSouth: boolean | undefined,
  ): Vector2 {
    if (cliffToNorth && cliffToSouth) {
      return vec2(0, -1);
    }
    return vec2(0, 1);
  }

  /** Tile offset for situations when it is a north AND south cliff */
  private _getOffsetForBoth(axis: Axis, cliffType: CliffType): Vector2 {
    const scalar = cliffType === "grass" && axis === "y" ? 3 : 2;
    const vector = axis === "x" ? vec2(scalar, 0) : vec2(0, scalar);
    return vector;
  }
}
