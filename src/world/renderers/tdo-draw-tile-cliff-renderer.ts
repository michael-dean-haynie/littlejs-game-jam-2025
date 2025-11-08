import { drawTile } from "littlejsengine";
import { CliffRenderer } from "./cliff-renderer";
import { cellWorldSize } from "../cell";

/** Cliff Renderer using drawTile() with Top-Down-Oblique perspective */
export class TdoDrawTileCliffRenderer extends CliffRenderer {
  override render(): void {
    for (const cell of this._sector.cells) {
      // render any cliff face tiles right below this cliff height
      if (
        cell.cliffHeight - 1 === this._cliffHeight &&
        cell.cliffFaceTi !== undefined
      ) {
        drawTile(cell.cliffFacePos!, cellWorldSize, cell.backgroundTi);
        drawTile(cell.cliffFacePos!, cellWorldSize, cell.cliffFaceTi);
      }

      // render any main/lower-ramp tiles at this cliffHeight
      if (cell.cliffHeight === this._cliffHeight) {
        // main/ramp
        if (this._cliffHeight === 0) {
          this._drawWater(cell.mainPos);
        } else {
          drawTile(cell.mainPos, cellWorldSize, cell.mainTi);
        }
      }

      // render any upper-ramp tiles above this cliffHeight
      if (
        cell.cliffHeight + 1 === this._cliffHeight &&
        cell.rampDir !== undefined
      ) {
        drawTile(cell.upperRampPos!, cellWorldSize, cell.upperRampTi);
      }

      // // at background cliff height
      // const backgroundCliffHeight = cell.cliffHeight - 1;
      // if (backgroundCliffHeight === this._cliffHeight) {
      //   if (backgroundCliffHeight === 0) {
      //     drawRect(
      //       cell.mainPos,
      //       cellWorldSize,
      //       cliffHeightColors[this._cliffHeight],
      //     );
      //   } else {
      //     drawTile(cell.mainPos, cellWorldSize, cell.backgroundTi);
      //   }
      // }

      // // at cliff height
      // if (cell.cliffHeight === this._cliffHeight) {
      //   if (this._cliffHeight === 0) {
      //     drawRect(
      //       cell.mainPos,
      //       cellWorldSize,
      //       cliffHeightColors[this._cliffHeight],
      //     );
      //   } else {
      //     drawTile(cell.mainPos, cellWorldSize, cell.mainTi);
      //   }
      // }
    }
  }
}
