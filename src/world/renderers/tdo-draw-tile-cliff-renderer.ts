import { Color, drawTile } from "littlejsengine";
import { CliffRenderer } from "./cliff-renderer";
import { cellWorldSize } from "../cell";

const semiTransparent = new Color(1, 1, 1, 0.5);

/** Cliff Renderer using drawTile() with Top-Down-Oblique perspective */
export class TdoDrawTileCliffRenderer extends CliffRenderer {
  override render(): void {
    // debugRect(this._sector.worldPos, vec2(this._world.sectorSize));

    for (const cell of this._sector.cells) {
      // render tiles below the cell's cliff height
      if (cell.cliffHeight - 1 === this._cliffHeight) {
        // background
        if (cell.cliffs?.length ?? false) {
          if (cell.cliffHeight - 1 < 1) {
            this._drawWater(cell.mainPos);
          } else if (cell.backgroundRampTi) {
            drawTile(cell.mainPos, cellWorldSize, cell.backgroundRampTi);
          } else {
            drawTile(cell.mainPos, cellWorldSize, cell.backgroundTi);
          }
        }
        // cliff face
        if (cell.cliffFaceTi !== undefined) {
          drawTile(cell.cliffFacePos!, cellWorldSize, cell.backgroundTi);
          drawTile(cell.cliffFacePos!, cellWorldSize, cell.cliffFaceTi);
        }
      }

      // render any main/lower-ramp tiles at this cliffHeight
      if (cell.cliffHeight === this._cliffHeight) {
        if (cell.rampDir !== undefined) {
          drawTile(cell.mainPos, cellWorldSize, cell.mainTi);
          drawTile(cell.mainPos, cellWorldSize, cell.lowerRampTi);
        } else {
          // main
          if (this._cliffHeight === 0) {
            this._drawWater(cell.mainPos);
          } else {
            // drawTile(cell.mainPos, cellWorldSize, cell.mainTi);
            drawTile(
              cell.mainPos,
              cellWorldSize,
              cell.mainTi,
              cell.transparent ? semiTransparent : undefined,
            );
          }
        }
      }

      // render any upper-ramp tiles above this cliffHeight
      if (
        cell.cliffHeight + 1 === this._cliffHeight &&
        cell.rampDir !== undefined
      ) {
        // drawTile(cell.upperRampPos!, cellWorldSize, cell.upperRampTi);
        drawTile(
          cell.upperRampPos!,
          cellWorldSize,
          cell.upperRampTi,
          cell.transparent ? semiTransparent : undefined,
        );
      }
    }
  }
}
