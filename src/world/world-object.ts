import { Box2dObject, drawTile, vec2, Vector2 } from "littlejsengine";
import type { IWorld } from "./world.types";
import { cliffHeightObliqueOffsets } from "./renderers/cliff-height-oblique-offsets";

/** An object that can be placed and rendered in the world with perspective */
export class WorldObject extends Box2dObject {
  protected readonly _world: IWorld;

  /** The cliff height of the cell this object is currently located in. */
  public cliffHeight = 0;

  /** The ramp height for this object (0 if not currently on a ramp) */
  private _rampHeight = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(pos: Vector2, bodyType: any, world: IWorld) {
    super(pos, undefined, undefined, undefined, undefined, bodyType);
    this._world = world;
  }

  override update(): void {
    super.update();
    const pos = this.getCenterOfMass();

    this.cliffHeight = this._world.getCell(pos).cliffHeight;
    this._rampHeight = this._world.getRampHeight(pos);
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
    switch (this._world.perspective) {
      case "topdown":
        return pos;
      case "topdown-oblique":
        return pos
          .add(vec2(0, cliffHeightObliqueOffsets[this.cliffHeight]))
          .add(vec2(0, this._rampHeight));
    }
  }
}
