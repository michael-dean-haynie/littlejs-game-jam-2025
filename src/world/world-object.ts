import { Box2dObject, drawTile, vec2, Vector2 } from "littlejsengine";
import { cliffHeightObliqueOffsets } from "./renderers/cliff-height-oblique-offsets";
import { world } from "./world";

/** An object that can be placed and rendered in the world with perspective */
export class WorldObject extends Box2dObject {
  /** The cliff height of the cell this object is currently located in. */
  public cliffHeight = 0;

  /** The ramp height for this object (0 if not currently on a ramp) */
  private _rampHeight = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(pos: Vector2, bodyType: any) {
    super(pos, undefined, undefined, undefined, undefined, bodyType);
  }

  override update(): void {
    super.update();
    const pos = this.getCenterOfMass();

    this.cliffHeight = world.getCell(pos).cliffHeight;
    this._rampHeight = world.getRampHeight(pos);
    const rampRenderOrder = this._rampHeight > 0 ? 1 : 0;

    this.renderOrder = this.cliffHeight + rampRenderOrder;
  }

  override render(): void {
    // note: coppied from default impl - just updated the pos argument
    drawTile(
      this.getPerspectivePos(),
      this.drawSize || this.size,
      this.tileInfo,
      this.color,
      this.angle,
      this.mirror,
      this.additiveColor,
    );
  }

  public getPerspectivePos(): Vector2 {
    const pos = this.getCenterOfMass();
    switch (world.perspective) {
      case "topdown":
        return pos;
      case "topdown-oblique":
        return pos
          .add(vec2(0, cliffHeightObliqueOffsets[this.cliffHeight]))
          .add(vec2(0, this._rampHeight));
    }
  }
}
