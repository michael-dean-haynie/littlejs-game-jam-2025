import { drawTile } from "littlejsengine";
import { CliffRenderer } from "./cliff-renderer";
import { cellWorldSize } from "../cell";

/** Cliff Renderer using drawTile() with Top-Down perspective */
export class TdDrawTileCliffRenderer extends CliffRenderer {
  override render(): void {
    for (const cell of this._sector.cells) {
      // at background cliff height
      const backgroundCliffHeight = cell.cliffHeight - 1;
      if (backgroundCliffHeight === this._cliffHeight) {
        if (backgroundCliffHeight === 0) {
          this._drawWater(cell.mainPos);
        } else {
          drawTile(cell.mainPos, cellWorldSize, cell.backgroundTi);
        }
      }

      // at cliff height (main or ramp?)
      if (cell.cliffHeight === this._cliffHeight) {
        if (this._cliffHeight === 0) {
          this._drawWater(cell.mainPos);
        } else {
          drawTile(cell.mainPos, cellWorldSize, cell.mainTi);
          if (cell.rampDir !== undefined) {
            drawTile(cell.mainPos, cellWorldSize, cell.upperRampTi);
          }
        }
      }
    }
  }
}
