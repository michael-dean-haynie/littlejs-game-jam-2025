import { drawRect, EngineObject, vec2, Vector2 } from "littlejsengine";
import type { Sector } from "./sectors/sector";
import { cellWorldSize } from "../cell";
import { cliffHeightColors } from "./cliff-height-colors";
import { world } from "../world";

export abstract class CliffRenderer extends EngineObject {
  protected readonly _sector: Sector;
  protected readonly _cliffHeight: number;

  constructor(sector: Sector, cliffHeight: number) {
    super(
      sector.worldPos,
      vec2(world.sectorSize),
      undefined,
      undefined,
      undefined,
      cliffHeight,
    );
    this._sector = sector;
    this._cliffHeight = cliffHeight;
  }

  protected _drawWater(pos: Vector2): void {
    drawRect(pos, cellWorldSize, cliffHeightColors[0]);
  }
}
