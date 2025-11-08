import { drawRect } from "littlejsengine";
import { CliffRenderer } from "./cliff-renderer";
import { cellWorldSize } from "../cell";
import { cliffHeightColors } from "./cliff-height-colors";

/** Cliff Renderer using drawRect() with Top-Down perspective */
export class TdDrawRectCliffRenderer extends CliffRenderer {
  override render(): void {
    for (const cell of this._sector.cells) {
      if (cell.cliffHeight === this._cliffHeight) {
        drawRect(
          cell.mainPos,
          cellWorldSize,
          cliffHeightColors[this._cliffHeight],
        );
      }
    }
  }
}
